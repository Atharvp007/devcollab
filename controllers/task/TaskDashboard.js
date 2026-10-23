const Task = require("../../models/task")

async function togetDashboardStats(req, res){
  try {
    const { projectId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const totalTasks = await Task.countDocuments({ projectId });

    const dueTodayTasks = await Task.find({
      projectId,
      dueDate: { $gte: today, $lt: tomorrow }
    });

    const overdueTasks = await Task.find({
      projectId,
      dueDate: { $lt: today },
      status: { $ne: "completed" }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalTasks,
        dueTodayCount: dueTodayTasks.length,
        overdueCount: overdueTasks.length,
        dueTodayTasks,
        overdueTasks
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = togetDashboardStats;