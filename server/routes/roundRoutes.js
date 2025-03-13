const express = require('express');
const router = express.Router();
const { getRound } = require('../models/roundsModel');

//TODO: Create roundController.js to place model functions;
router.get('/:roundId', async (req, res) => {
  try {
    const { roundId } = req.params;
    console.log(' got routed to get round !!!!');
    const round = await getRound(roundId);
    res.json(round);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting round' });
  }
  const roundId = req.params.roundId;
});

module.exports = router;
