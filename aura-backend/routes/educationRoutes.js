const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/educationController');
const auth    = require('../middleware/authMiddleware');

router.get('/country/:studiesAbroadId', ctrl.getEducations);
router.post('/',       auth, ctrl.addEducation);
router.put('/:id',     auth, ctrl.updateEducation);
router.delete('/:id',  auth, ctrl.deleteEducation);

module.exports = router;
