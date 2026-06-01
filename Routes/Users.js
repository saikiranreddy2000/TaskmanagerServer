const express=require('express')
const JwtAuth = require('../Middleware/JwtAuth')
const UserRoute=express.Router()
const permit=require('../Middleware/RBAC')
const UserDetails= require('../Models/RegisterationModel')

//get all user details
UserRoute.get('/users',JwtAuth,permit('ADMIN'),async(req,res)=>{
try{const {page}=req.query
const limitValue=10;
const skipValue=(page-1)*limitValue||0;
const allusers=await UserDetails.find().select('email name role isActive').skip(skipValue).limit(limitValue)
res.json({ users: allusers })
}
catch(error){
res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});

}
})
// role Modification with ID
UserRoute.patch('/users/:id',JwtAuth,permit('ADMIN'),async(req,res)=>{
    try{
        const {id}=req.params
        const { role } = req.body
        const allowedRoles = ['ADMIN', 'MANAGER', 'MEMBER']

        if (!allowedRoles.includes(role)) {
            throw new Error('Enter a valid role')
        }

        const user=await UserDetails.findById(id)

        if (!user) {
            throw new Error('User not found')
        }

        if(user.role!=='ADMIN')
            {user.role = role
        await user.save()
    }else{
        throw new Error('you are modifying the user who is ADMIN')
    }

        res.json({
            message: 'User role updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        })
    }
    catch(error){
        res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
    }
})
// user deactivation
UserRoute.patch('/users/:id/deactivate',JwtAuth,permit('ADMIN'),async(req,res)=>{
    try{
        const {id}=req.params
        const user=await UserDetails.findById(id)

        if (!user) {
            throw new Error('User not found')
        }

        if (user.role === 'ADMIN') {
            throw new Error('you are deactivating the user who is ADMIN')
        }

        user.isActive = false
        await user.save()

        res.json({
            message: 'User deactivated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        })
    }
    catch(error){
        res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
    }
})

module.exports=UserRoute
