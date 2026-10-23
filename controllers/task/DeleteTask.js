const Task = require("../../models/task")

async function toDeleteTask(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const taskId = req.params.taskId || req.query.taskId;
    const userId = req.user._id || req.user.id;

    console.log("User id" + userId);


    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.createdBy?.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Only owner can delete" });
    }

    await Task.findByIdAndDelete(taskId);

    return res.status(200).json({
      success: true,
      message: "Task deleted"
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = toDeleteTask