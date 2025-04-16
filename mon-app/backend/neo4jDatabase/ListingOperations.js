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
          RETURN n.Lieu AS position
                    
        `);  
    
        return result.records.map(record => ({
          position: record.get('position'),
        }));
      } catch (error) {
        console.error('Erreur Neo4j:', error);
        throw new Error('Erreur de récupération des valeurs');
      } finally {
        await session.close();
      }
    };

    async function fetchWordWeight() {
      const session = driver.session();
      try {
        const result = await session.run(`
          MATCH (n:Donnee)
UNWIND keys(n) AS key
WITH n, key
WHERE NOT toLower(key) CONTAINS 'createdby'
  AND NOT toLower(key) CONTAINS 'lastmodifiedby'
  AND NOT toLower(key) CONTAINS 'lastmodifiedat'
  AND NOT toLower(key) CONTAINS 'isprivate'
  AND NOT toLower(key) CONTAINS 'date_création'
  AND NOT toLower(key) CONTAINS 'date_creation'
  AND NOT toLower(key) CONTAINS 'description'
WITH key, n[key] AS value
WHERE value IS NOT NULL
RETURN key, value

        `);
    
        const valueCount = {};

result.records.forEach(record => {
  const key = record.get('key');
  const rawValue = record.get('value');
  const values = Array.isArray(rawValue) ? rawValue : [rawValue];

  values.forEach(item => {
    if (typeof item === 'string') {
      const cleaned = item.trim();
      if (cleaned.length > 0) {
       
        const propKey = `${key}:${cleaned}`;
        valueCount[propKey] = (valueCount[propKey] || 0) + 1;
      }
    }
  });
});

return Object.entries(valueCount)
  .map(([keyValue, count]) => {
    const [key, ...valueParts] = keyValue.split(':');
    const value = valueParts.join(':'); 
    return { key, value, count };
  })

  .sort((a, b) => b.count - a.count);
      } catch (error) {
        console.error('Erreur Neo4j:', error);
        throw new Error('Erreur de récupération des poids des valeurs');
      } finally {
        await session.close();
      }
    };

module.exports = {fetchWordWeight,fetchDataFromValue,ListeCategories,ListeValues, getAllNodesWithPosition};