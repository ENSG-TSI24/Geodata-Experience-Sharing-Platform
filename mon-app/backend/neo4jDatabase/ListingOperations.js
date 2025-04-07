const driver = require('./driver');


async function ListeCategories() {
    const session = driver.session();
    try {
        const result = await session.run(`
          MATCH (n:Donnee) 
          UNWIND keys(n) AS key 
          WITH key 
          WHERE NOT toLower(key) CONTAINS 'createdby'
          AND NOT toLower(key) CONTAINS 'LastModifiedBy'
          AND NOT toLower(key) CONTAINS 'LastModifiedAt'
          AND NOT toLower(key) CONTAINS 'isPrivate'
          AND NOT toLower(key) CONTAINS 'Description'
          AND NOT toLower(key) CONTAINS 'Date_création'
          AND NOT toLower(key) CONTAINS 'date_creation'
          AND NOT toLower(key) CONTAINS 'description'
          AND NOT toLower(key) CONTAINS 'Title'
          RETURN DISTINCT key
        `);
    
        return result.records.map(record => ({
          id: record.get('key'),
          color: '#'+Math.floor(Math.random()*16777215).toString(16)
        }));
      } catch (error) {
        console.error('Erreur Neo4j:', error);
        throw new Error('Erreur de récupération des catégories');
      } finally {
        await session.close();
      }
    };

    async function ListeValues(propriete) {
      const session = driver.session();
      try {
        const result = await session.run(`
          MATCH (d:Donnee)
          RETURN DISTINCT d[$propriete] AS prop
          ORDER BY prop ASC
        `, { propriete });  
    
        return result.records.map(record => ({
          id: record.get('prop'),
        }));
      } catch (error) {
        console.error('Erreur Neo4j:', error);
        throw new Error('Erreur de récupération des valeurs');
      } finally {
        await session.close();
      }
    };

module.exports = {ListeCategories,ListeValues};