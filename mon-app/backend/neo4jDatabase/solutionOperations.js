const driver = require('./driver');

async function AddCommentary(username, donnee, solution) {
    const session = driver.session();
    try {
        if (!username || !donnee || !solution) {
            throw new Error('L\'utilisateur, la donnée et la solution sont obligatoires');
        }

        const result = await session.run(
            `MERGE (u:Utilisateur {full_name: $username})
             MERGE (d:Donnée {name: $donnee})
             CREATE (s:Solution {text: $solution, created_at: datetime()})
             MERGE (u)-[:A_ECRIT]->(s)
             MERGE (s)-[:CONCERNE]->(d)
             RETURN u, s, d`,
            { username, donnee, solution }
        );

        if (result.records.length === 0) {
            throw new Error('Échec de création du commentaire');
        }

        console.log('Commentaire ajouté', {
            user: result.records[0].get('u').properties,
            solution: result.records[0].get('s').properties,
            data: result.records[0].get('d').properties
        });

        return {
            user: result.records[0].get('u'),
            solution: result.records[0].get('s'),
            data: result.records[0].get('d')
        };

    } catch (error) {
        console.log('Erreur AddCommentary', {
            error: error.message,
            params: { username, donnee, solution }
        });
        throw new Error(`Erreur lors de l'ajout du commentaire: ${error.message}`);
    } finally {
        await session.close();
    }
}

module.exports = { AddCommentary };
