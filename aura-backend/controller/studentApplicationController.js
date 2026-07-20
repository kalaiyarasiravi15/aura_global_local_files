const {
    StudentApplication,
    StudiesAbroad,
    TestSection,
    Education,
    Enquiry
} = require('../models');
const nodemailer = require('nodemailer');

// ── Nodemailer transporter ─────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
    },
});

async function sendApplicationNotification(application, country, test, education) {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_PASS) return;
    const mailOptions = {
        from: `"Aura Global Education" <${process.env.ADMIN_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `✈️ New Student Application from ${application.fullName}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background:#1a1a2e;padding:24px 32px;">
            <h2 style="color:#c9a84c;margin:0;">Aura Global Education</h2>
            <p style="color:#aaa;margin:4px 0 0;">New Student Application Submitted</p>
          </div>
          <div style="padding:28px 32px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;width:160px;">Name</td><td style="padding:8px 0;font-weight:bold;">${application.fullName}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${application.email}">${application.email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;">${application.phone}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Destination Country</td><td style="padding:8px 0;">${country?.countryName || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Intake Window</td><td style="padding:8px 0;">${test ? `${test.startMonth} – ${test.endMonth} ${test.year}` : '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Education Level</td><td style="padding:8px 0;">${education?.name || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Received</td><td style="padding:8px 0;">${new Date().toLocaleString('en-IN')}</td></tr>
            </table>
          </div>
          <div style="background:#f5f5f5;padding:16px 32px;text-align:center;color:#999;font-size:13px;">
            Log in to your <strong>Admin Panel → Student Applications</strong> to view and manage this record.
          </div>
        </div>`,
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Nodemailer application error:', err.message);
    }
}

async function sendEnquiryApplicationNotification(enquiry) {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_PASS) return;
    const mailOptions = {
        from: `"Aura Global Education" <${process.env.ADMIN_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🌍 New Quick Enquiry from ${enquiry.fullName}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
          <div style="background:#1a1a2e;padding:24px 32px;">
            <h2 style="color:#c9a84c;margin:0;">Aura Global Education</h2>
            <p style="color:#aaa;margin:4px 0 0;">New Other Countries Quick Enquiry</p>
          </div>
          <div style="padding:28px 32px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;width:160px;">Name</td><td style="padding:8px 0;font-weight:bold;">${enquiry.fullName}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${enquiry.email}">${enquiry.email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;">${enquiry.phone}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Test Mode / Intake</td><td style="padding:8px 0;">${enquiry.testMode || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Education Level</td><td style="padding:8px 0;">${enquiry.education || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Source</td><td style="padding:8px 0;">Other Countries Card (Study Abroad Page)</td></tr>
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
        console.error('Nodemailer quick-enquiry error:', err.message);
    }
}

const includeDetails = [
    { model: StudiesAbroad, as: 'country', attributes: ['id', 'countryName'] },
    { model: TestSection, as: 'test', attributes: ['id', 'startMonth', 'endMonth', 'year', 'isActive'] },
    { model: Education, as: 'education', attributes: ['id', 'name'] }
];

exports.createApplication = async (req, res) => {
    try {
        const { studiesAbroadId, testSectionId, educationId, fullName, email, phone } = req.body;

        if (!studiesAbroadId) return res.status(400).json({ message: 'Country is required.' });
        if (!testSectionId) return res.status(400).json({ message: 'Test window is required.' });
        if (!educationId) return res.status(400).json({ message: 'Education is required.' });
        if (!fullName?.trim()) return res.status(400).json({ message: 'Full name is required.' });
        if (!email?.trim()) return res.status(400).json({ message: 'Email is required.' });
        if (!phone?.trim()) return res.status(400).json({ message: 'Phone number is required.' });

        const [country, test, education] = await Promise.all([
            StudiesAbroad.findByPk(studiesAbroadId),
            TestSection.findOne({ where: { id: testSectionId, studiesAbroadId } }),
            Education.findOne({ where: { id: educationId, studiesAbroadId } })
        ]);

        if (!country) return res.status(404).json({ message: 'Selected country was not found.' });
        if (!test) return res.status(404).json({ message: 'Selected test window does not belong to this country.' });
        if (!education) return res.status(404).json({ message: 'Selected education does not belong to this country.' });

        const application = await StudentApplication.create({
            studiesAbroadId,
            testSectionId,
            educationId,
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim()
        });

        // Send email notification to admin (non-blocking)
        sendApplicationNotification(application, country, test, education);

        const entry = await StudentApplication.findByPk(application.id, { include: includeDetails });
        res.status(201).json({ message: 'Application submitted successfully.', application: entry });
    } catch (error) {
        res.status(500).json({ message: 'Could not submit application.', error: error.message });
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        const applications = await StudentApplication.findAll({
            include: includeDetails,
            order: [['createdAt', 'DESC']]
        });
        res.json({ applications });
    } catch (error) {
        res.status(500).json({ message: 'Could not load applications.', error: error.message });
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const application = await StudentApplication.findByPk(req.params.id, { include: includeDetails });
        if (!application) return res.status(404).json({ message: 'Application not found.' });
        res.json({ application });
    } catch (error) {
        res.status(500).json({ message: 'Could not load application.', error: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await StudentApplication.count({ where: { isRead: false } });
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: 'Could not get count.', error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const application = await StudentApplication.findByPk(req.params.id);
        if (!application) return res.status(404).json({ message: 'Application not found.' });

        await application.update({ isRead: true });
        const entry = await StudentApplication.findByPk(req.params.id, { include: includeDetails });
        res.json({ message: 'Application marked as read.', application: entry });
    } catch (error) {
        res.status(500).json({ message: 'Could not update application.', error: error.message });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const application = await StudentApplication.findByPk(req.params.id);
        if (!application) return res.status(404).json({ message: 'Application not found.' });

        await application.destroy();
        res.json({ message: 'Application deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Could not delete application.', error: error.message });
    }
};

exports.createEnquiryApplication = async (req, res) => {
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
            note:     note || 'Other countries / quick enquiry',
        });

        // Send email notification to admin (non-blocking)
        sendEnquiryApplicationNotification(enquiry);

        res.status(201).json({ message: 'Enquiry submitted successfully.', enquiry });
    } catch (error) {
        res.status(500).json({ message: 'Could not submit enquiry.', error: error.message });
    }
};
