const { Scholarship, StudiesAbroad } = require('../models');

exports.getActiveScholarships = async (req, res) => {
    try {
        const scholarships = await Scholarship.findAll({
            where: { isActive: true },
            include: [
                { model: StudiesAbroad, as: 'studiesAbroad', attributes: ['id', 'countryName'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ scholarships });
    } catch (err) {
        res.status(500).json({ message: 'Could not fetch active scholarships.', error: err.message });
    }
};

exports.addScholarship = async (req, res) => {
    try {
        const { studiesAbroadId, coursename, amount, description, isActive } = req.body;

        if (!studiesAbroadId) return res.status(400).json({ message: 'studiesAbroadId is required.' });
        if (!coursename?.trim())    return res.status(400).json({ message: 'Scholarship coursename is required.' });

        const country = await StudiesAbroad.findByPk(studiesAbroadId);
        if (!country) return res.status(404).json({ message: 'Country not found.' });

        const count = await Scholarship.count({ where: { studiesAbroadId } });
        if (count >= 30) return res.status(400).json({ message: 'Maximum 30 scholarships allowed per country.' });

        const scholarship = await Scholarship.create({
            studiesAbroadId,
            coursename:  coursename.trim(),
            amount:      amount ? Number(amount) : null,
            description: description?.trim() || null,
            isActive:    isActive !== undefined ? Boolean(isActive) : true
        });

        res.status(201).json({ message: 'Scholarship added.', scholarship });
    } catch (err) {
        res.status(500).json({ message: 'Could not add scholarship.', error: err.message });
    }
};

exports.getScholarships = async (req, res) => {
    try {
        const scholarships = await Scholarship.findAll({
            where: { studiesAbroadId: req.params.studiesAbroadId },
            order: [['createdAt', 'ASC']]
        });
        res.json({ scholarships });
    } catch (err) {
        res.status(500).json({ message: 'Could not fetch scholarships.', error: err.message });
    }
};

exports.updateScholarship = async (req, res) => {
    try {
        const scholarship = await Scholarship.findByPk(req.params.id);
        if (!scholarship) return res.status(404).json({ message: 'Scholarship not found.' });

        const { coursename, amount, description, isActive } = req.body;

        if (coursename !== undefined && !coursename?.trim())
            return res.status(400).json({ message: 'Scholarship coursename cannot be empty.' });

        await scholarship.update({
            coursename:  coursename?.trim()        ?? scholarship.coursename,
            amount:      amount !== undefined ? (amount ? Number(amount) : null) : scholarship.amount,
            description: description?.trim()  ?? scholarship.description,
            isActive:    isActive !== undefined ? Boolean(isActive) : scholarship.isActive
        });

        res.json({ message: 'Scholarship updated.', scholarship });
    } catch (err) {
        res.status(500).json({ message: 'Could not update scholarship.', error: err.message });
    }
};

exports.toggleScholarshipStatus = async (req, res) => {
    try {
        const scholarship = await Scholarship.findByPk(req.params.id);
        if (!scholarship) return res.status(404).json({ message: 'Scholarship not found.' });
        await scholarship.update({ isActive: !scholarship.isActive });
        res.json({ message: `Scholarship ${scholarship.isActive ? 'activated' : 'deactivated'}.`, scholarship });
    } catch (err) {
        res.status(500).json({ message: 'Could not toggle status.', error: err.message });
    }
};

exports.deleteScholarship = async (req, res) => {
    try {
        const scholarship = await Scholarship.findByPk(req.params.id);
        if (!scholarship) return res.status(404).json({ message: 'Scholarship not found.' });
        await scholarship.destroy();
        res.json({ message: 'Scholarship deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Could not delete scholarship.', error: err.message });
    }
};
