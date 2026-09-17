const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const commentController = require('../controllers/commentController');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/:id', documentController.getDocumentById);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);
router.get('/:id/versions', documentController.getVersions);

// Document Comments
router.get('/:id/comments', commentController.getComments);
router.post('/:id/comments', commentController.addComment);

module.exports = router;
