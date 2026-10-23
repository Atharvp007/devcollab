const Message = require("../../models/message");

async function getMessages(req, res) {
    try {
        const { projectId } = req.params;
        const messages = await Message.find({ project: projectId })
            .populate('sender', 'fullName profileImage')
            .sort({ timestamp: 1 });
        res.status(200).json({ messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getMessages };