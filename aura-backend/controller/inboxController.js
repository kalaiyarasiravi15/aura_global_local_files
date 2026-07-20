// controller/inboxController.js
const Inbox = require('../models/inbox');
const nodemailer = require('nodemailer');

// ── Nodemailer transporter ─────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
    },
});

async function sendAdminNotification(entry) {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_PASS) return;
    const mailOptions = {
        from: `"Aura Global Education" <${process.env.ADMIN_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `📬 New Inquiry from ${entry.fullName}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background:#1a1a2e;padding:24px 32px;">
            <h2 style="color:#c9a84c;margin:0;">Aura Global Education</h2>
            <p style="color:#aaa;margin:4px 0 0;">New Contact Form Submission</p>
          </div>
          <div style="padding:28px 32px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;width:120px;">Name</td><td style="padding:8px 0;font-weight:bold;">${entry.fullName}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${entry.email}">${entry.email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;">${entry.phone}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Country</td><td style="padding:8px 0;">${entry.country || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#666;vertical-align:top;">Message</td><td style="padding:8px 0;">${entry.message}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Received</td><td style="padding:8px 0;">${new Date().toLocaleString('en-IN')}</td></tr>
            </table>
          </div>
          <div style="background:#f5f5f5;padding:16px 32px;text-align:center;color:#999;font-size:13px;">
            Log in to your <strong>Admin Panel</strong> to view and manage this message.
          </div>
        </div>`,
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Nodemailer error:', err.message);
    }
}

// Public: submit a message (called from frontend contact form)
exports.createMessage = async (req, res) => {
    try {
        const { fullName, email, phone, country, message } = req.body;

        if (!fullName?.trim()) return res.status(400).json({ message: 'Full name is required.' });
        if (!email?.trim())    return res.status(400).json({ message: 'Email is required.' });
        if (!phone?.trim())    return res.status(400).json({ message: 'Phone number is required.' });
        if (!message?.trim())  return res.status(400).json({ message: 'Message is required.' });

        const entry = await Inbox.create({
            fullName: fullName.trim(),
            email:    email.trim(),
            phone:    phone.trim(),
            country:  country?.trim() || null,
            message:  message.trim(),
        });

        // Send email notification to admin (non-blocking)
        sendAdminNotification(entry);

        res.status(201).json({ message: 'Message sent successfully.', entry });
    } catch (error) {
        res.status(500).json({ message: 'Could not send message.', error: error.message });
    }
};

// Admin: get all messages
exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Inbox.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ messages });
    } catch (error) {
        res.status(500).json({ message: 'Could not load messages.', error: error.message });
    }
};

// Admin: get single message
exports.getMessageById = async (req, res) => {
    try {
        const entry = await Inbox.findByPk(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Message not found.' });
        res.json({ entry });
    } catch (error) {
        res.status(500).json({ message: 'Could not load message.', error: error.message });
    }
};

// Admin: mark as read
exports.markAsRead = async (req, res) => {
    try {
        const entry = await Inbox.findByPk(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Message not found.' });
        await entry.update({ isRead: true });
        res.json({ message: 'Marked as read.', entry });
    } catch (error) {
        res.status(500).json({ message: 'Could not update message.', error: error.message });
    }
};

// Admin: delete message
exports.deleteMessage = async (req, res) => {
    try {
        const entry = await Inbox.findByPk(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Message not found.' });
        await entry.destroy();
        res.json({ message: 'Message deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Could not delete message.', error: error.message });
    }
};

// Admin: unread count (for alert badge)
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Inbox.count({ where: { isRead: false } });
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: 'Could not get count.', error: error.message });
    }
};
