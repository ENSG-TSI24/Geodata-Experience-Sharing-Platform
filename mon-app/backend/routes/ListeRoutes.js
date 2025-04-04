const express = require('express');
<<<<<<< HEAD
const { ListeCategories, ListeValues } = require('../neo4jDatabase/ListingOperations');
=======
const { ListeCategories,ListeValues } = require('../neo4jDatabase/ListingOperations');
>>>>>>> 1e3520d (gestion complete du # avec autocompletion)

const router = express.Router();

/**
 * Route pour récupérer les catégories dynamiquement depuis Neo4j
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await ListeCategories();
    res.json(categories);
    console.log(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

<<<<<<< HEAD
=======

>>>>>>> 1e3520d (gestion complete du # avec autocompletion)
router.get('/values/:propriete', async (req, res) => {
  try {
    const { propriete } = req.params;
    const values = await ListeValues(propriete);
    res.json(values);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
