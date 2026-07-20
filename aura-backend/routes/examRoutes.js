const express = require('express');
const router = express.Router();
const examController = require('../controller/examController');

// Standardized clear CRUD routing path parameters matrix mapping rules
router.post('/', examController.createExamWithPrograms);
router.get('/', examController.getAllExams);
router.get('/:id', examController.getExamById);
router.put('/:id', examController.updateExamWithPrograms);
router.delete('/:id', examController.deleteExam);

module.exports = router;