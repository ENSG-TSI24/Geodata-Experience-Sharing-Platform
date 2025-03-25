const driver = require('./driver');
const logger = require('../utils/logger');

// implement of our Neo4J architecture, the user and organisation he belongs to into nodes along with relationship
async function createUser_and_OrganisationNodes(full_name, organization, fonction) {
  const session = driver.session();
  try {
    if (!full_name || !organization) {
      throw new Error('Nom complet et organisation sont obligatoires');
    }
    const result = await session.run(
      `MERGE (u:Utilisateur {full_name: $full_name, fonction: $fonction})
       MERGE (o:Organisme {name: $organization})
       MERGE (u)-[:APPARTIENT_A]->(o)
       ON CREATE SET u.nombre_metadonnees = 0
       RETURN u, o`,
      { full_name, organization, fonction : fonction || null  }
    );
    if (result.records.length === 0) {
      throw new Error('Échec de création utilisateur');
    }
    logger.info('Utilisateur créé', {
      user: result.records[0].get('u').properties,
      org: result.records[0].get('o').properties
    });

    return {
      user: result.records[0].get('u'),
      organization: result.records[0].get('o')
    };

  } catch (error) {
    logger.error('Erreur createUser', {
      error: error.message,
      params: { full_name, organization, fonction }
    });
    throw new Error(`Erreur utilisateur: ${error.message}`);
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
  } catch (error) {
    logger.error('Erreur incrementUserMetadataCount', {
      error: error.message,
      full_name
    });
    throw new Error('Échec mise à jour compteur');
  } finally {
    await session.close();
  }
}

module.exports = { createUser_and_OrganisationNodes, incrementUserMetadataCount };