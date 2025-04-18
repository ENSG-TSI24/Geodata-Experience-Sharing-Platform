const express = require('express');
const { AddCommentary } = require('../neo4jDatabase/solutionOperations'); 
const router = express.Router();

router.post('/addcommentary', async (req, res) => {
    try {    
        const { userFullName, donnee, solution } = req.body;
        const result = await AddCommentary(userFullName, donnee, solution);
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
