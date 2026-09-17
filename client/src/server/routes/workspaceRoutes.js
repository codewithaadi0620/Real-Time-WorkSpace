const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const documentController = require('../controllers/documentController');
const taskController = require('../controllers/taskController');
const searchController = require('../controllers/searchController');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate);

// Workspaces CRUD
router.get('/', workspaceController.getWorkspaces);
router.post('/', workspaceController.createWorkspace);
router.get('/:id', workspaceController.getWorkspaceById);
router.put('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

// Workspace Members
router.get('/:id/members', workspaceController.getMembers);
router.post('/:id/members', workspaceController.addMember);
router.delete('/:id/members/:userId', workspaceController.removeMember);

// Workspace Documents & Tasks nested helpers
router.get('/:workspaceId/documents', documentController.getDocuments);
router.post('/:workspaceId/documents', documentController.createDocument);
router.get('/:workspaceId/tasks', taskController.getTasks);
router.post('/:workspaceId/tasks', taskController.createTask);

// Workspace Search
router.get('/:id/search', searchController.search);

module.exports = router;
