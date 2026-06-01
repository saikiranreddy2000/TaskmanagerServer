const express=require('express');
const ProjectRoute=express.Router()
const permit=require('../Middleware/RBAC');
const JwtAuth = require('../Middleware/JwtAuth');
const Project =require('../Models/ProjectModel');
const {ProjectDetailValidation}=require('../Utiles/Validation');
const ProjectModel = require('../Models/ProjectModel');
//project creation
ProjectRoute.post('/projects',JwtAuth,permit('ADMIN','MANAGER'),async(req,res)=>{
try{
ProjectDetailValidation(req.body)
const {name,description}=req.body
const {_id}=req.user
const newProject= await new Project({name, description,createdBy:_id})

await newProject.save()

res.status(201).json({
    message:'Project created successfully',
    project:newProject
})
}catch(error){
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
 
}
})
//get all project details
ProjectRoute.get('/projectsDetails',JwtAuth,permit('ADMIN','MANAGER'),async(req,res)=>{
try{
const allProjects=await Project.find({}).select('name createdBy description createdAt updatedAt').populate('createdBy',"name role")
res.json({Projects:allProjects})
}
catch(error){
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
 
}
})
//get project by Id
ProjectRoute.get('/projectsDetails/:id',JwtAuth,permit('ADMIN','MANAGER'),async(req,res)=>{
try{
const {id}=req.params
const Projects=await Project.findOne({_id:id}).select('name createdBy description createdAt updatedAt').populate('createdBy',"name role")
res.json({Projects})
}
catch(error){
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
 
}
})
//deactivate a project
ProjectRoute.patch('/projectsDetails/deactivate/:id',JwtAuth,permit('ADMIN','MANAGER'),async(req,res)=>{
try{
const {id}=req.params
const {isactive}=req.body
const project=await Project.findOne({_id:id})
if(project){
    project.isActive=isactive
    await project.save()
}
else{
    throw new Error('There is no project with this ID')
}
res.json({message:'updated project', project})
}
catch(error){
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
 
}
})
module.exports=ProjectRoute
