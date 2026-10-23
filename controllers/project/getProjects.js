const Project = require("../../models/project")

// GET /project/explore
const getExploreProjects = async (req, res) => {
  try {
    const userId = req.user?.id;

    let query = {
      status: "open",
      // isDeleted: { $ne: true }
    };

    if (userId) {
      query.members = {
        $not: {
          $elemMatch: { user: userId }
        }
      };
    }

    const projects = await Project.find(query)
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    res.json({ projects });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getExploreProjects }