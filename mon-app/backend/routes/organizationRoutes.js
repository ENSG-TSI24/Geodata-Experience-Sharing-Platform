const express = require('express');
const {getAllOrganizations,createOrganization,updateOrganization,deleteOrganization} = require('../neo4jDatabase/organizationOperations');

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

router.post('/orgs', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Le nom de l'organisation est requis" });
    }

    const result = await createOrganization(name, description || "");
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/orgs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Le nom de l'organisation est requis" });
    }

    const result = await updateOrganization(id, name, description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/orgs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteOrganization(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;