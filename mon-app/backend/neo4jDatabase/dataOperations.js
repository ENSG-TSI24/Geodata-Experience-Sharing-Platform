const driver = require('./driver');
//const logger = require('../utils/logger');

async function createDataNode(data, userFullName) {
  const session = driver.session();
  try {
    console.log('Création du noeud avec:', { data, userFullName });
    // Création du noeud Donnee avec annotations de liste deroulante
    const result = await session.run(
      `MATCH (u:Utilisateur {full_name: $userFullName})
       CREATE (d:Donnee $dataProps)
       CREATE (u)-[:DECRIRE]->(d)
       RETURN d`,
      {
        userFullName,
        dataProps: {
          ...data,
          date_creation: new Date().toISOString()
        }
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

    return result.records[0].get('d');
  } catch (error) {
    console.error('Erreur Neo4j:', error);
    throw new Error('Échec de la création dans la base de données');
  } finally  {
    await session.close();
  }
}

module.exports = { createDataNode };