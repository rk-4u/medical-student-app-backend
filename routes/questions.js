const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { auth } = require('../middleware/auth');

router.post('/', auth, questionController.createQuestion);
router.get('/', auth, questionController.getQuestions);
router.get('/:id', auth, questionController.getQuestion);
router.put('/:id', auth, questionController.updateQuestion);
router.put('/:id/interaction', auth, questionController.updateUserInteraction);
router.delete('/:id', auth, questionController.deleteQuestion);

module.exports = router;