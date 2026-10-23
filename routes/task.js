const express = require("express")
const router = express.Router();


const toCreateTask = require("../controllers/task/CreateTask")
const toDeleteTask = require("../controllers/task/DeleteTask")
const toGetTask = require("../controllers/task/GetTask")
const togetDashboardStats = require("../controllers/task/TaskDashboard")
const toUpdateTaskStatus = require("../controllers/task/UpdateTaskStatus")

router.post("/create-task", toCreateTask)
router.get("/get-tasks", toGetTask)
router.get("/dashboard-stats/:projectId", togetDashboardStats)

router.patch("/update-task-status/:taskId", toUpdateTaskStatus)
router.delete("/delete-task/:taskId", toDeleteTask)

module.exports=router;