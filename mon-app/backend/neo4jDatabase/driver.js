// Connection with the Neo4J database hosted on the cloud in AuraDB through the javascipt neo4j-driver 
const neo4j = require('neo4j-driver');

const URI = process.env.NEO4J_URI || 'neo4j+s://fd5fee1d.databases.neo4j.io';
const USER = process.env.NEO4J_USER || 'neo4j';
const PASSWORD = process.env.NEO4J_PASSWORD ; // password is not written here forr securityy reasons, need to be added in the .env file

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

module.exports = driver;