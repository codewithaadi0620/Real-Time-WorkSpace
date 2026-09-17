const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate);

router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
