const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const createNotification = require('../utils/createNotification');

/**
 * @desc    Add comment to a task
 * @route   POST /api/tasks/:taskId/comments
 * @access  Private
 */
const createComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.taskId).populate('project');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = await Comment.create({
      task: task._id,
      user: req.user._id,
      text: text.trim()
    });

    // Activity log
    await Activity.create({
      project: task.project._id,
      user: req.user._id,
      action: 'commented_task',
      description: `${req.user.fullName} commented on task "${task.title}".`
    });

    // Notify task creator and assignee
    const usersToNotify = new Set();
    if (task.createdBy && task.createdBy.toString() !== req.user._id.toString()) {
      usersToNotify.add(task.createdBy.toString());
    }
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      usersToNotify.add(task.assignedTo.toString());
    }

    for (const userId of usersToNotify) {
      await createNotification({
        recipient: userId,
        sender: req.user._id,
        type: 'comment',
        title: 'New Comment',
        message: `${req.user.fullName} commented on "${task.title}".`,
        link: `/tasks/${task._id}`
      });
    }

    await comment.populate('user', 'fullName username email profilePicture');

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comments for a task
 * @route   GET /api/tasks/:taskId/comments
 * @access  Private
 */
const getTaskComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'fullName username profilePicture')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a comment
 * @route   PUT /api/comments/:id
 * @access  Private
 */
const updateComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Only owner of comment can edit
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments.'
      });
    }

    comment.text = text.trim();
    await comment.save();

    await comment.populate('user', 'fullName username profilePicture');

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully.',
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Only author can delete
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments.'
      });
    }

    await comment.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment
};
