const Service = require('../models/service');

/**
 * Parse raw features input into a clean string array, max 10 items.
 */
const parseFeatures = (features) => {
  if (!features) return [];

  let result = [];

  if (Array.isArray(features)) {
    result = features.map((item) => String(item).trim()).filter(Boolean);
  } else {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) {
        result = parsed.map((item) => String(item).trim()).filter(Boolean);
      } else {
        result = String(parsed)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch {
      result = String(features)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return result.slice(0, 10);
};

const filePath = (file) => {
  if (!file) return null;
  return `/uploads/services/${file.filename}`;
};

const getFile = (req, fieldName) => req.files?.[fieldName]?.[0] || null;

const servicePayload = (req) => ({
  title: req.body.title?.trim(),
  subtitle: req.body.subtitle?.trim() || null,
  description: req.body.description?.trim() || null,
  features: parseFeatures(req.body.features),
  image: filePath(getFile(req, 'image')),
  bannerImage: filePath(getFile(req, 'bannerImage')),
  button: req.body.button?.trim() || null,
});

exports.createService = async (req, res) => {
  try {
    const payload = servicePayload(req);

    if (!payload.title) {
      return res.status(400).json({ message: 'Service title is required.' });
    }

    const service = await Service.create(payload);
    res.status(201).json({ message: 'Service created successfully.', service });
  } catch (error) {
    res.status(500).json({ message: 'Could not create service.', error: error.message });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Could not load services.', error: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    res.json({ service });
  } catch (error) {
    res.status(500).json({ message: 'Could not load service.', error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    const payload = servicePayload(req);

    if (!payload.title) {
      return res.status(400).json({ message: 'Service title is required.' });
    }

    if (!payload.image) payload.image = service.image;
    if (!payload.bannerImage) payload.bannerImage = service.bannerImage;

    await service.update(payload);
    res.json({ message: 'Service updated successfully.', service });
  } catch (error) {
    res.status(500).json({ message: 'Could not update service.', error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    await service.destroy();
    res.json({ message: 'Service deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete service.', error: error.message });
  }
};