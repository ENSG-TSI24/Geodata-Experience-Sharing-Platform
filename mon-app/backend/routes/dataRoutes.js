const express = require('express');
const { createDataNode } = require('../neo4jDatabase/dataOperations');
const { incrementUserMetadataCount } = require('../neo4jDatabase/userOperations');

const router = express.Router();


router.post('/store-metadata', async (req, res) => {
  try {
    const { data, userFullName } = req.body;
    const result = await createDataNode(data, userFullName);
    await incrementUserMetadataCount(userFullName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;