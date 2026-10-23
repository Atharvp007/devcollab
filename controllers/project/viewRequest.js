const Project = require("../../models/project");


async function toViewRequest(req,res){
    try{
        const ProjectId=req.params.id;

        const project=await Project.findById(ProjectId)
                      .populate('joinRequests.user','fullName email');

        if(!project){
            return res.status(404).json({error:'Project not found'})
        }

        const pendingRequests=project.joinRequests.filter(req=>req.status==='pending');

        return res.status(201).json(pendingRequests);
    }catch(error){
        console.error('Failed to fetch join requests:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }    
}

module.exports = {
    toViewRequest,
}