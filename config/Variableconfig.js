require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL || process.env.DatabaseUrl;

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl,
};
