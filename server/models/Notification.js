const mongoose = require('mongoose');

/**
 * Notification Schema
 * Represents user alerts for invitations, assignments, status changes, and comments.
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: [
        'invitation',
        'invitation_response',
        'member_added',
        'task_assigned',
        'task_status',
        'comment',
        'project_update',
        'general'
      ],
      default: 'general'
    },
    title: {
      type: String,
      default: 'Notification'
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: ''
    },
    // Extra data for actions, e.g. { invitationId, projectId }
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
