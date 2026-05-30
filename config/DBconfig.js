const mongoose=require('mongoose')
const config=require('./Variableconfig')

async function DatabaseConnection(){
  return await mongoose.connect(config.databaseUrl);

}

module.exports={DatabaseConnection}
