const express = require('express');
const { getAllOrganizations } = require ('../neo4jDatabase/organizationOperations');

const router = express.Router();

router.get('/orgs', async (req, res) => {
  try {
    const orgs = await getAllOrganizations();
    res.json(orgs);
    console.log(orgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


