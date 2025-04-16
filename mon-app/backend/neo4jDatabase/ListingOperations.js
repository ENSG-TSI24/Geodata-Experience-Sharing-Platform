const driver = require('./driver');


async function ListeCategories() {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (n:Donnee) 
        UNWIND keys(n) AS key 
        WITH key 
        WHERE key <> 'isPrivate'
        AND key <> 'Title'
        AND key <> 'Emprise'
        AND key <> 'Position'
        AND key <> 'CreatedBy'
        AND key <>  'Date_création'  
        AND key <>  'date_creation'
        AND key <>  'description'
        AND key <>  'Description'
        AND key <>  'Date_modification' 
        AND key <> 'Lieu'
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

    async function fetchDataFromValue(propriete, value) {
      const session = driver.session();
      try {
        const result = await session.run(`
          MATCH (d:Donnee)
          WHERE d[$propriete] = $value
          RETURN d AS data
          
        `, {propriete, value});  
    
        return result.records.map(record => ({
          id: record.get('data'),
        }));
      } catch (error) {
        console.error('Erreur Neo4j:', error);
        throw new Error('Erreur de récupération des valeurs');
      } finally {
        await session.close();
      }
    };

    async function getAllNodesWithPosition() {
      const session = driver.session();
     try {
        const result = await session.run(`
          MATCH (n:Donnee)
          WHERE n.Lieu IS NOT NULL
          RETURN n AS data
                    
        `);  
    
        return result.records.map(record => ({
          data: record.get('data'),
        }));
      } catch (error) {
        console.error('Erreur Neo4j:', error);
        throw new Error('Erreur de récupération des valeurs');
      } finally {
        await session.close();
      }
    };

module.exports = {fetchDataFromValue,ListeCategories,ListeValues, getAllNodesWithPosition};