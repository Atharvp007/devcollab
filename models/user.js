const {Schema,model}=require("mongoose");

const {createHmac,randomBytes}=require('crypto');
const {createTokenForUser}=require('../services/authentication')

const userSchema=new Schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    salt:{
        type:String,
    },
    //this can be edited after signup
    bio:{
        type:String,
        default:"",
    },
    skills:{
        type:String,
        default:"",
    },
    githubURL:{
        type:String,
        default:"",
    },
    linkedinURL:{
        type:String,
        default:"",
    },
    resumeURL:{
        type:String,
        default:"",
    },
    profileImage:{
        type:String,
        default:"",
    },
    resetPasswordToken:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
    },
    resetPasswordOTPHash:{
        type:String,
    },
    resetPasswordOTPExpires:{
        type:Date,
    },
    ownedProjects:[{
        type: Schema.Types.ObjectId,
        ref: 'Project',
    }],
    joinedProjects:[{
        type: Schema.Types.ObjectId,
        ref: 'Project',
    }],
    projects:{
        type:String,
    }
},{timestamps:true});

//after signup =>we will hash password
userSchema.pre("save",function(next){
    const user=this;

    if(!user.isModified("password")) return next();//if user hasn`t changed password then we dont need to change it again

    const salt=randomBytes(16).toString();
    const hashedPassword=createHmac('sha256',salt)
    .update(this.password)
    .digest('hex');

    user.salt=salt;//here it stores generated salt as we can use later to check (match password)
    user.password=hashedPassword;

    next();
});

//custom static method (which we will explicitely call later)
userSchema.static('matchPasswordandGenerateToken',async function(email,password){
    const user=await this.findOne({email});

    if(!user) throw new Error('user not found');
    

    const salt=user.salt;
    const hashedPassword=user.password;

    const providedHash=createHmac('sha256',salt)
    .update(password)
    .digest('hex');

    if(hashedPassword!==providedHash) throw new Error('Password is incorrect');

    const token=createTokenForUser(user);

    return token;
})

const User=model("user",userSchema);

module.exports=User;




