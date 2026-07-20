const express = require('express');
const router = express.Router();
const ctrl = require('../controller/studentApplicationController');
const auth = require('../middleware/authMiddleware');

router.post('/',         ctrl.createApplication);
router.post('/enquiry',  ctrl.createEnquiryApplication);

router.get('/unread-count', auth, ctrl.getUnreadCount);     // admin only
router.get('/',             auth, ctrl.getAllApplications);
router.get('/:id',          auth, ctrl.getApplicationById);
router.patch('/:id/read',   auth, ctrl.markAsRead);
router.delete('/:id',       auth, ctrl.deleteApplication);

module.exports = router;
