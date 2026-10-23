const User = require("../../models/user");

async function getProfile(req,res){
    try{
        if (!req.user) {
            return res.status(401).json({error: 'Authentication required'});
        }

        const userId=req.user._id;
        const user=await User.findById(userId).select('-password -salt -createdAt -updatedAt');

        if(!user) return res.status(404).json({error:'user not found'});
        return res.json(user);
    }catch(error){
        console.error("error fetching own profile:", error);
        return res.status(500).json({error:'internal server error'});
    }
}

module.exports = {
    getProfile,
}

