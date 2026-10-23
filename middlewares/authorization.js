// const Project=require('../models/project');
function checkForAuthorization (req,res,next){
    const projectId=req.params.id;
    const User=req.user;

    if(!User){
        return res.status(401).json({error:'Unauthorized'});
    }

    try{
        const OwnedProjectIds=User.ownedProjects.map(p=>p.toString());
        if(OwnedProjectIds.includes(projectId)){
            return next();
        }

        return res.status(403).json({error:'Forbidden:Not Project admin '});
    }catch(error){
        console.error('Admin check failed',error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports={
    checkForAuthorization,
}