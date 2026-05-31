const express = require('express');
const Authentication = express.Router();
const UserDetails = require('../Models/RegisterationModel');
const { signupDetailValidation } = require('../Utiles/Validation');
const bcrypt =require('bcrypt')
const { hashingKey } = require('../config/Variableconfig')

//Signup
Authentication.post('/signup', async (req, res) => {
  try {
    signupDetailValidation(req.body);
    const { name, email, password, role } = req.body;
    const Encrpassword=await bcrypt.hash(password, hashingKey)

    const newUser = new UserDetails({ name, email, password:Encrpassword,role});
    await newUser.save();

    res.status(201).send('successfully registered');
  } catch (error) {
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
  }
});
//login
Authentication.post('/login',async (req,res)=>{
      try {
    const { email, password } = req.body;
    const user = await UserDetails.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    if (user.isActive === false) {
      throw new Error("User account is deactivated");
    }
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();
      const userData = user.toObject();
      delete userData.password;

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send(userData);
    } else {
      throw new Error("Invalid credentials");
    }}
    catch(error){
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
 
    }
    
})
//logout
Authentication.post("/logout",(req,res)=>{
try{   
   res.cookie("token",null, {expires:new Date(Date.now())}).send('logout successfully')
}
catch(error){
  res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
}
})

module.exports = Authentication;
