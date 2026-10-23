const Project = require("../../models/project")
const User = require("../../models/user")

const getOwnedProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await Project.find({
      createdBy:userId,  
    })
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    res.json({ projects });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {getOwnedProjects}

