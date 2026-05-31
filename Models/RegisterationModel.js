const mongoose= require('mongoose')
const bcrypt=require('bcrypt')
const jwt = require("jsonwebtoken");
const { JWT_KEY } = require("../config/Variableconfig")
const UserDetails=new mongoose.Schema({
name:{
    type:String,
    required:true
},
role:{
    type:String,
    enum:{
        values:['ADMIN','MANAGER','MEMBER'],
        message:'kindly select valid role'
    }
},
email:{
    type:String,
    unique:true,
    required:true
},
password:{
    type:String,
    required:true
},
isActive:{
    type:Boolean,
    default:true
}
})
UserDetails.methods.getJWT = async function () {
  const user = this;

  if (!JWT_KEY) {
    throw new Error("JWT_KEY is missing in .env");
  }

  const token = await jwt.sign({ _id: user._id }, JWT_KEY, {
    expiresIn: "7d",
  });

  return token;
};

UserDetails.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );

  return isPasswordValid;
};

module.exports=mongoose.model('UserDetails',UserDetails)
