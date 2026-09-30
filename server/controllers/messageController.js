const Message = require('../models/Message');
const Project = require('../models/Project');

/**
 * @desc    Get all chat messages for a project
 * @route   GET /api/messages/:projectId
 * @access  Private
 */
const getProjectMessages = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify membership
    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.user.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this project.'
      });
    }

    const messages = await Message.find({ project: projectId })
      .populate('sender', 'fullName username profilePicture')
      .sort({ createdAt: 1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message via HTTP REST API (Fallback or direct)
 * @route   POST /api/messages/:projectId
 * @access  Private
 */
const sendMessage = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const message = await Message.create({
      project: projectId,
      sender: req.user._id,
      text: text.trim()
    });

    await message.populate('sender', 'fullName username profilePicture');

    // Broadcast via socket.io if attached to app
    const io = req.app.get('io');
    if (io) {
      io.to(projectId).emit('receiveMessage', message);
    }

    return res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectMessages,
  sendMessage
};
