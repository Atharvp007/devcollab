const mongoose = require("mongoose");
const Task = require("../../models/task")
const Project = require("../../models/project")

async function toGetTask(req, res) {
    try {
        const { projectId } = req.query;
        const { status, priority, search } = req.query;

        if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ success: false, message: "Invalid projectId" });
        }

        const query = {};
        if (projectId) query.projectId = projectId;

        if (status) query.status = status;
        if (priority) query.priority = priority;

        if (search) { // regex - regular expression (i means case insensitive)
            query.title = { $regex: search, $options: "i" };
        }

        const tasks = await Task.find(query)
            .populate("assignedTo", "fullName email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: tasks
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = toGetTask;