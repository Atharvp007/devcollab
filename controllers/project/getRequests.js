const Project = require("../../models/project");

async function getRequests(req, res) {
  try {
    const userId = req.user._id;

    // Incoming: pending requests for projects owned by the user
    const ownedProjects = await Project.find({ createdBy: userId })
      .populate("joinRequests.user", "fullName email")
      .select("title joinRequests");

    const incoming = [];
    ownedProjects.forEach((project) => {
      project.joinRequests.forEach((reqDoc) => {
        if (reqDoc.status === "pending") {
          incoming.push({
            id: reqDoc._id.toString(),
            projectId: project._id.toString(),
            project: project.title,
            user: reqDoc.user,
            message: reqDoc.message,
            role: reqDoc.role,
            status: reqDoc.status,
            sentAt: reqDoc.updatedAt || project.updatedAt || null,
          });
        }
      });
    });

    // Outgoing: all requests sent by current user
    const outgoingProjects = await Project.find({ "joinRequests.user": userId })
      .populate("joinRequests.user", "fullName email")
      .select("title joinRequests");

    const outgoing = [];
    outgoingProjects.forEach((project) => {
      project.joinRequests.forEach((reqDoc) => {
        if (reqDoc.user && reqDoc.user._id.toString() === userId.toString()) {
          outgoing.push({
            id: reqDoc._id.toString(),
            projectId: project._id.toString(),
            project: project.title,
            techStack: project.techStack || [],
            role: reqDoc.role,
            status: reqDoc.status,
            sentAt: reqDoc.updatedAt || project.updatedAt || null,
          });
        }
      });
    });

    return res.status(200).json({ incoming, outgoing });
  } catch (error) {
    console.error("Error fetching request list:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { getRequests };
