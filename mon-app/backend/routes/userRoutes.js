const express = require('express');
const { createUser } = require('../neo4jDatabase/userOperations');

const router = express.Router();
 
router.post('/login', async (req, res) => {
  try {
    const { full_name, organization, fonction } = req.body;
    const result = await createUserNode(full_name, organization, fonction);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}); 

module.exports = router;