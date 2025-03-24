// Connection with the Neo4J database hosted on the cloud in AuraDB through the javascipt neo4j-driver 
const neo4j = require('neo4j-driver');

const URI = process.env.NEO4J_URI ;
const USER = process.env.NEO4J_USER ;
const PASSWORD = process.env.NEO4J_PASSWORD ; // password is not written here forr securityy reasons, need to be added in the .env file

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

driver.verifyConnectivity()
  .then(() => console.log('Connexion Neo4j OK'))
  .catch(err => console.error('Erreur Neo4j:', err));

module.exports = driver;