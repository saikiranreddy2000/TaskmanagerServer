const express = require('express');
const { DatabaseConnection } = require('./config/DBconfig');
const config = require('./config/Variableconfig');
const RegisterRoute= require('./Routes/Authentication')
const ProjectRoute=require('./Routes/Projects');
const TaskRoute=require('./Routes/Task')
const JwtAuth = require('./Middleware/JwtAuth');
const permit=require('./Middleware/RBAC')
const UserRoute=require('./Routes/Users')
const app = express();
app.use(express.json())
app.use('/',RegisterRoute,ProjectRoute,UserRoute,TaskRoute)
DatabaseConnection()
  .then(() => {
    console.log('DB connected');
    app.listen(config.port, () => {
      console.log(`server is running at port ${config.port}`);
    });
  })
  .catch((error) => {
    console.error('DB connection failed:', error.message);
    process.exit(1);
  });
