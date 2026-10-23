
const User = require("../../models/user");

async function toSignUp(req,res) {
    const {fullName,email,password}=req.body;
    await User.create({
        fullName,
        email,
        password,
    })

    return res.status(201).json({message:'account created successfully'});
}

module.exports = {
    toSignUp,
}