const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    type: {
      type: String,
      enum: ["chat", "join-request", "request-accepted", "request-rejected"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String }, // it routes to related page from that notification has arrived
    meta: { type: Object, default: {} },
    isRead: { type: Boolean, default: false }, // to mark as read/unread
  },
  { timestamps: true }
);

module.exports = mongoose.model("notification", notificationSchema);
