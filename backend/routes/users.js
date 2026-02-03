const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.use(requireAuth);

router.get('/profile', asyncHandler(userController.getProfile));
router.get('/preferences', asyncHandler(userController.getPreferences));
router.put('/preferences', asyncHandler(userController.updatePreferences));

module.exports = router;
