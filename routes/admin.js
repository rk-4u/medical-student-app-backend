// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/users', auth, adminOnly, adminController.getAllUsers);
router.put('/users/:id', auth, adminOnly, adminController.updateUser);
router.delete('/users/:id', auth, adminOnly, adminController.deleteUser);
router.delete('/questions/:id', auth, adminOnly, adminController.deleteQuestion);
router.get('/analytics', auth, adminOnly, adminController.getAnalytics);
router.put('/users/:id/plan', auth, adminOnly, adminController.updateUserPlan);
router.put('/users/:id/activate', auth, adminOnly, adminController.activateDeactivateUser);

module.exports = router;