const neo4j = require('neo4j-driver');

const URI = process.env.NEO4J_URI || 'neo4j+s://fd5fee1d.databases.neo4j.io';
const USER = process.env.NEO4J_USER || 'neo4j';
const PASSWORD = process.env.NEO4J_PASSWORD ;

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

module.exports = driver;