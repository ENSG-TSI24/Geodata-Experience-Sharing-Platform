const driver = require('./driver');

// implement of our Neo4J architecture, the user and organisation he belongs to into nodes along with relationship
async function createUser_and_OrganisationNodes(full_name, organization, fonction) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MERGE (u:Utilisateur {full_name: $full_name, fonction: $fonction})
       MERGE (o:Organisme {name: $organization})
       MERGE (u)-[:APPARTIENT_A]->(o)
       ON CREATE SET u.nombre_metadonnees = 0
       RETURN u, o`,
      { full_name, organization, fonction }
    );
    return result.records[0];
  } finally {
    await session.close();
  }
}

// I have done this so asto increment the count each time a user creates data
async function incrementUserMetadataCount(full_name) {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:Utilisateur {full_name: $full_name})
       SET u.nombre_metadonnees = COALESCE(u.nombre_metadonnees, 0) + 1`,
      { full_name }
    );
  } finally {
    await session.close();
  }
}

module.exports = { createUser, incrementUserMetadataCount };