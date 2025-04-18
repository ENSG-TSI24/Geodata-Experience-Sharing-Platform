const express = require('express');
const { ListeCategories, ListeValues, fetchDataFromValue, getAllNodesWithPosition, fetchWordWeight, getCommentariesByTitle } = require('../neo4jDatabase/ListingOperations');

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

router.get('/values/:propriete', async (req, res) => {
  try {
    const { propriete } = req.params;
    const values = await ListeValues(propriete);
    res.json(values);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/values/:propriete/:value', async (req, res) => {
  try {
    const { propriete, value } = req.params;
    const values = await fetchDataFromValue(propriete, value);
    res.json(values);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/withposition', async (req, res) => {
  try {
    const data = await getAllNodesWithPosition();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/weight', async (req, res) => {
  try {
    const weight = await fetchWordWeight();
    res.json(weight);
    console.log(weight);
} catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/comms/:titre', async (req, res) => {
  try {
    const { titre } = req.params;
    const data = await getCommentariesByTitle(titre);
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

