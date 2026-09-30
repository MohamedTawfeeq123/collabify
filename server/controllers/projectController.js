const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Invitation = require('../models/Invitation');
const createNotification = require('../utils/createNotification');

// Clean a team name: trim, collapse spaces, max 40 chars, default "General"
const normalizeTeam = (team) => {
  const cleaned = (team || '').toString().replace(/\s+/g, ' ').trim().slice(0, 40);
  return cleaned || 'General';
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, status, priority } = req.body;

    const project = await Project.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      startDate: startDate || Date.now(),
      endDate: endDate || null,
      status: status || 'Active',
      priority: priority || 'Medium',
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'Owner',
          team: 'Management',
          joinedAt: new Date()
        }
      ]
    });

    // Record activity log
    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'created_project',
      description: `${req.user.fullName} created the project "${project.name}".`
    });

    await project.populate('owner', 'fullName username email employeeId department designation profilePicture');
    await project.populate('members.user', 'fullName username email employeeId department designation profilePicture');

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects for authenticated user (with search, filters, pagination)
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    const { search, status, priority, sort, page = 1, limit = 10 } = req.query;

    const query = {
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    };

    if (search && search.trim()) {
      query.$and = [
        {
          $or: [
            { name: { $regex: search.trim(), $options: 'i' } },
            { description: { $regex: search.trim(), $options: 'i' } }
          ]
        }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'name') {
      sortOptions = { name: 1 };
    } else if (sort === 'priority') {
      sortOptions = { priority: 1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('owner', 'fullName username employeeId profilePicture')
      .populate('members.user', 'fullName username employeeId profilePicture')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Calculate task progress for each project
    const projectIds = projects.map((p) => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } });

    const projectsWithStats = projects.map((proj) => {
      const projTasks = tasks.filter(
        (t) => t.project.toString() === proj._id.toString()
      );
      const totalTasks = projTasks.length;
      const completedTasks = projTasks.filter(
        (t) => t.status === 'Completed'
      ).length;
      const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

      return {
        ...proj.toObject(),
        taskCount: totalTasks,
        completedTaskCount: completedTasks,
        progress
      };
    });

    return res.status(200).json({
      success: true,
      data: projectsWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project details by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'fullName username email employeeId department designation profilePicture')
      .populate('members.user', 'fullName username email employeeId department designation profilePicture');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if user is owner or member
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this project'
      });
    }

    const tasks = await Task.find({ project: project._id });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
    const todoTasks = tasks.filter((t) => t.status === 'Todo').length;
    const reviewTasks = tasks.filter((t) => t.status === 'Review').length;
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const currentUserMember = project.members.find(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    const userRole = isOwner ? 'Owner' : currentUserMember ? currentUserMember.role : 'Viewer';

    return res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        userRole,
        stats: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          reviewTasks,
          progress
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project details
 * @route   PUT /api/projects/:id
 * @access  Private (Owner/Admin)
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check permission: Owner or Admin
    const isOwner = project.owner.toString() === req.user._id.toString();
    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    const isAdmin = member && member.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only project Owner or Admin can update project details.'
      });
    }

    const { name, description, startDate, endDate, status, priority } = req.body;

    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (startDate) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;
    if (status) project.status = status;
    if (priority) project.priority = priority;

    const updated = await project.save();

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'updated_project',
      description: `${req.user.fullName} updated project settings.`
    });

    await updated.populate('owner', 'fullName username email employeeId department designation profilePicture');
    await updated.populate('members.user', 'fullName username email employeeId department designation profilePicture');

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (Owner only)
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only owner can delete project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only project Owner can delete this project.'
      });
    }

    // Cascade delete related records
    await Task.deleteMany({ project: project._id });
    await Activity.deleteMany({ project: project._id });
    await Invitation.deleteMany({ project: project._id });

    await project.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add / invite a team member using Employee ID and/or account detail
 *          (Gmail address or username).
 *          - Default: sends an invitation (invitee gets a live notification with Accept / Decline)
 *          - addDirectly=true: adds the person to the team immediately (they are notified)
 * @route   POST /api/projects/:id/invite
 * @access  Private (Owner/Admin)
 * @body    { employeeId?, email?, username?, emailOrUsername?, role?, addDirectly? }
 */
const inviteMember = async (req, res, next) => {
  try {
    const { employeeId, email, username, emailOrUsername, addDirectly = false } = req.body;
    const team = normalizeTeam(req.body.team);
    const role = ['Admin', 'Member', 'Viewer'].includes(req.body.role) ? req.body.role : 'Member';

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check permission
    const isOwner = project.owner.toString() === req.user._id.toString();
    const currentMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isOwner && (!currentMember || currentMember.role !== 'Admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only Owner or Admin can add team members.'
      });
    }

    // Build the search conditions from whatever identifiers were supplied
    const conditions = [];
    if (employeeId && employeeId.trim()) {
      conditions.push({ employeeId: employeeId.trim().toUpperCase() });
    }
    if (email && email.trim()) {
      conditions.push({ email: email.trim().toLowerCase() });
    }
    if (username && username.trim()) {
      conditions.push({ username: username.trim().toLowerCase() });
    }
    // Backward compatibility with the old single "email or username" field
    if (emailOrUsername && emailOrUsername.trim()) {
      const q = emailOrUsername.trim();
      conditions.push({ email: q.toLowerCase() }, { username: q.toLowerCase() }, { employeeId: q.toUpperCase() });
    }

    if (conditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter an Employee ID or Gmail address.'
      });
    }

    const invitedUser = await User.findOne({ $or: conditions });

    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: 'No user found with the given Employee ID / account detail.'
      });
    }

    // If BOTH an Employee ID and an email were typed, they must belong to the same person
    if (employeeId && employeeId.trim() && email && email.trim()) {
      const sameId = invitedUser.employeeId === employeeId.trim().toUpperCase();
      const sameEmail = invitedUser.email === email.trim().toLowerCase();
      if (!sameId || !sameEmail) {
        return res.status(400).json({
          success: false,
          message: 'The Employee ID and Gmail address belong to different accounts.'
        });
      }
    }

    if (invitedUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot add yourself.' });
    }

    // Check if user is already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === invitedUser._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: `${invitedUser.fullName} is already a member of this project.`
      });
    }

    // ---------- Option A: add immediately ----------
    if (addDirectly) {
      project.members.push({ user: invitedUser._id, role, team, joinedAt: new Date() });
      await project.save();

      // Close any pending invitation for the same person
      await Invitation.updateMany(
        { project: project._id, invitedUser: invitedUser._id, status: 'pending' },
        { status: 'accepted' }
      );

      await createNotification({
        recipient: invitedUser._id,
        sender: req.user._id,
        type: 'member_added',
        title: 'Added to Project',
        message: `${req.user.fullName} added you to "${project.name}" (${team}) as ${role}.`,
        link: `/projects/${project._id}`,
        data: { projectId: project._id }
      });

      await Activity.create({
        project: project._id,
        user: req.user._id,
        action: 'joined_project',
        description: `${req.user.fullName} added ${invitedUser.fullName} to the "${team}" team as ${role}.`
      });

      return res.status(201).json({
        success: true,
        message: `${invitedUser.fullName} was added to the team.`,
        added: true
      });
    }

    // ---------- Option B: send invitation ----------
    const existingInvitation = await Invitation.findOne({
      project: project._id,
      invitedUser: invitedUser._id,
      status: 'pending'
    });
    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'An invitation is already pending for this user.'
      });
    }

    const invitation = await Invitation.create({
      project: project._id,
      invitedUser: invitedUser._id,
      invitedBy: req.user._id,
      role,
      team
    });

    // Live notification with Accept / Decline data
    await createNotification({
      recipient: invitedUser._id,
      sender: req.user._id,
      type: 'invitation',
      title: 'Project Invitation',
      message: `${req.user.fullName} invited you to join "${project.name}" (${team}) as ${role}.`,
      link: '/dashboard',
      data: { invitationId: invitation._id, projectId: project._id, projectName: project.name, role, team }
    });

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'invited_member',
      description: `${req.user.fullName} invited ${invitedUser.fullName} to join the project.`
    });

    return res.status(201).json({
      success: true,
      message: `Invitation sent to ${invitedUser.fullName} successfully.`,
      data: invitation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change role of a project member
 * @route   PUT /api/projects/:id/members/:memberId/role
 * @access  Private (Owner only)
 */
const updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can change member roles.'
      });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.params.memberId
    );

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in project' });
    }

    if (['Admin', 'Member', 'Viewer'].includes(role)) {
      member.role = role;
      await project.save();

      return res.status(200).json({
        success: true,
        message: 'Member role updated successfully.'
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Move a member to another team (or rename their team)
 * @route   PUT /api/projects/:id/members/:memberId/team
 * @access  Private (Owner/Admin)
 */
const updateMemberTeam = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const me = project.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!isOwner && (!me || me.role !== 'Admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only Owner or Admin can change teams.'
      });
    }

    const member = project.members.find((m) => m.user.toString() === req.params.memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in project' });
    }

    const team = normalizeTeam(req.body.team);
    member.team = team;
    await project.save();

    await createNotification({
      recipient: req.params.memberId,
      sender: req.user._id,
      type: 'project_update',
      title: 'Team Changed',
      message: `${req.user.fullName} moved you to the "${team}" team in "${project.name}".`,
      link: `/projects/${project._id}`
    });

    return res.status(200).json({
      success: true,
      message: `Member moved to "${team}" team.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove member from project
 * @route   DELETE /api/projects/:id/members/:memberId
 * @access  Private (Owner/Admin or self)
 */
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isSelf = req.user._id.toString() === req.params.memberId;

    if (!isOwner && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot remove this member.'
      });
    }

    // Owner cannot be removed
    if (project.owner.toString() === req.params.memberId) {
      return res.status(400).json({
        success: false,
        message: 'The project owner cannot be removed.'
      });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.memberId
    );

    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'removed_member',
      description: isSelf
        ? `${req.user.fullName} left the project.`
        : `${req.user.fullName} removed a member from the project.`
    });

    return res.status(200).json({
      success: true,
      message: 'Member removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's pending invitations
 * @route   GET /api/projects/invitations/my
 * @access  Private
 */
const getMyInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({
      invitedUser: req.user._id,
      status: 'pending'
    })
      .populate('project', 'name description status priority')
      .populate('invitedBy', 'fullName username email employeeId department designation profilePicture')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: invitations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Respond to project invitation (accept/reject)
 * @route   PUT /api/projects/invitations/:invitationId/respond
 * @access  Private
 */
const respondToInvitation = async (req, res, next) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const invitation = await Invitation.findById(req.params.invitationId).populate('project');

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (invitation.invitedUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this invitation'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This invitation has already been answered.'
      });
    }

    // Mark the related invitation notification as read (it has been handled)
    const Notification = require('../models/Notification');
    await Notification.updateMany(
      { recipient: req.user._id, type: 'invitation', 'data.invitationId': invitation._id },
      { isRead: true }
    );

    if (action === 'accept') {
      invitation.status = 'accepted';
      await invitation.save();

      const project = await Project.findById(invitation.project._id);
      if (project) {
        const isAlreadyMember = project.members.some(
          (m) => m.user.toString() === req.user._id.toString()
        );
        if (!isAlreadyMember) {
          project.members.push({
            user: req.user._id,
            role: invitation.role || 'Member',
            team: invitation.team || 'General',
            joinedAt: new Date()
          });
          await project.save();
        }

        await Activity.create({
          project: project._id,
          user: req.user._id,
          action: 'joined_project',
          description: `${req.user.fullName} accepted the invitation and joined the project.`
        });
      }

      await createNotification({
        recipient: invitation.invitedBy,
        sender: req.user._id,
        type: 'invitation_response',
        title: 'Invitation Accepted',
        message: `${req.user.fullName} accepted your invitation to "${invitation.project.name}".`,
        link: `/projects/${invitation.project._id}`
      });

      return res.status(200).json({
        success: true,
        message: 'Invitation accepted! Welcome to the project.',
        projectId: invitation.project._id
      });
    } else if (action === 'reject') {
      invitation.status = 'rejected';
      await invitation.save();

      await createNotification({
        recipient: invitation.invitedBy,
        sender: req.user._id,
        type: 'invitation_response',
        title: 'Invitation Declined',
        message: `${req.user.fullName} declined your invitation to "${invitation.project.name}".`,
        link: `/projects/${invitation.project._id}`
      });

      return res.status(200).json({
        success: true,
        message: 'Invitation declined.'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be accept or reject.'
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  inviteMember,
  updateMemberRole,
  updateMemberTeam,
  removeMember,
  getMyInvitations,
  respondToInvitation
};
