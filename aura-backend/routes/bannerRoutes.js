const express = require('express');
const router = express.Router();
const bannerController = require('../controller/bannerController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadBannerImage } = require('../middleware/uploadMiddleware');

router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerController.getBannerById);

const bannerImageUpload = uploadBannerImage.single('image');

router.post('/', authMiddleware, bannerImageUpload, bannerController.createBanner);
router.put('/:id', authMiddleware, bannerImageUpload, bannerController.updateBanner);
router.delete('/:id', authMiddleware, bannerController.deleteBanner);

module.exports = router;
// const express = require('express');
// const router = express.Router();
// const bannerController = require('../controller/bannerController');
// const authMiddleware = require('../middleware/authMiddleware');
// const { upload, convertToWebp, dirs } = require('../middleware/uploadMiddleware');

// // Public routes
// router.get('/', bannerController.getAllBanners);
// router.get('/:id', bannerController.getBannerById);

// // ── FIXED ─────────────────────────────────────────────────────────────
// const bannerImageUpload = [
//     upload.single('image'),       // 1. Process single file from frontend named 'image'
//     convertToWebp(dirs.banners)   // 2. Convert to WebP and save
// ];
// // ──────────────────────────────────────────────────────────────────────

// router.post('/', authMiddleware, bannerImageUpload, bannerController.createBanner);
// router.put('/:id', authMiddleware, bannerImageUpload, bannerController.updateBanner);
// router.delete('/:id', authMiddleware, bannerController.deleteBanner);

// module.exports = router;