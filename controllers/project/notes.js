const Note = require("../../models/note");
const Project = require("../../models/project");

// Helper function to dynamically retrieve io instance without circular dependency issues
function getIO() {
    try {
        const { io } = require("../../index");
        return io;
    } catch (e) {
        return null;
    }
}

async function getNote(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }
    const { projectId } = req.params;
    const userId = req.user._id;

    try {
        // Check if user is a member of the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        const isOwner = project.createdBy && project.createdBy.toString() === userId.toString();
        const isMember = Array.isArray(project.members) && project.members.some(m => {
            const mUser = m && m.user && m.user._id ? m.user._id : (m && m.user ? m.user : null);
            return mUser && mUser.toString() === userId.toString();
        });

        if (!isOwner && !isMember) {
            return res.status(403).json({ error: "Forbidden: Not a project member" });
        }

        // Get or create note
        let note = await Note.findOne({ project: projectId }).populate('updatedBy', 'fullName');
        if (!note) {
            note = new Note({ project: projectId, content: "" });
            await note.save();
        }

        res.status(200).json({
            note: {
                content: note.content,
                updatedBy: note.updatedBy,
                updatedAt: note.updatedAt
            }
        });
    } catch (error) {
        console.error("Get note failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function upsertNote(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }
    const { projectId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    try {
        // Check if user is a member of the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        const isOwner = project.createdBy && project.createdBy.toString() === userId.toString();
        const isMember = Array.isArray(project.members) && project.members.some(m => {
            const mUser = m && m.user && m.user._id ? m.user._id : (m && m.user ? m.user : null);
            return mUser && mUser.toString() === userId.toString();
        });

        if (!isOwner && !isMember) {
            return res.status(403).json({ error: "Forbidden: Not a project member" });
        }

        // Upsert note
        const note = await Note.findOneAndUpdate(
            { project: projectId },
            { content: content || "", updatedBy: userId },
            { new: true, upsert: true, runValidators: true }
        ).populate('updatedBy', 'fullName');

        // Safely emit real-time update if socket IO instance is available
        const socketIO = getIO();
        if (socketIO && typeof socketIO.to === "function") {
            socketIO.to(`project-${projectId}`).emit('note-updated', {
                content: note.content,
                updatedBy: note.updatedBy,
                updatedAt: note.updatedAt
            });
        }

        res.status(200).json({
            message: "Note updated successfully",
            note: {
                content: note.content,
                updatedBy: note.updatedBy,
                updatedAt: note.updatedAt
            }
        });
    } catch (error) {
        console.error("Upsert note failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getNote,
    upsertNote,
};