const express = require('express');
const { createDataNode } = require('../neo4jDatabase/dataOperations');
const { incrementUserMetadataCount } = require('../neo4jDatabase/userOperations');

const router = express.Router();

router.post('/store-metadata', async (req, res) => {
  
  try {
    const { data, userFullName } = req.body;
    console.log('Requête reçue:', req.body);
    console.log('username : ',userFullName);

    if (!data || !userFullName) {
      console.error('Données manquantes');
      return res.status(400).json({ error: 'Données requises manquantes' });
    }

    const result = await createDataNode(data, userFullName);
    await incrementUserMetadataCount(userFullName);
    console.log('Node created:', result);
    res.json({ success: true, data: result });

  } catch (error) {

    if (error.code === 'DUPLICATE_TITLE') {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;