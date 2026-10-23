const Notification = require("../../models/notification");

async function getNotifications(req, res) {
  try {
    // here parseInt(req.query.limit, 10) => take value as decimal
    // after that if value is not there take default value 50
    // and tak min with 200
    // that means it allows at max 200 notification in notification bar.

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit) // top limit notifications
      .lean(); // lean means we are not converting it to **mongoose document** it keeps js object,so we can`t use methods like .save(),etc

      // here we used map bcoz we just shared things to fontend that are required
    const mapped = notifications.map((n) => ({
      id: n._id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      meta: n.meta,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));

    res.json({ notifications: mapped });
  } catch (err) {
    console.error("getNotifications error", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
}

module.exports = { getNotifications };
