const { Education, StudiesAbroad } = require('../models');

exports.addEducation = async (req, res) => {
    try {
        const { studiesAbroadId, name } = req.body;

        if (!studiesAbroadId) return res.status(400).json({ message: 'studiesAbroadId is required.' });
        if (!name?.trim())    return res.status(400).json({ message: 'Education name is required.' });

        const country = await StudiesAbroad.findByPk(studiesAbroadId);
        if (!country) return res.status(404).json({ message: 'Country not found.' });

        const count = await Education.count({ where: { studiesAbroadId } });
        if (count >= 15) return res.status(400).json({ message: 'Maximum 15 education entries allowed per country.' });

        const education = await Education.create({ studiesAbroadId, name: name.trim() });
        res.status(201).json({ message: 'Education added.', education });
    } catch (err) {
        res.status(500).json({ message: 'Could not add education.', error: err.message });
    }
};

exports.getEducations = async (req, res) => {
    try {
        const educations = await Education.findAll({
            where: { studiesAbroadId: req.params.studiesAbroadId },
            order: [['createdAt', 'ASC']]
        });
        res.json({ educations });
    } catch (err) {
        res.status(500).json({ message: 'Could not fetch educations.', error: err.message });
    }
};

exports.updateEducation = async (req, res) => {
    try {
        const education = await Education.findByPk(req.params.id);
        if (!education) return res.status(404).json({ message: 'Education not found.' });

        const { name } = req.body;
        if (!name?.trim()) return res.status(400).json({ message: 'Education name is required.' });

        await education.update({ name: name.trim() });
        res.json({ message: 'Education updated.', education });
    } catch (err) {
        res.status(500).json({ message: 'Could not update education.', error: err.message });
    }
};

exports.deleteEducation = async (req, res) => {
    try {
        const education = await Education.findByPk(req.params.id);
        if (!education) return res.status(404).json({ message: 'Education not found.' });
        await education.destroy();
        res.json({ message: 'Education deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Could not delete education.', error: err.message });
    }
};
