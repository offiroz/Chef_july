const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');
const ratingController = require('../controllers/ratingController');

router.use(requireAuth);

router.post('/', asyncHandler(ratingController.submitRating));
router.get('/:recipeId', asyncHandler(ratingController.getRatings));

module.exports = router;
