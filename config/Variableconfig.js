require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL || process.env.DatabaseUrl;
const hashingKey = Number(process.env.HASHING_KEY || process.env.Hashing_Key || 10);
const dnsServers = process.env.DNS_SERVERS
  ? process.env.DNS_SERVERS.split(",").map((server) => server.trim()).filter(Boolean)
  : [];

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl,
  dnsServers,
  hashingKey
};
