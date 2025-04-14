const driver = require('./driver')
const fs = require('fs');

async function extractSchema() {
  try {
    const schema = {
      nodes: {},
      relationships: {}
    };

    // 1. Get node labels
    const labelsResult = await session.run(`CALL db.labels()`);
    const labels = labelsResult.records.map(r => r.get('label'));

    // 2. Get relationship types
    const relsResult = await session.run(`CALL db.relationshipTypes()`);
    const relTypes = relsResult.records.map(r => r.get('relationshipType'));

    // 3. Infer properties per label
    for (const label of labels) {
      const propsResult = await session.run(`
        MATCH (n:\`${label}\`) RETURN properties(n) AS props ORDER BY props ASC
      `);
      const propsSet = new Set();
      propsResult.records.forEach(record => {
        const props = record.get('props');
        Object.keys(props).forEach(key => propsSet.add(key));
      });
      schema.nodes[label] = Array.from(propsSet);
    }

    // 4. Infer relationship patterns
    for (const rel of relTypes) {
      const patternResult = await session.run(`
        MATCH (a)-[r:\`${rel}\`]->(b)
        RETURN DISTINCT labels(a)[0] AS from, type(r) AS rel, labels(b)[0] AS to LIMIT 5
      `);
      patternResult.records.forEach(record => {
        const from = record.get('from');
        const to = record.get('to');
        const key = `(:${from})-[:${rel}]->(:${to})`;
        schema.relationships[key] = rel;
      });
    }

    // 5. Generate prompt content
    let prompt = `Voici la structure de la base Neo4j :\n\n`;

    prompt += `### Nœuds :\n`;
    for (const [label, props] of Object.entries(schema.nodes)) {
      prompt += `- (:${label}) avec propriétés : ${props.join(', ') || 'Aucune'}\n`;
    }

    prompt += `\n### Relations :\n`;
    for (const rel of Object.keys(schema.relationships)) {
      prompt += `- ${rel}\n`;
    }

    // Sauvegarder dans un fichier (ou renvoyer au chatbot)
    fs.writeFileSync('schema-prompt.txt', prompt);
    console.log('\nPrompt généré dans : schema-prompt.txt');

  } catch (err) {
    console.error('Erreur dans l\'extraction :', err);
  } finally {
    await session.close();
    await driver.close();
  }
}

extractSchema();
