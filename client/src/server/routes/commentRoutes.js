const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate);

router.delete('/:id', commentController.deleteComment);

module.exports = router;
