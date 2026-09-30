/**
 * Socket registry
 * Keeps a single reference to the Socket.IO server so ANY controller/helper
 * can push real-time events without needing `req.app.get('io')` passed around.
 * (Previously createNotification() never received `io`, so live notifications
 * were never delivered.)
 */
let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => ioInstance;

module.exports = { setIO, getIO };
