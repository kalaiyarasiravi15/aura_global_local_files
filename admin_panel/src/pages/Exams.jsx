import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  RiAddLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeLine,
  RiSave3Line,
  RiStackLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiTimeLine,
  RiBookOpenLine,
  RiMoneyDollarCircleLine
} from 'react-icons/ri';
import { API } from '../config';
import { toastConfirm } from '../components/toastConfirm';
import './Exams.css';

const emptyProgramRow = {
  title: '',
  duration: '',
  totalSessions: '',
  sessionDuration: '',
  timing: '',
  mockTests: '',
  price: '',
  isActive: true,
};

const emptyExamForm = {
  name: '',
  description: '',
  studiesAbroadId: '',
  programs: [{ ...emptyProgramRow }],
};

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [countries, setCountries] = useState([]);
  const [form, setForm] = useState(emptyExamForm);
  const [editingId, setEditingId] = useState(null);
  const [previewExam, setPreviewExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem('adminToken');
  const authHeaders = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const loadExams = async () => {
    setLoading(true);
    try {
      const [examRes, countryRes] = await Promise.all([
        axios.get(`${API}/studies-abroad/exams`),
        axios.get(`${API}/studies-abroad`),
      ]);
      setExams(Array.isArray(examRes.data) ? examRes.data : examRes.data.exams || []);
      setCountries(countryRes.data.countries || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load exams from core database matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const getCountryName = (countryId) => {
    const country = countries.find((item) => String(item.id) === String(countryId));
    return country?.countryName || (countryId ? `Country #${countryId}` : 'All Countries');
  };

  const updateMasterField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateProgramField = (index, event) => {
    const { name, value, type, checked } = event.target;
    const updatedPrograms = [...form.programs];
    
    updatedPrograms[index] = {
      ...updatedPrograms[index],
      [name]: type === 'checkbox' ? checked : value,
    };

    setForm((current) => ({
      ...current,
      programs: updatedPrograms,
    }));
  };

  const addProgramRowSlot = () => {
    if (form.programs.length >= 10) {
      toast.warning('Boundary Rule Met: Maximum limit of 10 program tracks reached inside this single module block.');
      return;
    }
    setForm((current) => ({
      ...current,
      programs: [...current.programs, { ...emptyProgramRow }],
    }));
  };

  const removeProgramRowSlot = (index) => {
    if (form.programs.length === 1) {
      toast.error('Validation Denied: One single master Exam block must house at least 1 active pricing configuration program row.');
      return;
    }
    const updatedPrograms = form.programs.filter((_, idx) => idx !== index);
    setForm((current) => ({
      ...current,
      programs: updatedPrograms,
    }));
  };

  const closeFormView = () => {
    setEditingId(null);
    setForm(emptyExamForm);
    setIsFormOpen(false);
  };

  const openAddView = () => {
    setEditingId(null);
    setForm(emptyExamForm);
    setIsFormOpen(true);
  };

  const openEditView = (exam) => {
    setEditingId(exam.id);
    setForm({
      name: exam.name || '',
      description: exam.description || '',
      studiesAbroadId: exam.studiesAbroadId ? String(exam.studiesAbroadId) : '',
      programs: exam.programs && exam.programs.length > 0 
        ? exam.programs.map(p => ({
            title: p.title || '',
            duration: p.duration || '',
            totalSessions: p.totalSessions || '',
            sessionDuration: p.sessionDuration || '',
            timing: p.timing || '',
            mockTests: p.mockTests || '',
            price: p.price || '',
            isActive: p.isActive !== undefined ? p.isActive : true,
          }))
        : [{ ...emptyProgramRow }],
    });
    setIsFormOpen(true);
  };

  const submitExamWithMatrix = async (event) => {
    event.preventDefault();
    setSaving(true);

    const cleanPayload = {
      ...form,
      studiesAbroadId: form.studiesAbroadId ? Number(form.studiesAbroadId) : null,
      programs: form.programs.map(p => ({
        ...p,
        totalSessions: parseInt(p.totalSessions, 10),
        mockTests: parseInt(p.mockTests, 10),
        price: parseFloat(p.price)
      }))
    };

    try {
      if (editingId) {
        await axios.put(`${API}/studies-abroad/exams/${editingId}`, cleanPayload, authHeaders);
        toast.success('Exam structure and program matrices updated seamlessly.');
      } else {
        await axios.post(`${API}/studies-abroad/exams`, cleanPayload, authHeaders);
        toast.success('New Exam framework published successfully.');
      }
      closeFormView();
      loadExams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error occurred while saving configuration maps.');
    } finally {
      setSaving(false);
    }
  };

  const deleteExamCategory = async (id) => {
    toastConfirm('Delete this exam? This will also remove all nested program configurations.', async () => {
      try {
        await axios.delete(`${API}/studies-abroad/exams/${id}`, authHeaders);
        toast.success('Exam entry deleted.');
        loadExams();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not delete exam.');
      }
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = exams.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(exams.length / itemsPerPage);

  return (
    <section className="exams-main">
      <header className="exams-header">
        <div>
          <p>Aura Global Education</p>
          <h1>Exams</h1>
          {/* <span>Manage exam courses, program batches, timings, mock tests and pricing.</span> */}
        </div>
        {!isFormOpen && (
          <button type="button" className="add-exam-btn" onClick={openAddView}>
            <RiAddLine /> Add Exam
          </button>
        )}
      </header>

      {isFormOpen ? (
        <section className="form-view-container">
          <form className="exams-form" onSubmit={submitExamWithMatrix}>
            <div className="form-title">
              <RiStackLine />
              <div>
                <p>{editingId ? 'Update Exam' : 'Add Exam'}</p>
                <span>{editingId ? `Editing exam #${editingId}` : 'Create an exam and attach up to 10 program batches.'}</span>
              </div>
            </div>

            <div className="master-form-section">
              <div className="form-row-three">
                <label>
                  Exam Name *
                  <input name="name" value={form.name} onChange={updateMasterField} required placeholder="e.g. IELTS Academic preparation track" />
                </label>
                <label>
                  Country
                  <select name="studiesAbroadId" value={form.studiesAbroadId} onChange={updateMasterField}>
                    <option value="">All Countries</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.countryName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="full-label">
                Description
                <textarea name="description" value={form.description} onChange={updateMasterField} rows="3" placeholder="Brief program curriculum synopsis outlines..." />
              </label>
            </div>

            <div className="matrix-sub-heading">
              <h3>Program Batches</h3>
              <p>Assign duration, sessions, schedule, mock tests and price.</p>
            </div>

            <div className="programs-dynamic-container">
              {form.programs.map((program, index) => (
                <div key={index} className="program-row-card">
                  <div className="program-row-header">
                    <h4>Program {index + 1}</h4>
                    {form.programs.length > 1 && (
                      <button type="button" className="remove-row-btn" onClick={() => removeProgramRowSlot(index)}>
                        <RiDeleteBinLine /> Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="program-fields-grid">
                    <label>
                      Program Title *
                      <input name="title" value={program.title} onChange={(e) => updateProgramField(index, e)} required placeholder="e.g. Extensive Program, Weekend Batch" />
                    </label>
                    <label>
                      Duration *
                      <input name="duration" value={program.duration} onChange={(e) => updateProgramField(index, e)} required placeholder="e.g. 4 Weeks, 3 Months" />
                    </label>
                    <label>
                      Total Sessions *
                      <input name="totalSessions" type="number" value={program.totalSessions} onChange={(e) => updateProgramField(index, e)} required placeholder="e.g. 20" />
                    </label>
                    <label>
                      Session Length *
                      <input name="sessionDuration" value={program.sessionDuration} onChange={(e) => updateProgramField(index, e)} required placeholder="e.g. 1 Hour, 2 Hours" />
                    </label>
                    <label>
                      Schedule *
                      <input name="timing" value={program.timing} onChange={(e) => updateProgramField(index, e)} required placeholder="e.g. Mon - Fri 12:00 pm to 1:00 pm" />
                    </label>
                    <label>
                      Mock Tests *
                      <input name="mockTests" type="number" value={program.mockTests} onChange={(e) => updateProgramField(index, e)} required placeholder="e.g. 4" />
                    </label>
                    <label>
                      Price (INR) *
                      <input name="price" type="number" step="0.01" value={program.price} onChange={(e) => updateProgramField(index, e)} required placeholder="e.g. 7999.00" />
                    </label>
                    <label className="checkbox-label-wrapper">
                      <span>Course Status</span>
                      <div className="custom-checkbox-switch">
                        <input name="isActive" type="checkbox" checked={program.isActive} onChange={(e) => updateProgramField(index, e)} id={`isActive-${index}`} />
                        <label htmlFor={`isActive-${index}`}>Active / Open</label>
                      </div>
                    </label>
                  </div>
                </div>
              ))}

              <button type="button" className="add-matrix-row-btn" onClick={addProgramRowSlot}>
                <RiAddLine /> Add Program
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={saving}>
                {editingId ? <RiSave3Line /> : <RiAddLine />}
                {saving ? 'Saving...' : editingId ? 'Update Exam' : 'Save Exam'}
              </button>
              <button type="button" className="ghost-btn" onClick={closeFormView}>
                <RiCloseLine /> Cancel
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="table-view-container">
          <div className="table-responsive">
            <table className="ui-exams-table">
              <thead>
                <tr>
                  <th>Exam / Course Structure Name</th>
                  <th>Country</th>
                  <th>Program Batches</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="table-empty-state">Loading exams...</td>
                  </tr>
                ) : currentExams.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="table-empty-state">No exams added yet.</td>
                  </tr>
                ) : (
                  currentExams.map((exam) => (
                    <tr key={exam.id}>
                      <td className="td-exam-info">
                        <div className="exam-icon-wrapper">
                          <RiBookOpenLine className="fallback-table-icon-exam" />
                        </div>
                        <span className="exam-title-text">{exam.name}</span>
                      </td>
                      <td className="td-category-reference">
                        <span className="reference-tag-pill">{getCountryName(exam.studiesAbroadId)}</span>
                      </td>
                      <td className="td-batches-count">
                        <span className="matrix-count-indicator">
                          {exam.programs ? exam.programs.length : 0} Programs
                        </span>
                      </td>
                      <td className="td-actions">
                        <button type="button" className="table-action-icon view" title="View" onClick={() => setPreviewExam(exam)}>
                          <RiEyeLine />
                        </button>
                        <button type="button" className="table-action-icon edit" title="Edit" onClick={() => openEditView(exam)}>
                          <RiEditLine />
                        </button>
                        <button type="button" className="table-action-icon delete" title="Delete" onClick={() => deleteExamCategory(exam.id)}>
                          <RiDeleteBinLine />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages >= 1 && (
            <footer className="table-pagination-footer">
              <span className="pagination-text">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, exams.length)} of {exams.length} exams
              </span>
              <div className="pagination-controls-wrapper">
                <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="page-control-arrow">
                  <RiArrowLeftSLine />
                </button>
                <div className="page-numbers-group">
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <button key={idx + 1} type="button" className={`page-num-btn ${currentPage === idx + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(idx + 1)}>
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className="page-control-arrow">
                  <RiArrowRightSLine />
                </button>
              </div>
            </footer>
          )}
        </section>
      )}

      {previewExam ? (
        <div className="preview-backdrop" role="presentation" onClick={() => setPreviewExam(null)}>
          <article className="preview-modal-exam" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setPreviewExam(null)}>
              <RiCloseLine />
            </button>
            <h2>{previewExam.name}</h2>
            <span className="modal-sub-tag">Country: {getCountryName(previewExam.studiesAbroadId)}</span>
            
            <div className="modal-scroll-desc-exam">
              <strong className="block-label">Description</strong>
              <p className="desc-paragraph-text">{previewExam.description || 'No description added.'}</p>
              
              <strong className="block-label" style={{ marginTop: '20px' }}>Program Batches</strong>
              <div className="modal-matrix-cards-stack">
                {previewExam.programs && previewExam.programs.length > 0 ? (
                  previewExam.programs.map((prog, keyId) => (
                    <div key={keyId} className={`modal-matrix-program-card ${prog.isActive ? 'border-active' : 'border-disabled'}`}>
                      <div className="card-top-header-pill">
                        <h5>{prog.title}</h5>
                        <span className={`status-badge-indicator ${prog.isActive ? 'active-color' : 'disabled-color'}`}>
                          {prog.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="card-metadata-grid">
                        <span><RiTimeLine /> {prog.duration} ({prog.totalSessions} sessions)</span>
                        <span><RiBookOpenLine /> {prog.sessionDuration} per class | {prog.mockTests} Mocks</span>
                        <span className="timing-text-span"><strong>Schedule:</strong> {prog.timing}</span>
                        <span className="price-tag-text-span"><RiMoneyDollarCircleLine /> ₹{parseFloat(prog.price).toLocaleString('en-IN')} INR</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-matrix-rows-text text-muted">No program batches added.</p>
                )}
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
};

export default Exams;