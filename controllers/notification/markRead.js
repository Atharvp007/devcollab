const Notification = require("../../models/notification");

async function markRead(req, res) {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (ids.length === 0) {
      return res.status(400).json({ error: "ids array required" });
    }
    await Notification.updateMany(
      { _id: { $in: ids }, user: req.user._id },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("markRead error", err);
    res.status(500).json({ error: "Failed to mark notifications read" });
  }
}

async function markAllRead(req, res) {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (err) {
    console.error("markAllRead error", err);
    res.status(500).json({ error: "Failed to mark all notifications read" });
  }
}

module.exports = { markRead, markAllRead };
