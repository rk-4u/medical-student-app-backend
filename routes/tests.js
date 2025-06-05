const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { auth } = require('../middleware/auth');

router.post('/', auth, testController.createTest);
router.get('/', auth, testController.getTests);
router.get('/:id', auth, testController.getTest);
router.post('/:id/submit', auth, testController.submitTest);
router.post('/:id/cancel', auth, testController.cancelTest);

module.exports = router;