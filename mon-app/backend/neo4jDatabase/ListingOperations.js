const driver = require('./driver');


async function ListeCategories() {
    const session = driver.session();
    try {
        const result = await session.run(`
          MATCH (n:Donnee) 
          UNWIND keys(n) AS key 
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

module.exports = {ListeCategories};