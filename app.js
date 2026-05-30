const express=require('express')
const app=express();
const {DatabaseConnection} =require('./config/DBconfig')

DatabaseConnection().then(()=>{
    try{
        console.log('DB connected')
        app.listen(3000,()=>{
    console.log('server is runing at port 3000')
}
)
    }
    catch(err){
        console.log(err)
    }
})
