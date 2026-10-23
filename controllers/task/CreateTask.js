const mongoose = require("mongoose");
const Task = require("../../models/task");
const Project = require("../../models/project");
const User = require("../../models/user");

async function toCreateTask(req, res) {
    try {
        const {
            title,
            description,
            projectId,
            assignedTo,
            priority,
            dueDate,
            attachments
        } = req.body;

        const userId = req.user._id || req.user.id;

        if (!title || !description || !projectId || !assignedTo || !priority || !dueDate) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }

        if (
            !mongoose.Types.ObjectId.isValid(projectId) ||
            !mongoose.Types.ObjectId.isValid(assignedTo)
        ) {
            return res.status(400).json({ success: false, message: "Invalid IDs" });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // Only owner can create task
        if (project.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        // Check assigned user is member
        const isAssignedMember = project.members.some(
          (member) => member.user.toString() === assignedTo.toString()
        );

        if (!isAssignedMember) {
            return res.status(400).json({ success: false, message: "User not in project" });
        }

        const assignedUser = await User.findById(assignedTo).select("fullName email");
        if (!assignedUser) {
            return res.status(404).json({ success: false, message: "Assigned user not found" });
        }

        const task = await Task.create({
            title,
            description,
            projectId,
            assignedTo,
            createdBy: userId,
            priority,
            dueDate,
            attachments: attachments || []
        });

        return res.status(201).json({
            success: true,
            message: "Task created",
            data: task
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


module.exports = toCreateTask;