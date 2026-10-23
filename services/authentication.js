const JWT=require('jsonwebtoken');


const secret = process.env.JWT_SECRET;

function createTokenForUser(user){
    const payLoad={
        _id:user._id,
        fullName:user.fullName,
        email:user.email,
        profileImage:user.profileImage,
    };

    const token=JWT.sign(payLoad,secret);
    return token;
}

function verifyToken(token){
    try{
        const payLoad=JWT.verify(token,secret);
        // console.log('payload',payLoad);
        
        return payLoad;
    }catch(error){
        console.log('JWT verification error',error.message);
        return null;
    }
}

module.exports={
    createTokenForUser,
    verifyToken,
}