const express = require('express');
const { ListeCategories } = require('../neo4jDatabase/ListingOperations');

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

module.exports = router;
