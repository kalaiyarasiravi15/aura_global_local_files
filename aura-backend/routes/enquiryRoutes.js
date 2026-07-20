const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/enquiryController');
const auth    = require('../middleware/authMiddleware');

router.post('/',              ctrl.createEnquiry);          // public
router.get('/unread-count',   auth, ctrl.getUnreadCount);   // admin only
router.get('/',               auth, ctrl.getAllEnquiries);   // admin only
router.patch('/:id/read',     auth, ctrl.markAsRead);       // admin only
router.delete('/:id',         auth, ctrl.deleteEnquiry);    // admin only

module.exports = router;
