require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { sequelize: existingSequelize } = require('./models/index');

const app = express();

const parseOrigins = (value) => (
    (value || '')
        .split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean)
);

const withWwwVariant = (origin) => {
    try {
        const url = new URL(origin);
        const variants = [origin];

        if (url.hostname.startsWith('www.')) {
            url.hostname = url.hostname.replace(/^www\./, '');
            variants.push(url.toString().replace(/\/+$/, ''));
        } else {
            url.hostname = `www.${url.hostname}`;
            variants.push(url.toString().replace(/\/+$/, ''));
        }

        return variants;
    } catch {
        return [origin];
    }
};

const allowedOrigins = [
    ...parseOrigins(process.env.CLIENT_URL),
    ...parseOrigins(process.env.FRONTEND_URL),
].flatMap(withWwwVariant);

const allowedOriginSet = new Set(allowedOrigins);

console.log('Allowed CORS Origins:', allowedOrigins);

app.use(cors({
    origin(origin, callback) {
        const normalizedOrigin = origin?.replace(/\/+$/, '');
        if (!origin || allowedOriginSet.has(normalizedOrigin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const admin               = require('./routes/adminRoutes');
const banners             = require('./routes/bannerRoutes');
const services            = require('./routes/serviceRoutes');
const inbox               = require('./routes/inboxRoutes');
const studentApplications = require('./routes/studentApplicationRoutes');

app.use('/api/admin',                admin);
app.use('/api/auth',                 admin);
app.use('/api/banners',              banners);
app.use('/api/services',             services);
app.use('/api/inbox',                inbox);
app.use('/api/student-applications', studentApplications);
const enquiries = require('./routes/enquiryRoutes');
app.use('/api/enquiries', enquiries);


const studiesAbroad = require('./routes/studiesAbroadRoutes');
const testSection   = require('./routes/testSectionRoutes'); 
const examRoutes    = require('./routes/examRoutes');
const education     = require('./routes/educationRoutes');
const scholarship   = require('./routes/scholarshipRoutes');

app.use('/api/studies-abroad/tests',        testSection);     
app.use('/api/studies-abroad/exams',        examRoutes);
app.use('/api/studies-abroad/educations',   education);
app.use('/api/studies-abroad/scholarships', scholarship);
app.use('/api/studies-abroad',              studiesAbroad);   


app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Aura Global Education API' });
});

const PORT = process.env.PORT || 30009;

existingSequelize.sync({ alter: false }).then(() => {
    console.log('DB Connected & Table Schemas Synced Perfectly.');
    app.listen(PORT, () => console.log(`System running on port ${PORT}`));
}).catch(err => console.error('Sync Error:', err));
