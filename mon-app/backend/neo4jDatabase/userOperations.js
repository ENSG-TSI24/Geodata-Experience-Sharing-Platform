const driver = require('./driver');
// const logger = require('../utils/logger');

// implement of our Neo4J architecture, the user and organisation he belongs to into nodes along with relationship
async function createUser_and_OrganisationNodes(full_name, organization, fonction) {
  const session = driver.session();
  try {
    
    console.log('Tentative de création pour:', { full_name, organization, fonction });
    const result = await session.run(
      `MERGE (u:Utilisateur {full_name: $full_name})
       ON CREATE SET u.fonction = $fonction,
                    u.nombre_metadonnees = 0,
                    u.date_creation = datetime()
       MERGE (o:Organisme {name: $organization})
       MERGE (u)-[:APPARTIENT_A]->(o)
       RETURN u, o`,
      { full_name, organization, fonction : fonction || null  }
    );

    console.log('Résultat Neo4j:', result);
    if (result.records.length === 0) {
      throw new Error('Échec de création utilisateur');
    }
    
    return {
      user: result.records[0].get('u'),
      organization: result.records[0].get('o')
    };

  } catch (error) {
    console.error('ERREUR CRITIQUE:', error); // Log visible
    throw new Error(`Échec création: ${error.message}`);
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