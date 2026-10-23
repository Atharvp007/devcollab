const Project = require("../../models/project");
const { pushNotification } = require("../../services/notify");


async function toRejectRequest(req,res){
    const {id:projectId,userId}=req.params;
    try{
        const project=await Project.findById(projectId);
        const user=req.user;
        if(!project){
            return res.status(404).json({error:'Project not found'});
        }
        // console.log("project",project);
        
        // console.log("user: ",user);
        // console.log("join request: ",project.joinRequests);
        
        const request=project.joinRequests.find(req=>req.user.toString()===userId);
    
        if(!request){
            return res.status(404).json({error:'request not found'});
        }
        if(request.status==="rejected"){
            return res.json({message:"request already rejected"})
        }
                                         
        // request.status='rejected';

        await Project.findByIdAndUpdate(projectId, {
            $pull: { joinRequests: {user:userId }}
        });

        try {
          await pushNotification(userId, {
            type: "request-rejected",
            title: "Request rejected",
            message: `${project.title || "Project"} rejected your request`,
            link: `/projects/view-project/${projectId}`,
            meta: { projectId },
          });
        } catch (e) {
          console.error("notify reject error", e);
        }

        return res.status(201).json({message:'request rejected'});
    }
    catch(error){
        console.error('Error rejecting request:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = {
    toRejectRequest,
}
