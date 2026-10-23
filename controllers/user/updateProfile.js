
const User = require("../../models/user");

async function toUpdateProfile(req,res){
    if (!req.user) {
        return res.status(401).json({error: 'Authentication required'});
    }

    const userId=req.user._id;
    const {fullName,bio,skills,githubURL,linkedinURL,resumeURL,profileImage}=req.body;

    try{
        const updatedUser=await User.findByIdAndUpdate(userId,
            {fullName
                ,bio
                ,skills
                ,githubURL
                ,linkedinURL
                ,resumeURL
                ,profileImage},
                {new:true,runValidators:true})


                // new:true => bcoz by default it returns old object ,with new:true it gives updated one in updateUser
                // runValidators:true => update query doesn`t check validations ,so this will tell it to check schema definition also.
                // for ex . we have age:int ,min:10 but while updating we put 8 it will pass if we have not check schema definition
        
                
        return res.status(201).json({message:"profile updated successfuly"});
    }catch(error){
        console.error("profile update failed:", error);
        return res.status(500).json({error:'internal server error'});
    }
}

module.exports = {
    toUpdateProfile,
}