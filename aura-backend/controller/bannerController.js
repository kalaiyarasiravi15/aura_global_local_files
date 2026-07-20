const Banner = require('../models/banner');

const getUploadedImagePath = (file) => {
  if (!file) return null;
  return `/uploads/banners/${file.filename}`;
};

const bannerPayload = (body, file) => ({
  title: body.title?.trim(),
  subtitle: body.subtitle?.trim() || null,
  description: body.description?.trim() || null,
  button: body.button?.trim() || null,
  buttonLink: body.buttonLink?.trim() || null,
  image: getUploadedImagePath(file),
});

exports.createBanner = async (req, res) => {
  try {
    const payload = bannerPayload(req.body, req.file);

    if (!payload.title) {
      return res.status(400).json({ message: 'Banner title is required.' });
    }

    const banner = await Banner.create(payload);
    res.status(201).json({ message: 'Banner created successfully.', banner });
  } catch (error) {
    res.status(500).json({ message: 'Could not create banner.', error: error.message });
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ banners });
  } catch (error) {
    res.status(500).json({ message: 'Could not load banners.', error: error.message });
  }
};

exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found.' });
    }

    res.json({ banner });
  } catch (error) {
    res.status(500).json({ message: 'Could not load banner.', error: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found.' });
    }

    const payload = bannerPayload(req.body, req.file);

    if (!payload.title) {
      return res.status(400).json({ message: 'Banner title is required.' });
    }

    if (!payload.image) {
      payload.image = banner.image;
    }

    await banner.update(payload);
    res.json({ message: 'Banner updated successfully.', banner });
  } catch (error) {
    res.status(500).json({ message: 'Could not update banner.', error: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found.' });
    }

    await banner.destroy();
    res.json({ message: 'Banner deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete banner.', error: error.message });
  }
};
