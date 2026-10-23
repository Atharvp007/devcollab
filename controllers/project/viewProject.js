
const Project = require("../../models/project");

async function toViewProject(req,res){
    try{
        const userId = req.user ? req.user._id : null;
        const projectId = req.params.id;
        if(!projectId){
            return res.status(400).json({message:'project id not found'})
        }
        const project=await Project.findById(projectId)
                      .populate('createdBy','fullName email')
                      .populate('members.user','fullName email');
        
        if(!project){
            return res.status(400).json({message:'project not found'})
        }
    
        const isOwner = userId && project.createdBy && project.createdBy._id.toString() === userId.toString();
        const isMember = userId && Array.isArray(project.members) && project.members.some((m) => {
            const memberUser = m.user && m.user._id ? m.user._id : m.user;
            return memberUser && memberUser.toString() === userId.toString();
        });

        const membersCount = Array.isArray(project.members) ? project.members.length : 0;
        
        const response = {
            _id: project._id,
            title: project.title,
            description: project.description,
            techStack: project.techStack || [],
            requiredRoles: project.requiredRoles || [],
            status: project.status || "open",
            createdBy: project.createdBy,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            joinRequests: project.joinRequests || [],
            membersCount,
        };

        if (isOwner || isMember) {
            response.members = project.members;
            response.membersRestricted = false;
        } else {
            response.members = [];
            response.membersRestricted = true;
        }

        return res.status(200).json(response);
    }catch(error){
        return res.status(500).json({message:'server error'});
    }
}


module.exports = {
    toViewProject,
}
