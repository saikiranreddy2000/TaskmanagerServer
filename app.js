const express = require('express');
const { DatabaseConnection } = require('./config/DBconfig');
const config = require('./config/Variableconfig');
const RegisterRoute= require('./Routes/Authentication')
const app = express();
app.use(express.json())
app.use('/',RegisterRoute)
DatabaseConnection()
  .then(() => {
    console.log('DB connected');
    app.listen(config.port, () => {
      console.log(`server is running at port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });
