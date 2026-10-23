const Project = require("../../models/project");
const { pushNotification } = require("../../services/notify");

async function toSendRequest(req, res) {

    try {

        const userId = req.user._id;
        const { message, role } = req.body;

        const project = await Project.findById(req.body.projectId);

        if (!project) {
            return res.status(404).json({ message: 'project not found' });
        }

        // Owner can't send join request to own project
        if (project.createdBy.toString() === userId.toString()) {
            return res.status(403).json({ message: 'Project owner cannot request to join the same project' });
        }

        const alreadyRequested = project.joinRequests.some(
            r =>
                r.user.toString() === userId.toString() &&
                r.status === "pending"
        );
        const alreadyMember = project.members.some(m => m.user.toString() === userId.toString());

        if (alreadyRequested || alreadyMember) {
            return res.status(400).json({
                success: false,
                message: "Already requested or already a member"
            });
        }

        if (project.createdBy.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "Owner cannot send request"
            });
        }

        // If specific roles are defined, enforce role selection and availability
        if (Array.isArray(project.requiredRoles) && project.requiredRoles.length > 0) {
            if (!role) {
                return res.status(400).json({ message: "Please select a role to apply for" });
            }
            const match = project.requiredRoles.find((r) => r.role === role);
            if (!match) {
                return res.status(400).json({ message: "Selected role is no longer available" });
            }
            const pendingCount = project.joinRequests.filter(
                (r) => r.role === role && r.status === "pending"
            ).length;
            const seatsLeft = (match.count || 0) - pendingCount;
            if (seatsLeft <= 0) {
                return res.status(400).json({ message: "Selected role is already filled or pending slots are full" });
            }
        }

        project.joinRequests.push({ user: userId, message: message, role });
        await project.save();//this will save changes

        // notify project owner about incoming request
        try {
            const ownerId = project.createdBy?.toString?.() || project.createdBy;
            if (ownerId && ownerId.toString() !== userId.toString()) {
                const requesterName = req.user.fullName || req.user.email || "Someone";
                const roleText = role ? ` for ${role}` : "";
                await pushNotification(ownerId, {
                    type: "join-request",
                    title: "New join request",
                    message: `${requesterName} requested to join ${project.title || "your project"}${roleText}.`,
                    link: "/requests",
                    meta: { projectId: project._id, requesterId: userId, role },
                });
            }
        } catch (e) {
            console.error("notify join request error", e);
        }

        return res.status(200).json({ message: 'join request sent successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    toSendRequest,
}
