const express = require('express');
const Authentication = express.Router();
const UserDetails = require('../Models/RegisterationModel');
const { signupDetailValidation } = require('../Utiles/Validation');
const bcrypt =require('bcrypt')
const { hashingKey } = require('../config/Variableconfig')
Authentication.post('/signup', async (req, res) => {
  try {
    signupDetailValidation(req.body);
    const { name, email, password, role } = req.body;
    const Encrpassword=await bcrypt.hash(password, hashingKey)

    const newUser = new UserDetails({ name, email, password:Encrpassword,role});
    await newUser.save();

    res.status(201).send('successfully registered');
  } catch (error) {
    console.log(error);
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
  }
});


module.exports = Authentication;
