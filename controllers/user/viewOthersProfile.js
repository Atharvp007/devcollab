const User = require("../../models/user");


async function toViewOthersProfile(req,res){
     try{
        const {id:userId}=req.params;
        const user=await User.findById(userId).select('fullName email bio skills githubURL linkedinURL resumeURL profileImage projects');

        if(!user) return res.status(404).json({error:'user not found'});
        return res.json(user);
    }catch(error){
        console.error("error faitching other`s profile");
        return res.status(500).json({error:'internal server error'});
    }
}

module.exports = {
    toViewOthersProfile,
}
