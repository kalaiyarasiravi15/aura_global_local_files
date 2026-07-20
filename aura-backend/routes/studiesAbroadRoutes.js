const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controller/studiesAbroadController');
const auth       = require('../middleware/authMiddleware');
const { uploadStudiesAbroadImage } = require('../middleware/uploadMiddleware');

const upload = uploadStudiesAbroadImage.single('image');

router.get('/',     ctrl.getAllCountries);
router.get('/:id',  ctrl.getCountryById);
router.post('/',    auth, upload, ctrl.createCountry);
router.put('/:id',  auth, upload, ctrl.updateCountry);
router.delete('/:id', auth, ctrl.deleteCountry);

module.exports = router;

// const express    = require('express');
// const router     = express.Router();
// const ctrl       = require('../controller/studiesAbroadController');
// const auth       = require('../middleware/authMiddleware');

// // Import the flexible upload components from your updated middleware
// const { upload, convertToWebp, dirs } = require('../middleware/uploadMiddleware');

// // ── FIXED ─────────────────────────────────────────────────────────────
// // Combines raw memory storage allocation with structural WebP conversion
// const uploadStudiesAbroadImage = [
//     upload.single('image'),                  // 1. Process single file from frontend named 'image'
//     convertToWebp(dirs.studiesAbroad)        // 2. Pass it to sharp to convert and write to disk
// ];
// // ──────────────────────────────────────────────────────────────────────

// router.get('/',       ctrl.getAllCountries);
// router.get('/:id',  ctrl.getCountryById);

// router.post('/',     auth, uploadStudiesAbroadImage, ctrl.createCountry);
// router.put('/:id',  auth, uploadStudiesAbroadImage, ctrl.updateCountry);
// router.delete('/:id', auth, ctrl.deleteCountry);

// module.exports = router;
