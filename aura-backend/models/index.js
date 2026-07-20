const sequelize = require('../config/db');

const StudiesAbroad = require('./studiesAbroad');
const TestSection   = require('./testSection');
const Education     = require('./education');
const Scholarship   = require('./scholarship');
const Exam          = require('./Exam');
const Program       = require('./Program');
const StudentApplication = require('./studentApplication');
const Enquiry = require('./enquiry');

// ── Pre-existing System Associations ─────────────────────────────────
StudiesAbroad.hasMany(TestSection,  { foreignKey: 'studiesAbroadId', as: 'tests',        onDelete: 'CASCADE' });
StudiesAbroad.hasMany(Education,    { foreignKey: 'studiesAbroadId', as: 'educations',   onDelete: 'CASCADE' });
StudiesAbroad.hasMany(Scholarship,  { foreignKey: 'studiesAbroadId', as: 'scholarships', onDelete: 'CASCADE' });

TestSection.belongsTo(StudiesAbroad,  { foreignKey: 'studiesAbroadId' });
Education.belongsTo(StudiesAbroad,    { foreignKey: 'studiesAbroadId' });
Scholarship.belongsTo(StudiesAbroad,  { foreignKey: 'studiesAbroadId', as: 'studiesAbroad' });

// ── New Linked Matrix Architecture Associations ────────────────────
StudiesAbroad.hasMany(Exam, { 
  foreignKey: 'studiesAbroadId', 
  as: 'exams', 
  onDelete: 'SET NULL' 
});
Exam.belongsTo(StudiesAbroad, { 
  foreignKey: 'studiesAbroadId',
  as: 'studiesAbroad'
});

Exam.hasMany(Program, { 
  foreignKey: 'examId', 
  as: 'programs', 
  onDelete: 'CASCADE' 
});
Program.belongsTo(Exam, { 
  foreignKey: 'examId',
  as: 'exam'
});

StudiesAbroad.hasMany(StudentApplication, {
  foreignKey: 'studiesAbroadId',
  as: 'studentApplications',
  onDelete: 'CASCADE'
});
StudentApplication.belongsTo(StudiesAbroad, {
  foreignKey: 'studiesAbroadId',
  as: 'country'
});

TestSection.hasMany(StudentApplication, {
  foreignKey: 'testSectionId',
  as: 'studentApplications',
  onDelete: 'CASCADE'
});
StudentApplication.belongsTo(TestSection, {
  foreignKey: 'testSectionId',
  as: 'test'
});

Education.hasMany(StudentApplication, {
  foreignKey: 'educationId',
  as: 'studentApplications',
  onDelete: 'CASCADE'
});
StudentApplication.belongsTo(Education, {
  foreignKey: 'educationId',
  as: 'education'
});

module.exports = {
    sequelize,
    StudiesAbroad,
    TestSection,
    Education,
    Scholarship,
    Exam,       
    Program,
    StudentApplication,
    Enquiry
};
