const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');
const recipeController = require('../controllers/recipeController');

// Public routes (no auth required)
router.get('/search', asyncHandler(recipeController.searchPublic));
router.get('/public/:id', asyncHandler(recipeController.getByIdPublic));

// All remaining recipe routes require authentication
router.use(requireAuth);

router.post('/generate', asyncHandler(recipeController.generate));
router.post('/save', asyncHandler(recipeController.saveRecipe));
router.get('/saved', asyncHandler(recipeController.getSaved));
router.get('/inspiration', asyncHandler(recipeController.getInspiration));
router.delete('/unsave/:id', asyncHandler(recipeController.unsaveRecipe));
router.get('/:id', asyncHandler(recipeController.getById));
router.delete('/:id', asyncHandler(recipeController.deleteRecipe));

module.exports = router;
