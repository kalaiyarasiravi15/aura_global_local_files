const { Exam, Program, sequelize } = require('../models/index');

// ── 1. CREATE TRANSACTION MATRIX ──────────────────────────────────────────
exports.createExamWithPrograms = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, description, studiesAbroadId, programs } = req.body;

    if (!name) {
      await transaction.rollback();
      return res.status(400).json({ message: "Exam name is required." });
    }

    if (!programs || !Array.isArray(programs) || programs.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Please include at least one program configuration track column." });
    }

    if (programs.length > 10) {
      await transaction.rollback();
      return res.status(400).json({ message: "Validation Denied: One single exam module cannot exceed 10 programs maximum." });
    }

    // Comprehensive field validation loop matching visual table requirements
    for (let i = 0; i < programs.length; i++) {
      const p = programs[i];
      if (!p.title || !p.duration || !p.totalSessions || !p.sessionDuration || !p.timing || !p.mockTests || !p.price) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Submission Halting: Program configuration column #${i + 1} contains missing parameters. All fields are compulsory.` 
        });
      }
    }

    const newExamMatrix = await Exam.create({
      name,
      description,
      studiesAbroadId: studiesAbroadId || null,
      programs
    }, {
      include: [{ model: Program, as: 'programs' }],
      transaction
    });

    await transaction.commit();
    return res.status(201).json(newExamMatrix);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: error.message });
  }
};

// ── 2. GET ALL MATRICES ──────────────────────────────────────────────────
exports.getAllExams = async (req, res) => {
  try {
    const data = await Exam.findAll({
      include: [{ model: Program, as: 'programs' }],
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── 3. GET SINGLE BY ID ──────────────────────────────────────────────────
exports.getExamById = async (req, res) => {
  try {
    const examInstance = await Exam.findByPk(req.params.id, {
      include: [{ model: Program, as: 'programs' }]
    });

    if (!examInstance) {
      return res.status(404).json({ message: "Target exam trace profile entry index not found." });
    }
    return res.status(200).json(examInstance);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── 4. UPDATE TRANSACTION MATRIX ──────────────────────────────────────────
exports.updateExamWithPrograms = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, description, studiesAbroadId, programs } = req.body;

    const targetExam = await Exam.findByPk(id, { transaction });
    if (!targetExam) {
      await transaction.rollback();
      return res.status(404).json({ message: "Exam item configuration map index code trace missing." });
    }

    if (name) targetExam.name = name;
    if (description !== undefined) targetExam.description = description;
    if (studiesAbroadId !== undefined) targetExam.studiesAbroadId = studiesAbroadId || null;
    await targetExam.save({ transaction });

    if (programs && Array.isArray(programs)) {
      if (programs.length > 10) {
        await transaction.rollback();
        return res.status(400).json({ message: "Validation Denied: Array bounds exceeded. Max 10 items." });
      }

      for (let i = 0; i < programs.length; i++) {
        const p = programs[i];
        if (!p.title || !p.duration || !p.totalSessions || !p.sessionDuration || !p.timing || !p.mockTests || !p.price) {
          await transaction.rollback();
          return res.status(400).json({ message: `Update Cancelled: Matrix item column profile #${i + 1} has empty fields.` });
        }
      }

      // Drop old program entries to write the updated list cleanly
      await Program.destroy({ where: { examId: id }, transaction });

      const remappedChildEntries = programs.map(p => ({ ...p, examId: id }));
      await Program.bulkCreate(remappedChildEntries, { transaction });
    }

    await transaction.commit();
    
    const freshlyUpdatedPayload = await Exam.findByPk(id, { include: [{ model: Program, as: 'programs' }] });
    return res.status(200).json(freshlyUpdatedPayload);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: error.message });
  }
};

// ── 5. CASCADE DELETE ────────────────────────────────────────────────────
exports.deleteExam = async (req, res) => {
  try {
    const executionTrace = await Exam.destroy({ where: { id: req.params.id } });
    if (!executionTrace) {
      return res.status(404).json({ message: "Target exam reference mapping trace code not found." });
    }
    return res.status(200).json({ message: "Exam grouping and nested child program cards wiped successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
