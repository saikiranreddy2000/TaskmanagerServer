const mongoose= require('mongoose')

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
}
})

module.exports=mongoose.model('UserDetails',UserDetails)