const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const createNotification = require('../utils/createNotification');

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignedTo, project, dueDate, tags } = req.body;

    if (!project) {
      return res.status(400).json({ success: false, message: 'Project ID is required' });
    }

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify user belongs to project
    const isMember =
      projectDoc.owner.toString() === req.user._id.toString() ||
      projectDoc.members.some((m) => m.user.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You must be a project member to create tasks.'
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'Todo',
      priority: priority || 'Medium',
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      project,
      dueDate: dueDate || null,
      tags: Array.isArray(tags) ? tags : []
    });

    // Activity log
    await Activity.create({
      project: projectDoc._id,
      user: req.user._id,
      action: 'created_task',
      description: `${req.user.fullName} created task "${task.title}".`
    });

    // Send notification to assignee
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: assignedTo,
        sender: req.user._id,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `${req.user.fullName} assigned you to "${task.title}".`,
        link: `/tasks/${task._id}`
      });
    }

    await task.populate('assignedTo', 'fullName username email profilePicture');
    await task.populate('createdBy', 'fullName username email profilePicture');
    await task.populate('project', 'name');

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks with filtering, search, sorting, and pagination
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, assignedTo, search, sort, page = 1, limit = 50 } = req.query;

    const query = {};

    if (project) {
      query.project = project;
    } else {
      // Find all projects where user is owner or member
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      query.project = { $in: projectIds };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (assignedTo) {
      if (assignedTo === 'me') {
        query.assignedTo = req.user._id;
      } else if (assignedTo !== 'All') {
        query.assignedTo = assignedTo;
      }
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'dueDate') {
      sortOption = { dueDate: 1 };
    } else if (sort === 'priority') {
      sortOption = { priority: 1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('assignedTo', 'fullName username email profilePicture')
      .populate('createdBy', 'fullName username email profilePicture')
      .populate('project', 'name status priority')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      data: tasks,
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
 * @desc    Get single task details
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'fullName username email profilePicture')
      .populate('createdBy', 'fullName username email profilePicture')
      .populate('project', 'name owner members status priority');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check project permission
    const project = task.project;
    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.user.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this task\'s project.'
      });
    }

    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task details (Kanban column move, priority, assignee, etc.)
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, description, status, priority, assignedTo, dueDate, tags } = req.body;

    const oldStatus = task.status;
    const oldAssignee = task.assignedTo ? task.assignedTo.toString() : null;

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (tags !== undefined) task.tags = Array.isArray(tags) ? tags : [];

    const updatedTask = await task.save();

    // Activity logging for status change or update
    if (status && status !== oldStatus) {
      await Activity.create({
        project: task.project._id,
        user: req.user._id,
        action: 'moved_task',
        description: `${req.user.fullName} moved "${task.title}" to ${status}.`
      });

      // Notify task assignee of status change
      if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
        await createNotification({
          recipient: task.assignedTo,
          sender: req.user._id,
          type: 'task_status',
          title: 'Task Status Updated',
          message: `${req.user.fullName} moved "${task.title}" to ${status}.`,
          link: `/tasks/${task._id}`
        });
      }
    } else {
      await Activity.create({
        project: task.project._id,
        user: req.user._id,
        action: 'updated_task',
        description: `${req.user.fullName} updated task "${task.title}".`
      });
    }

    // Notify new assignee if changed
    if (assignedTo && assignedTo !== oldAssignee && assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: assignedTo,
        sender: req.user._id,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `${req.user.fullName} assigned you to "${task.title}".`,
        link: `/tasks/${task._id}`
      });
    }

    await updatedTask.populate('assignedTo', 'fullName username email profilePicture');
    await updatedTask.populate('createdBy', 'fullName username email profilePicture');
    await updatedTask.populate('project', 'name');

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Delete associated comments
    await Comment.deleteMany({ task: task._id });

    // Activity log
    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: 'deleted_task',
      description: `${req.user.fullName} deleted task "${task.title}".`
    });

    await task.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};
