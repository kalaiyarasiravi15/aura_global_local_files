const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/testSectionController');
const auth    = require('../middleware/authMiddleware');

// List all tests for a country
router.get('/country/:studiesAbroadId', ctrl.getTests);

// Add
router.post('/',          auth, ctrl.addTest);
// Update
router.put('/:id',        auth, ctrl.updateTest);
// Toggle active/inactive
router.patch('/:id/toggle', auth, ctrl.toggleTestStatus);
// Delete
router.delete('/:id',     auth, ctrl.deleteTest);

module.exports = router;
