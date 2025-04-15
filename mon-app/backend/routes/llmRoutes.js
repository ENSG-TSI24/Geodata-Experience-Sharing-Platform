const express = require('express');
const { 
  generateMetadataJSON,
  processMetadataSubmission
} = require('../neo4jDatabase/llmOperations');
const router = express.Router();

router.post('/process-metadata', async (req, res) => {
  try {
    const { text, userId, full_name } = req.body;
    
    if (!text || !userId || !full_name) {
      return res.status(400).json({ 
        error: 'Text, userId and full_name are required' 
      });
    }

    const result = await processMetadataSubmission(text, userId, full_name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;