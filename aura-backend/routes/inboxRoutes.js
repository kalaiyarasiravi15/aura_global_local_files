// routes/inboxRoutes.js
const express = require('express');
const router  = express.Router();
const inboxController = require('../controller/inboxController');
const authMiddleware  = require('../middleware/authMiddleware');

// Public route – anyone can POST a contact message
router.post('/', inboxController.createMessage);

// Protected routes – admin only
router.get('/unread-count', authMiddleware, inboxController.getUnreadCount);
router.get('/',             authMiddleware, inboxController.getAllMessages);
router.get('/:id',          authMiddleware, inboxController.getMessageById);
router.patch('/:id/read',   authMiddleware, inboxController.markAsRead);
router.delete('/:id',       authMiddleware, inboxController.deleteMessage);

module.exports = router;
