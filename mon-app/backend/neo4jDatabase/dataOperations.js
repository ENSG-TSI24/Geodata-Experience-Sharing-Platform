const driver = require('./driver');
//const logger = require('../utils/logger');

async function createDataNode(data, userFullName) {
  const session = driver.session();
  try {
    
    console.log('Création du noeud avec:', { data, userFullName });
   
    const checkTitle = await session.run(
      `MATCH (d:Donnee {Title: $title})
       RETURN d LIMIT 1`,
      { title: data.Title }
    );
    
    if (checkTitle.records.length > 0) {
      const error = new Error('Un enregistrement avec ce titre existe déjà');
      error.code = 'DUPLICATE_TITLE';
      throw error;
    }
    const dataProps = {
      ...data,
      date_creation: new Date().toISOString()
    };
    delete dataProps.Proprietees;
    const result = await session.run(
      `MATCH (u:Utilisateur {full_name: $userFullName})
       CREATE (d:Donnee $dataProps)
       CREATE (u)-[:DECRIRE]->(d)
       RETURN d`,
      {
        userFullName,
        dataProps
      }
    );
    console.log('Résultat Neo4j:', result.records);

    // Création des relations entre noeuds et organismes si la source est renseignéee
    if (data.Source) {
      await session.run(
        `MATCH (d:Donnee {Title: $title})
         MERGE (o:Organisme {name: $source})
         CREATE (d)-[:ISSU_DE {Source: $source}]->(o)`,
        { title: data.Title, source: data.Source }
      );
    }
    if (!result.records.length) {
      throw new Error('Aucun noeud créé');
    }

    return result.records[0].get('d').properties;
  } catch (error) {
    console.error('Erreur Neo4j:', error);
    throw new Error(`Échec création: ${error.message}`);
  } finally  {
    await session.close();
  }
}

module.exports = { createDataNode };