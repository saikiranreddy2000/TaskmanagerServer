const dns = require('node:dns');
const mongoose = require('mongoose');
const config = require('./Variableconfig');

async function DatabaseConnection() {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is missing in .env');
  }

  if (config.dnsServers.length > 0) {
    dns.setServers(config.dnsServers);
  }

  return mongoose.connect(config.databaseUrl);
}

module.exports = { DatabaseConnection };
