const express = require('express');
const router = express.Router();
const { getUser } = require('../models/usersModel');

// TODO: create userController.js to place userModel functions in
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await getUser(userId);

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting user by id' });
  }
});

module.exports = router;
