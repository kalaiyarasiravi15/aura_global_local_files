const express = require('express');
const router = express.Router();
const serviceController = require('../controller/serviceController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadServiceImages } = require('../middleware/uploadMiddleware');

const serviceImageFields = uploadServiceImages.fields([
  { name: 'image', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 },
]);

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', authMiddleware, serviceImageFields, serviceController.createService);
router.put('/:id', authMiddleware, serviceImageFields, serviceController.updateService);
router.delete('/:id', authMiddleware, serviceController.deleteService);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const serviceController = require('../controller/serviceController');
// const authMiddleware = require('../middleware/authMiddleware');
// const { upload, convertToWebp, dirs } = require('../middleware/uploadMiddleware');

// // ── FIXED ─────────────────────────────────────────────────────────────
// const serviceImageFields = [
//     upload.fields([
//         { name: 'image', maxCount: 1 },
//         { name: 'bannerImage', maxCount: 1 },
//     ]),
//     convertToWebp(dirs.services) // Loops through both 'image' and 'bannerImage' objects automatically
// ];
// // ──────────────────────────────────────────────────────────────────────

// router.get('/', serviceController.getAllServices);
// router.get('/:id', serviceController.getServiceById);

// router.post('/', authMiddleware, serviceImageFields, serviceController.createService);
// router.put('/:id', authMiddleware, serviceImageFields, serviceController.updateService);
// router.delete('/:id', authMiddleware, serviceController.deleteService);

// module.exports = router;
