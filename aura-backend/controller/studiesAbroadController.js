const { StudiesAbroad, TestSection, Education, Scholarship } = require('../models');

/* ── helpers ─────────────────────────────────────────── */
const parseFeatures = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(s => String(s).trim()).filter(Boolean).slice(0, 10);
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean).slice(0, 10);
    } catch { /* fall through */ }
    return String(raw).split(',').map(s => s.trim()).filter(Boolean).slice(0, 10);
};

/* ── Studies Abroad (Country) ─────────────────────────── */

exports.createCountry = async (req, res) => {
    try {
        const { countryName, description } = req.body;
        if (!countryName?.trim()) return res.status(400).json({ message: 'Country name is required.' });

        const features = parseFeatures(req.body.features);
        if (features.length > 10) return res.status(400).json({ message: 'Maximum 10 features allowed.' });

        const image = req.file ? `/uploads/studies-abroad/${req.file.filename}` : null;

        const country = await StudiesAbroad.create({
            countryName: countryName.trim(),
            description: description?.trim() || null,
            features,
            image
        });

        res.status(201).json({ message: 'Country created successfully.', country });
    } catch (err) {
        res.status(500).json({ message: 'Could not create country.', error: err.message });
    }
};

exports.getAllCountries = async (req, res) => {
    try {
        const countries = await StudiesAbroad.findAll({
            include: [
                { model: TestSection,  as: 'tests' },
                { model: Education,    as: 'educations' },
                { model: Scholarship,  as: 'scholarships' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ countries });
    } catch (err) {
        res.status(500).json({ message: 'Could not fetch countries.', error: err.message });
    }
};

exports.getCountryById = async (req, res) => {
    try {
        const country = await StudiesAbroad.findByPk(req.params.id, {
            include: [
                { model: TestSection,  as: 'tests' },
                { model: Education,    as: 'educations' },
                { model: Scholarship,  as: 'scholarships' }
            ]
        });
        if (!country) return res.status(404).json({ message: 'Country not found.' });
        res.json({ country });
    } catch (err) {
        res.status(500).json({ message: 'Could not fetch country.', error: err.message });
    }
};

exports.updateCountry = async (req, res) => {
    try {
        const country = await StudiesAbroad.findByPk(req.params.id);
        if (!country) return res.status(404).json({ message: 'Country not found.' });

        const { countryName, description } = req.body;
        if (!countryName?.trim()) return res.status(400).json({ message: 'Country name is required.' });

        const features = parseFeatures(req.body.features);
        if (features.length > 10) return res.status(400).json({ message: 'Maximum 10 features allowed.' });

        const image = req.file ? `/uploads/studies-abroad/${req.file.filename}` : country.image;

        await country.update({
            countryName: countryName.trim(),
            description: description?.trim() || null,
            features,
            image
        });

        res.json({ message: 'Country updated successfully.', country });
    } catch (err) {
        res.status(500).json({ message: 'Could not update country.', error: err.message });
    }
};

exports.deleteCountry = async (req, res) => {
    try {
        const country = await StudiesAbroad.findByPk(req.params.id);
        if (!country) return res.status(404).json({ message: 'Country not found.' });
        await country.destroy();
        res.json({ message: 'Country deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Could not delete country.', error: err.message });
    }
};
