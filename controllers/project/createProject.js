const Project = require("../../models/project");
const User = require("../../models/user");

async function toCreateProject(req,res){

    try{

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized: please log in" });
        }

        // console.log(req.user);
        const {title,description,techStack,requiredRoles}=req.body;
        const project=await Project.create({
            title,
            description,
            techStack,
            requiredRoles: Array.isArray(requiredRoles)
              ? requiredRoles
                  .filter(r => r && r.role)
                  .map(r => ({
                    role: r.role,
                    count: Number(r.count) || 0
                  }))
              : [],
            createdBy:req.user._id,
            members: [{
                user: req.user._id,
                role: "owner" 
            }]
        })
        console.log('project:',project);
        
        //we have to push project id in owned project
        await User.findByIdAndUpdate(req.user._id,{
            $push:{ownedProjects:project._id}
        });
        
        return res.status(201).json('project created');
    }catch(error){
        return res.status(500).json({error:error.message});
    }
}

module.exports = {
    toCreateProject,
}
