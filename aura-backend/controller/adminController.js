const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'aura_global_admin_secret_2026';

const signToken = (admin) => (
  jwt.sign({ id: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' })
);

const toAdminPayload = (admin) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await Admin.findOne({ where: { email: normalizedEmail } });

    if (existing) {
      return res.status(409).json({ message: 'Admin already exists.' });
    }

    const admin = await Admin.create({
      name: name?.trim() || 'Admin',
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
    });

    res.status(201).json({
      message: 'Admin registered successfully.',
      token: signToken(admin),
      admin: toAdminPayload(admin),
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ where: { email: email.trim().toLowerCase() } });

    if (!admin) {
      return res.status(404).json({ message: 'Admin account not found.' });
    }

    const passwordMatches = await bcrypt.compare(password, admin.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    res.json({
      message: 'Login successful.',
      token: signToken(admin),
      admin: toAdminPayload(admin),
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin account not found.' });
    }

    res.json({ admin: toAdminPayload(admin) });
  } catch (error) {
    res.status(500).json({ message: 'Could not load admin profile.', error: error.message });
  }
};
