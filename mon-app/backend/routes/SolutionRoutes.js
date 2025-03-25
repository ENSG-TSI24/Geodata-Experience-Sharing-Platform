const express = require('express');
const { AddCommentary } = require('../neo4jDatabase/userOperations'); // Assure-toi que c'est bien le bon chemin
const router = express.Router();

router.post('/add-commentary', async (req, res) => {
    try {    
        const { username, donnee, solution } = req.body;
        const result = await AddCommentary(username, donnee, solution);
        res.status(200).json({
            message: 'Commentaire ajouté avec succès',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
