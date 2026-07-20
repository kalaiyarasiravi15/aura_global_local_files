const express = require('express');
const router  = express.Router();
const adminController = require('../controller/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', adminController.login);
router.post('/register', adminController.register);
router.get('/profile', authMiddleware, adminController.profile);


module.exports = router;
