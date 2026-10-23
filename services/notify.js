const Notification = require("../models/notification");
const { io } = require("../index");

async function pushNotification(userId, payload) {
  const doc = await Notification.create({
    user: userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    link: payload.link,
    meta: payload.meta || {},
  });

  io.to(`user-${userId}`).emit("notification", {
    id: doc._id,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    link: doc.link,
    meta: doc.meta,
    createdAt: doc.createdAt,
    isRead: doc.isRead,
  });

  return doc;
}

module.exports = { pushNotification };
