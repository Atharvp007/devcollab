const express = require("express");
const { getNotifications } = require("../controllers/notification/getNotifications");
const { markRead, markAllRead } = require("../controllers/notification/markRead");

const router = express.Router();

router.get("/", getNotifications);
router.post("/mark-read", markRead);
router.post("/mark-all-read", markAllRead);

module.exports = router;
