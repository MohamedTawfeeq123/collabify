const Notification = require('../models/Notification');
const { getIO } = require('./socketRegistry');

/**
 * Create + save a notification and push it to the recipient in real time.
 * The recipient's personal socket room is their user id (joined on connect).
 * `io` is optional - falls back to the globally registered Socket.IO server.
 */
const createNotification = async ({
  recipient,
  sender,
  type,
  title,
  message,
  link,
  data,
  io
}) => {
  try {
    if (!recipient) return null;

    // Never notify yourself
    if (sender && recipient.toString() === sender.toString()) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title: title || 'Collabify Notification',
      message,
      link: link || '',
      data: data || {}
    });

    await notification.populate('sender', 'fullName username profilePicture');

    const socketServer = io || getIO();
    if (socketServer) {
      socketServer.to(recipient.toString()).emit('newNotification', notification);
    }

    return notification;
  } catch (error) {
    // A failed notification must never break the main request
    console.error('Error creating notification:', error.message);
    return null;
  }
};

module.exports = createNotification;
