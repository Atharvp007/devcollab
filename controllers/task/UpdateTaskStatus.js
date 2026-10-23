const Task = require("../../models/task")
const Project = require("../../models/project")

async function toUpdateTaskStatus(req, res) {
  try {
    const taskId = req.params.taskId || req.query.taskId;
    const { status } = req.body;
    const userId = req.user._id || req.user.id;

    if (!["todo", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Only assigned user, task creator, or project owner can update
    const project = await Project.findById(task.projectId);
    // const isAssignedUser = task.assignedTo?.toString() === userId.toString();
    const isTaskCreator = task.createdBy?.toString() === userId.toString();
    const isProjectOwner = project?.createdBy?.toString() === userId.toString();

    if (!isTaskCreator && !isProjectOwner) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    task.status = status;
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Status updated",
      data: task
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = toUpdateTaskStatus;