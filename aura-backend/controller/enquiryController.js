const { Enquiry } = require('../models');
const nodemailer = require('nodemailer');

// ── Nodemailer transporter ─────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
    },
});

async function sendEnquiryNotification(enquiry) {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_PASS) return;
    const mailOptions = {
        from: `"Aura Global Education" <${process.env.ADMIN_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🌍 New Country Enquiry from ${enquiry.fullName}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background:#1a1a2e;padding:24px 32px;">
            <h2 style="color:#c9a84c;margin:0;">Aura Global Education</h2>
            <p style="color:#aaa;margin:4px 0 0;">New Other Country Enquiry</p>
          </div>
          <div style="padding:28px 32px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;width:140px;">Name</td><td style="padding:8px 0;font-weight:bold;">${enquiry.fullName}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${enquiry.email}">${enquiry.email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;">${enquiry.phone}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Test Mode / Intake</td><td style="padding:8px 0;">${enquiry.testMode || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Education Level</td><td style="padding:8px 0;">${enquiry.education || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Enquiry Type</td><td style="padding:8px 0;">${enquiry.note || 'General enquiry'}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Received</td><td style="padding:8px 0;">${new Date().toLocaleString('en-IN')}</td></tr>
            </table>
          </div>
          <div style="background:#f5f5f5;padding:16px 32px;text-align:center;color:#999;font-size:13px;">
            Log in to your <strong>Admin Panel → Enquiries</strong> to view and manage this record.
          </div>
        </div>`,
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Nodemailer enquiry error:', err.message);
    }
}

exports.createEnquiry = async (req, res) => {
    try {
        const { fullName, email, phone, testMode, education, note } = req.body;

        if (!fullName?.trim()) return res.status(400).json({ message: 'Full name is required.' });
        if (!email?.trim())    return res.status(400).json({ message: 'Email is required.' });
        if (!phone?.trim())    return res.status(400).json({ message: 'Phone number is required.' });

        const enquiry = await Enquiry.create({
            fullName: fullName.trim(),
            email:    email.trim(),
            phone:    phone.trim(),
            testMode: testMode || null,
            education: education?.trim() || null,
            note:     note || 'General enquiry',
        });

        // Send email notification to admin (non-blocking)
        sendEnquiryNotification(enquiry);

        res.status(201).json({ message: 'Enquiry submitted successfully.', enquiry });
    } catch (error) {
        res.status(500).json({ message: 'Could not submit enquiry.', error: error.message });
    }
};

exports.getAllEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ enquiries });
    } catch (error) {
        res.status(500).json({ message: 'Could not load enquiries.', error: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const count = await Enquiry.count({ where: { isRead: false } });
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: 'Could not get count.', error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const enquiry = await Enquiry.findByPk(req.params.id);
        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });
        await enquiry.update({ isRead: true });
        res.json({ message: 'Marked as read.', enquiry });
    } catch (error) {
        res.status(500).json({ message: 'Could not update enquiry.', error: error.message });
    }
};

exports.deleteEnquiry = async (req, res) => {
    try {
        const enquiry = await Enquiry.findByPk(req.params.id);
        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });
        await enquiry.destroy();
        res.json({ message: 'Enquiry deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Could not delete enquiry.', error: error.message });
    }
};
