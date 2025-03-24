const driver = require('./driver');

async function createDataNode(data, userFullName) {
  const session = driver.session();
  try {
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
  } finally {
    await session.close();
  }
}

module.exports = { createDataNode };