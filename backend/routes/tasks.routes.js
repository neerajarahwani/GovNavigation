const express = require('express');
const { query } = require('../controllers/tasksController');

const router = express.Router();

router.post('/query', query);

module.exports = router;
