const { TestSection, StudiesAbroad } = require('../models');

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

exports.addTest = async (req, res) => {
    try {
        const { studiesAbroadId, startMonth, endMonth, year, isActive } = req.body;

        if (!studiesAbroadId) return res.status(400).json({ message: 'studiesAbroadId is required.' });
        if (!startMonth || !MONTHS.includes(startMonth)) return res.status(400).json({ message: 'Valid startMonth is required.' });
        if (!endMonth   || !MONTHS.includes(endMonth))   return res.status(400).json({ message: 'Valid endMonth is required.' });
        if (!year || isNaN(Number(year)))                return res.status(400).json({ message: 'Valid year is required.' });

        const country = await StudiesAbroad.findByPk(studiesAbroadId);
        if (!country) return res.status(404).json({ message: 'Country not found.' });

        const count = await TestSection.count({ where: { studiesAbroadId } });
        if (count >= 10) return res.status(400).json({ message: 'Maximum 10 test sections allowed per country.' });

        const test = await TestSection.create({
            studiesAbroadId,
            startMonth,
            endMonth,
            year: Number(year),
            isActive: isActive !== undefined ? Boolean(isActive) : true
        });

        res.status(201).json({ message: 'Test section added.', test });
    } catch (err) {
        res.status(500).json({ message: 'Could not add test section.', error: err.message });
    }
};

exports.getTests = async (req, res) => {
    try {
        const tests = await TestSection.findAll({
            where: { studiesAbroadId: req.params.studiesAbroadId },
            order: [['createdAt', 'ASC']]
        });
        res.json({ tests });
    } catch (err) {
        res.status(500).json({ message: 'Could not fetch test sections.', error: err.message });
    }
};

exports.updateTest = async (req, res) => {
    try {
        const test = await TestSection.findByPk(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test section not found.' });

        const { startMonth, endMonth, year, isActive } = req.body;

        if (startMonth && !MONTHS.includes(startMonth)) return res.status(400).json({ message: 'Valid startMonth is required.' });
        if (endMonth   && !MONTHS.includes(endMonth))   return res.status(400).json({ message: 'Valid endMonth is required.' });
        if (year && isNaN(Number(year)))                 return res.status(400).json({ message: 'Valid year is required.' });

        await test.update({
            startMonth: startMonth || test.startMonth,
            endMonth:   endMonth   || test.endMonth,
            year:       year       ? Number(year) : test.year,
            isActive:   isActive   !== undefined  ? Boolean(isActive) : test.isActive
        });

        res.json({ message: 'Test section updated.', test });
    } catch (err) {
        res.status(500).json({ message: 'Could not update test section.', error: err.message });
    }
};

exports.toggleTestStatus = async (req, res) => {
    try {
        const test = await TestSection.findByPk(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test section not found.' });
        await test.update({ isActive: !test.isActive });
        res.json({ message: `Test section ${test.isActive ? 'activated' : 'deactivated'}.`, test });
    } catch (err) {
        res.status(500).json({ message: 'Could not toggle status.', error: err.message });
    }
};

exports.deleteTest = async (req, res) => {
    try {
        const test = await TestSection.findByPk(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test section not found.' });
        await test.destroy();
        res.json({ message: 'Test section deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Could not delete test section.', error: err.message });
    }
};
