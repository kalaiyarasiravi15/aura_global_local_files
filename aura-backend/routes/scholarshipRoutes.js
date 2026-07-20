const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/scholarshipController');
const auth    = require('../middleware/authMiddleware');

router.get('/country/:studiesAbroadId', ctrl.getScholarships);
router.get('/active', ctrl.getActiveScholarships);
router.post('/',              auth, ctrl.addScholarship);
router.put('/:id',            auth, ctrl.updateScholarship);
router.patch('/:id/toggle',   auth, ctrl.toggleScholarshipStatus);
router.delete('/:id',         auth, ctrl.deleteScholarship);

module.exports = router;
