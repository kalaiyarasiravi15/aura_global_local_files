const fs   = require('fs');
const path = require('path');
const multer = require('multer');

// ── Upload directories ───────────────────────────────────
const dirs = {
    banners:       path.join(__dirname, '..', 'uploads', 'banners'),
    services:      path.join(__dirname, '..', 'uploads', 'services'),
    studiesAbroad: path.join(__dirname, '..', 'uploads', 'studies-abroad'),
};

Object.values(dirs).forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Generic helpers ──────────────────────────────────────
const createStorage = (uploadDir) => multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename:    (req, file, cb) => {
        const ext      = path.extname(file.originalname);
        const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, `${Date.now()}-${safeName}${ext}`);
    }
});

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Only image files are allowed.'));
};

// ── Exportable multer instances ──────────────────────────
const uploadBannerImage = multer({
    storage: createStorage(dirs.banners),
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadServiceImages = multer({
    storage: createStorage(dirs.services),
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Single image for studies-abroad country
const uploadStudiesAbroadImage = multer({
    storage: createStorage(dirs.studiesAbroad),
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = {
    uploadBannerImage,
    uploadServiceImages,
    uploadStudiesAbroadImage
};

