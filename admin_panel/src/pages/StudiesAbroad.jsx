import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  RiAddLine, RiCloseLine, RiDeleteBinLine, RiEditLine, RiEyeLine,
  RiGlobalLine, RiToggleLine, RiToggleFill,
  RiGraduationCapLine, RiMedalLine, RiCalendarLine, RiMapPinLine,
  RiArrowLeftSLine, RiArrowRightSLine, RiCheckLine,
} from 'react-icons/ri';
import { API } from '../config';
import { toastConfirm } from '../components/toastConfirm';
import './StudiesAbroad.css';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const REQUIRED_IMG_W = 381;
const REQUIRED_IMG_H = 285;
const MAX_FEATURES   = 3;

const emptyCountry = { countryName: '', description: '', features: [], image: null };
const emptyTest    = { startMonth: '', endMonth: '', year: '', isActive: true };
const emptyEdu     = { name: '' };
const emptyScholar = { coursename: '', amount: '', description: '', isActive: true };

const authHdr = () => ({ Authorization: `Bearer ${localStorage.getItem('adminToken')}` });

function Toggle({ active, onToggle }) {
  return (
    <button
      className={`sa-toggle ${active ? 'sa-toggle--on' : 'sa-toggle--off'}`}
      onClick={onToggle}
      title={active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
    >
      {active ? <RiToggleFill /> : <RiToggleLine />}
      <span>{active ? 'Active' : 'Inactive'}</span>
    </button>
  );
}

export default function StudiesAbroad() {

  const apiRoot = useMemo(() => {
  return import.meta.env.VITE_IMG_URL || API.replace('/api', '/uploads');
}, []);
  const imgInput = useRef(null);

  const [countries,   setCountries]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editId,      setEditId]      = useState(null);
  const [preview,     setPreview]     = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [cForm,        setCForm]        = useState(emptyCountry);
  const [featureInput, setFeatureInput] = useState('');
  const [cSaving,      setCSaving]      = useState(false);
  const [imgFileName,  setImgFileName]  = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [tErrors,     setTErrors]     = useState({});
  const [eErrors,     setEErrors]     = useState({});
  const [sErrors,     setSErrors]     = useState({});

  const [tests,    setTests]    = useState([]);
  const [edus,     setEdus]     = useState([]);
  const [scholars, setScholars] = useState([]);

  const [tForm, setTForm] = useState(emptyTest);
  const [eForm, setEForm] = useState(emptyEdu);
  const [sForm, setSForm] = useState(emptyScholar);

  const loadCountries = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/studies-abroad`);
      setCountries(data.countries || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load countries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCountries(); }, []);

  const imgSrc = img => !img ? '' : img.startsWith('http') ? img : `${apiRoot}${img}`;
  const isLive = id => !String(id).includes('tmp_');

  const resetAll = () => {
    setFieldErrors({});
    setTErrors({});
    setEErrors({});
    setSErrors({});
    setImgFileName('');
  };

  const openAdd = () => {
    setEditId(null);
    setCForm(emptyCountry);
    setFeatureInput('');
    setTests([]); setEdus([]); setScholars([]);
    setTForm(emptyTest); setEForm(emptyEdu); setSForm(emptyScholar);
    resetAll();
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setCForm({ countryName: c.countryName, description: c.description || '', features: c.features || [], image: null });
    setFeatureInput('');
    setTests(c.tests || []);
    setEdus(c.educations || []);
    setScholars(c.scholarships || []);
    setTForm(emptyTest); setEForm(emptyEdu); setSForm(emptyScholar);
    resetAll();
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); resetAll(); };

  // ── Image validation: exactly 381x285
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width !== REQUIRED_IMG_W || img.height !== REQUIRED_IMG_H) {
        toast.error(
          `Image must be exactly ${REQUIRED_IMG_W}×${REQUIRED_IMG_H}px. Your image is ${img.width}×${img.height}px.`,
          { autoClose: 6000 }
        );
        e.target.value = '';
        setCForm(f => ({ ...f, image: null }));
        setImgFileName('');
        setFieldErrors(prev => ({ ...prev, image: true }));
        return;
      }
      setCForm(f => ({ ...f, image: file }));
      setImgFileName(file.name);
      setFieldErrors(prev => ({ ...prev, image: false }));
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); toast.error('Could not read image.'); };
    img.src = objectUrl;
  };

  // ── Input class helpers
  const ic = (errKey, val) => {
    if (fieldErrors[errKey] === undefined) return 'sa-input';
    if (fieldErrors[errKey]) return 'sa-input sa-input--error';
    return val ? 'sa-input sa-input--success' : 'sa-input';
  };
  const tc = (errKey, val) => {
    if (tErrors[errKey] === undefined) return 'sa-input';
    if (tErrors[errKey]) return 'sa-input sa-input--error';
    return val ? 'sa-input sa-input--success' : 'sa-input';
  };
  const ec = (errKey, val) => {
    if (eErrors[errKey] === undefined) return 'sa-input';
    if (eErrors[errKey]) return 'sa-input sa-input--error';
    return val ? 'sa-input sa-input--success' : 'sa-input';
  };

  // ── Features (max 3)
  const addFeature = () => {
    const v = featureInput.trim();
    if (!v) return;
    if (cForm.features.length >= MAX_FEATURES) { toast.warn(`Max ${MAX_FEATURES} features allowed.`); return; }
    setCForm(f => ({ ...f, features: [...f.features, v] }));
    setFeatureInput('');
    setFieldErrors(prev => ({ ...prev, features: false }));
  };
  const removeFeature = i => {
    setCForm(f => {
      const updated = f.features.filter((_, idx) => idx !== i);
      setFieldErrors(prev => ({ ...prev, features: updated.length === 0 ? true : false }));
      return { ...f, features: updated };
    });
  };

  // ── Staged test
  const addStagedTest = () => {
    const errs = {};
    if (!tForm.startMonth) errs.startMonth = true;
    if (!tForm.endMonth)   errs.endMonth   = true;
    if (!tForm.year)       errs.year       = true;
    if (Object.keys(errs).length) {
      setTErrors(errs);
      toast.error('Please fill all test window fields.');
      return;
    }
    setTErrors({});
    setTests(prev => [...prev, { ...tForm, id: `tmp_${Date.now()}_${Math.random()}` }]);
    setTForm(emptyTest);
    setFieldErrors(prev => ({ ...prev, tests: false }));
  };
  const removeStagedTest = id => setTests(prev => {
    const updated = prev.filter(t => t.id !== id);
    setFieldErrors(p => ({ ...p, tests: updated.length === 0 ? true : false }));
    return updated;
  });
  const toggleStagedTest = id => setTests(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));

  // ── Staged edu
  const addStagedEdu = () => {
    if (!eForm.name.trim()) {
      setEErrors({ name: true });
      toast.error('Please enter a program name.');
      return;
    }
    setEErrors({ name: false });
    setEdus(prev => [...prev, { name: eForm.name.trim(), id: `tmp_${Date.now()}_${Math.random()}` }]);
    setEForm(emptyEdu);
    setFieldErrors(prev => ({ ...prev, edus: false }));
  };
  const removeStagedEdu = id => setEdus(prev => {
    const updated = prev.filter(e => e.id !== id);
    setFieldErrors(p => ({ ...p, edus: updated.length === 0 ? true : false }));
    return updated;
  });

  // ── Staged scholar (optional)
  const addStagedScholar = () => {
    if (!sForm.coursename.trim()) {
      setSErrors({ coursename: true });
      toast.error('Please enter a scholarship name.');
      return;
    }
    setSErrors({ coursename: false });
    setScholars(prev => [...prev, { ...sForm, id: `tmp_${Date.now()}_${Math.random()}` }]);
    setSForm(emptyScholar);
  };
  const removeStagedScholar = id => setScholars(prev => prev.filter(s => s.id !== id));
  const toggleStagedScholar = id => setScholars(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));

  // ── Live toggles
  const toggleLiveTest = async (id) => {
    try {
      await axios.patch(`${API}/studies-abroad/tests/${id}/toggle`, {}, { headers: authHdr() });
      setTests(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
      toast.success('Test status updated.');
    } catch (err) { toast.error(err.response?.data?.message || 'Could not toggle test.'); }
  };
  const toggleLiveScholar = async (id) => {
    try {
      await axios.patch(`${API}/studies-abroad/scholarships/${id}/toggle`, {}, { headers: authHdr() });
      setScholars(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
      setCountries(prev => prev.map(c => ({
        ...c,
        scholarships: (c.scholarships || []).map(s => s.id === id ? { ...s, isActive: !s.isActive } : s),
      })));
      toast.success('Scholarship status updated.');
    } catch (err) { toast.error(err.response?.data?.message || 'Could not toggle scholarship.'); }
  };

  // ── Live deletes
  const deleteLiveTest = async (id) => {
    toastConfirm('Delete this test window?', async () => {
      try {
        await axios.delete(`${API}/studies-abroad/tests/${id}`, { headers: authHdr() });
        setTests(prev => prev.filter(t => t.id !== id));
        toast.success('Test deleted.');
      } catch (err) { toast.error(err.response?.data?.message || 'Could not delete test.'); }
    });
  };
  const deleteLiveEdu = async (id) => {
    toastConfirm('Delete this education program?', async () => {
      try {
        await axios.delete(`${API}/studies-abroad/educations/${id}`, { headers: authHdr() });
        setEdus(prev => prev.filter(e => e.id !== id));
        toast.success('Education program deleted.');
      } catch (err) { toast.error(err.response?.data?.message || 'Could not delete education program.'); }
    });
  };
  const deleteLiveScholar = async (id) => {
    toastConfirm('Delete this scholarship?', async () => {
      try {
        await axios.delete(`${API}/studies-abroad/scholarships/${id}`, { headers: authHdr() });
        setScholars(prev => prev.filter(s => s.id !== id));
        toast.success('Scholarship deleted.');
      } catch (err) { toast.error(err.response?.data?.message || 'Could not delete scholarship.'); }
    });
  };

  const deleteCountry = async (id) => {
    toastConfirm('Delete this country and all its data? This cannot be undone.', async () => {
      try {
        await axios.delete(`${API}/studies-abroad/${id}`, { headers: authHdr() });
        toast.success('Country deleted.');
        await loadCountries();
      } catch (err) { toast.error(err.response?.data?.message || 'Could not delete country.'); }
    });
  };

  // ── SUBMIT with full validation
  const handleSubmit = async () => {
    const errs = {};
    let firstError = null;

    if (!cForm.countryName.trim()) { errs.countryName = true; firstError = firstError || 'Country name is required.'; }
    else errs.countryName = false;

    if (!cForm.description.trim()) { errs.description = true; firstError = firstError || 'Description is required.'; }
    else errs.description = false;

    if (!cForm.image && !editId) { errs.image = true; firstError = firstError || `Cover image is required (${REQUIRED_IMG_W}×${REQUIRED_IMG_H}px).`; }
    else errs.image = false;

    if (cForm.features.length === 0) { errs.features = true; firstError = firstError || 'Add at least one key feature.'; }
    else errs.features = false;

    if (tests.length === 0) { errs.tests = true; firstError = firstError || 'Add at least one test window.'; }
    else errs.tests = false;

    if (edus.length === 0) { errs.edus = true; firstError = firstError || 'Add at least one education program.'; }
    else errs.edus = false;

    setFieldErrors(errs);

    if (firstError) {
      if (errs.countryName)  toast.error('Country name is required.');
      if (errs.description)  toast.error('Description is required.');
      if (errs.image)        toast.error(`Cover image is required (${REQUIRED_IMG_W}×${REQUIRED_IMG_H}px).`);
      if (errs.features)     toast.error('Add at least one key feature.');
      if (errs.tests)        toast.error('Add at least one test window.');
      if (errs.edus)         toast.error('Add at least one education program.');
      return;
    }

    setCSaving(true);
    try {
      let countryId = editId;
      const fd = new FormData();
      fd.append('countryName', cForm.countryName.trim());
      fd.append('description', cForm.description || '');
      fd.append('features',    JSON.stringify(cForm.features));
      if (cForm.image) fd.append('image', cForm.image);

      if (editId) {
        await axios.put(`${API}/studies-abroad/${editId}`, fd, { headers: authHdr() });
        toast.success('Country updated.');
      } else {
        const { data } = await axios.post(`${API}/studies-abroad`, fd, { headers: authHdr() });
        countryId = data.country?.id ?? data.id;
        toast.success('Country added.');
      }

      if (!countryId) { toast.error('Failed to get country ID.'); setCSaving(false); return; }

      const newTests    = tests.filter(t => String(t.id).includes('tmp_'));
      const newEdus     = edus.filter(e => String(e.id).includes('tmp_'));
      const newScholars = scholars.filter(s => String(s.id).includes('tmp_'));

      const savePromises = [
        ...newTests.map(test =>
          axios.post(`${API}/studies-abroad/tests`,
            { startMonth: test.startMonth, endMonth: test.endMonth, year: Number(test.year), isActive: test.isActive, studiesAbroadId: countryId },
            { headers: authHdr() })
        ),
        ...newEdus.map(edu =>
          axios.post(`${API}/studies-abroad/educations`,
            { name: edu.name.trim(), studiesAbroadId: countryId },
            { headers: authHdr() })
        ),
        ...newScholars.map(scholar =>
          axios.post(`${API}/studies-abroad/scholarships`,
            { coursename: scholar.coursename.trim(), amount: scholar.amount ? Number(scholar.amount) : null, description: scholar.description || '', isActive: scholar.isActive, studiesAbroadId: countryId },
            { headers: authHdr() })
        ),
      ];

      if (savePromises.length > 0) {
        const results = await Promise.allSettled(savePromises);
        const failed  = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          toast.warning(`${savePromises.length - failed.length}/${savePromises.length} items saved.`);
        } else {
          toast.success(`All ${savePromises.length} sub-items saved!`);
        }
      }

      closeModal();
      await loadCountries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save.');
    } finally {
      setCSaving(false);
    }
  };

  const totalScholarships = countries.reduce((a, c) => a + (c.scholarships || []).length, 0);
  const totalPrograms     = countries.reduce((a, c) => a + (c.educations   || []).length, 0);

  const indexOfLastItem  = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCountries = countries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages       = Math.ceil(countries.length / itemsPerPage);

  return (
    <>
      <section className="sa-main">

        <header className="sa-header">
          <div className="sa-header-left">
            <p className="sa-eyebrow">Aura Global Education</p>
            <h1 className="sa-title">Studies Abroad</h1>
          </div>
          <button className="sa-add-btn" onClick={openAdd}>
            <RiAddLine /> Add New Country
          </button>
        </header>

        <div className="sa-stats">
          <div className="sa-stat"><span className="sa-stat-val">{countries.length}</span><span className="sa-stat-lbl">Countries</span></div>
          <div className="sa-stat"><span className="sa-stat-val">{totalScholarships}</span><span className="sa-stat-lbl">Scholarships</span></div>
          <div className="sa-stat"><span className="sa-stat-val">{totalPrograms}</span><span className="sa-stat-lbl">Programs</span></div>
        </div>

        <div className="sa-table-wrap">
          <div className="sa-table-responsive">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Key Features</th>
                  <th>Test Windows</th>
                  <th>Education Programs</th>
                  <th>Scholarships</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="sa-td-empty"><div className="sa-spinner" /></td></tr>
                ) : countries.length === 0 ? (
                  <tr><td colSpan={6} className="sa-td-empty"><RiGlobalLine /><span>No countries added yet</span></td></tr>
                ) : currentCountries.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="sa-country-cell">
                        <div className="sa-thumb">
                          {c.image ? <img src={imgSrc(c.image)} alt={c.countryName} /> : <RiGlobalLine />}
                        </div>
                        <div>
                          <div className="sa-country-name">{c.countryName}</div>
                          {c.description && <div className="sa-country-desc">{c.description.slice(0, 50)}{c.description.length > 50 ? '…' : ''}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="sa-chips">
                        {(c.features || []).length === 0
                          ? <span className="sa-chip sa-chip--muted">None</span>
                          : (c.features || []).slice(0, 3).map((feat, idx) => <span key={idx} className="sa-chip sa-chip--purple">{feat}</span>)
                        }
                        {(c.features || []).length > 3 && <span className="sa-chip sa-chip--muted">+{(c.features||[]).length - 3}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="sa-chips">
                        {(c.tests || []).length === 0
                          ? <span className="sa-chip sa-chip--muted">None</span>
                          : (c.tests || []).slice(0, 2).map(t => (
                            <span key={t.id} className={`sa-chip ${t.isActive ? 'sa-chip--blue' : 'sa-chip--muted'}`}>
                              <RiCalendarLine /> {t.startMonth.slice(0,3)} – {t.endMonth.slice(0,3)} {t.year}
                            </span>
                          ))
                        }
                        {(c.tests || []).length > 2 && <span className="sa-chip sa-chip--muted">+{(c.tests||[]).length - 2}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="sa-chips">
                        {(c.educations || []).length === 0
                          ? <span className="sa-chip sa-chip--muted">None</span>
                          : (c.educations || []).slice(0, 2).map(e => (
                            <span key={e.id} className="sa-chip sa-chip--green">
                              <RiGraduationCapLine /> {e.name.slice(0,22)}{e.name.length > 22 ? '…' : ''}
                            </span>
                          ))
                        }
                        {(c.educations || []).length > 2 && <span className="sa-chip sa-chip--muted">+{(c.educations||[]).length - 2}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="sa-chips">
                        {(c.scholarships || []).length === 0
                          ? <span className="sa-chip sa-chip--muted">None</span>
                          : (c.scholarships || []).slice(0, 2).map(s => (
                            <span key={s.id} className={`sa-chip ${s.isActive ? 'sa-chip--amber' : 'sa-chip--muted'}`}>
                              <RiMedalLine /> {s.coursename.slice(0,20)}{s.coursename.length > 20 ? '…' : ''}
                              {s.amount ? ` ₹${Number(s.amount).toLocaleString()}` : ''}
                            </span>
                          ))
                        }
                        {(c.scholarships || []).length > 2 && <span className="sa-chip sa-chip--muted">+{(c.scholarships||[]).length - 2}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="sa-action-btns">
                        <button className="sa-action-btn" title="Preview" onClick={() => setPreview(c)}><RiEyeLine /></button>
                        <button className="sa-action-btn" title="Edit"    onClick={() => openEdit(c)}><RiEditLine /></button>
                        <button className="sa-action-btn sa-action-btn--danger" title="Delete" onClick={() => deleteCountry(c.id)}><RiDeleteBinLine /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages >= 1 && (
            <footer className="sa-pagination-footer">
              <span className="sa-pagination-text">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, countries.length)} of {countries.length} countries
              </span>
              <div className="sa-pagination-controls">
                <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} className="sa-page-arrow"><RiArrowLeftSLine /></button>
                <div className="sa-page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i + 1} type="button" className={`sa-page-num ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  ))}
                </div>
                <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} className="sa-page-arrow"><RiArrowRightSLine /></button>
              </div>
            </footer>
          )}
        </div>
      </section>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="sa-backdrop" onClick={closeModal}>
          <div className="sa-modal" onClick={e => e.stopPropagation()}>

            <div className="sa-modal-topbar">
              <div>
                <p className="sa-modal-eyebrow"><RiMapPinLine /> {editId ? 'Edit Country' : 'Add New Country'}</p>
                <h2 className="sa-modal-title">{editId ? 'Update destination details' : 'Register a new destination'}</h2>
              </div>
              <button className="sa-modal-close" onClick={closeModal}><RiCloseLine /></button>
            </div>

            <div className="sa-modal-body">

              {/* 01 Country Details */}
              <div className="sa-section-head">
                <span className="sa-section-num">01</span> Country Details
              </div>

              <div className="sa-form-row sa-form-row--2">
                <label className="sa-label">
                  Country Name <span className="sa-required">*</span>
                  <input
                    className={ic('countryName', cForm.countryName)}
                    value={cForm.countryName}
                    onChange={e => {
                      setCForm(f => ({ ...f, countryName: e.target.value }));
                      setFieldErrors(prev => ({ ...prev, countryName: !e.target.value.trim() }));
                    }}
                    placeholder="e.g. United Kingdom"
                  />
                  {fieldErrors.countryName && <span className="sa-field-err">Country name is required</span>}
                </label>

                {/* ── New dropzone image upload ── */}
                <label className="sa-label">
                  Image <span className="sa-required">*</span>
                  <span className="sa-img-hint">({REQUIRED_IMG_W}×{REQUIRED_IMG_H}px)</span>
                  <div
                    className={`sa-file-dropzone${fieldErrors.image === true ? ' sa-file-dropzone--error' : fieldErrors.image === false ? ' sa-file-dropzone--success' : ''}`}
                    onClick={() => imgInput.current?.click()}
                  >
                    <input
                      ref={imgInput}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageChange}
                    />
                    <div className="sa-file-dropzone-icon">
                      {fieldErrors.image === false ? (
                        <RiCheckLine size={28} />
                      ) : (
                        /* Upload arrow SVG */
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                          strokeLinejoin="round" width="28" height="28">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      )}
                    </div>
                    <span className="sa-file-dropzone-label">
                      {imgFileName || 'Click to select image'}
                    </span>
                    {!imgFileName ? (
                      <>
                        <span className="sa-file-dropzone-formats">PNG, JPG, JPEG, WEBP, GIF</span>
                        <span className="sa-file-dropzone-size">Required size: {REQUIRED_IMG_W}×{REQUIRED_IMG_H}px</span>
                      </>
                    ) : (
                      <span className="sa-file-dropzone-formats">✓ Image selected</span>
                    )}
                  </div>
                  {fieldErrors.image === true && (
                    <span className="sa-field-err">Valid {REQUIRED_IMG_W}×{REQUIRED_IMG_H}px image required</span>
                  )}
                </label>
              </div>

              <label className="sa-label">
                Description <span className="sa-required">*</span>
                <textarea
                  className={`${ic('description', cForm.description)} sa-textarea`}
                  rows={2}
                  value={cForm.description}
                  onChange={e => {
                    setCForm(f => ({ ...f, description: e.target.value }));
                    setFieldErrors(prev => ({ ...prev, description: !e.target.value.trim() }));
                  }}
                  placeholder="Brief overview of study options in this country…"
                />
                {fieldErrors.description && <span className="sa-field-err">Description is required</span>}
              </label>

              <div className="sa-features-wrap">
                <div className="sa-features-label">
                  Key Features <span className="sa-required">*</span>
                  <span className="sa-badge">{cForm.features.length}/{MAX_FEATURES}</span>
                </div>
                {fieldErrors.features && cForm.features.length === 0 && (
                  <span className="sa-field-err">At least one key feature is required</span>
                )}
                {cForm.features.length > 0 && (
                  <div className="sa-feature-tags">
                    {cForm.features.map((f, i) => (
                      <span key={i} className="sa-feat-tag">
                        {f}
                        <button type="button" onClick={() => removeFeature(i)}><RiCloseLine /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="sa-feat-input-row">
                  <input
                    className={`sa-input${fieldErrors.features && cForm.features.length === 0 ? ' sa-input--error' : cForm.features.length > 0 ? ' sa-input--success' : ''}`}
                    value={featureInput}
                    onChange={e => setFeatureInput(e.target.value)}
                    placeholder={cForm.features.length >= MAX_FEATURES ? `Maximum ${MAX_FEATURES} features reached` : 'Type a feature and press Enter or click +'}
                    disabled={cForm.features.length >= MAX_FEATURES}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                  />
                  <button
                    type="button"
                    className="sa-mini-add-btn"
                    onClick={addFeature}
                    disabled={cForm.features.length >= MAX_FEATURES}
                  >
                    <RiAddLine />
                  </button>
                </div>
              </div>

              {/* 02 Test Windows */}
              <div className={`sa-section-head${fieldErrors.tests && tests.length === 0 ? ' sa-section-head--error' : ''}`}>
                <span className="sa-section-num">02</span> Test Windows <span className="sa-required">*</span>
                {fieldErrors.tests && tests.length === 0 && (
                  <span className="sa-section-err">At least one test window required</span>
                )}
              </div>

              {tests.length > 0 && (
                <div className="sa-sub-list">
                  {tests.map(t => (
                    <div key={t.id} className="sa-sub-row">
                      <RiCalendarLine className="sa-sub-icon sa-sub-icon--blue" />
                      <span className="sa-sub-label">{t.startMonth} – {t.endMonth} {t.year}</span>
                      <div className="sa-sub-actions">
                        <Toggle active={t.isActive} onToggle={() => isLive(t.id) ? toggleLiveTest(t.id) : toggleStagedTest(t.id)} />
                        <button className="sa-action-btn sa-action-btn--danger sa-action-btn--sm" onClick={() => isLive(t.id) ? deleteLiveTest(t.id) : removeStagedTest(t.id)}><RiDeleteBinLine /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="sa-form-row sa-form-row--3">
                <label className="sa-label">Start Month
                  <select className={tc('startMonth', tForm.startMonth)} value={tForm.startMonth} onChange={e => { setTForm(f => ({ ...f, startMonth: e.target.value })); setTErrors(p => ({ ...p, startMonth: !e.target.value })); }}>
                    <option value="">Select…</option>
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                  {tErrors.startMonth && <span className="sa-field-err">Required</span>}
                </label>
                <label className="sa-label">End Month
                  <select className={tc('endMonth', tForm.endMonth)} value={tForm.endMonth} onChange={e => { setTForm(f => ({ ...f, endMonth: e.target.value })); setTErrors(p => ({ ...p, endMonth: !e.target.value })); }}>
                    <option value="">Select…</option>
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                  {tErrors.endMonth && <span className="sa-field-err">Required</span>}
                </label>
                <label className="sa-label">Year
                  <input
                    className={tc('year', tForm.year)}
                    type="number" min="2000" max="2100" placeholder="2025"
                    value={tForm.year}
                    onChange={e => { setTForm(f => ({ ...f, year: e.target.value })); setTErrors(p => ({ ...p, year: !e.target.value })); }}
                  />
                  {tErrors.year && <span className="sa-field-err">Required</span>}
                </label>
              </div>
              <div className="sa-add-row">
                <Toggle active={tForm.isActive} onToggle={() => setTForm(f => ({ ...f, isActive: !f.isActive }))} />
                <button type="button" className="sa-add-item-btn" onClick={addStagedTest}><RiAddLine /> Add Test Window</button>
              </div>

              {/* 03 Education Programs */}
              <div className={`sa-section-head${fieldErrors.edus && edus.length === 0 ? ' sa-section-head--error' : ''}`}>
                <span className="sa-section-num">03</span> Education Programs <span className="sa-required">*</span>
                {fieldErrors.edus && edus.length === 0 && (
                  <span className="sa-section-err">At least one program required</span>
                )}
              </div>

              {edus.length > 0 && (
                <div className="sa-sub-list">
                  {edus.map((e, idx) => (
                    <div key={e.id} className="sa-sub-row">
                      <span className="sa-sub-num">{String(idx + 1).padStart(2, '0')}</span>
                      <RiGraduationCapLine className="sa-sub-icon sa-sub-icon--green" />
                      <span className="sa-sub-label">{e.name}</span>
                      <div className="sa-sub-actions">
                        <button className="sa-action-btn sa-action-btn--danger sa-action-btn--sm" onClick={() => isLive(e.id) ? deleteLiveEdu(e.id) : removeStagedEdu(e.id)}><RiDeleteBinLine /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="sa-inline-add-row">
                <div>
                  <input
                    className={`${ec('name', eForm.name)}${fieldErrors.edus && edus.length === 0 ? ' sa-input--error' : edus.length > 0 && !eErrors.name ? ' sa-input--success' : ''}`}
                    value={eForm.name}
                    onChange={e => { setEForm({ name: e.target.value }); setEErrors({ name: !e.target.value.trim() }); }}
                    placeholder="e.g. Bachelor of Computer Science…"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStagedEdu(); } }}
                  />
                  {eErrors.name && <span className="sa-field-err">Program name is required</span>}
                </div>
                <button type="button" className="sa-add-item-btn" onClick={addStagedEdu}><RiAddLine /> Add Program</button>
              </div>

              {/* 04 Scholarships — OPTIONAL */}
              <div className="sa-section-head">
                <span className="sa-section-num">04</span> Scholarships
                <span className="sa-optional-badge">Optional</span>
              </div>

              {scholars.length > 0 && (
                <div className="sa-sub-list">
                  {scholars.map(s => (
                    <div key={s.id} className="sa-sub-row sa-sub-row--scholar">
                      <RiMedalLine className="sa-sub-icon sa-sub-icon--amber" />
                      <div className="sa-sub-scholar-info">
                        <span className="sa-sub-label">{s.coursename}</span>
                        {s.amount && <span className="sa-amount-chip">₹{Number(s.amount).toLocaleString()}</span>}
                        {s.description && <p className="sa-sub-desc">{s.description}</p>}
                      </div>
                      <div className="sa-sub-actions">
                        <Toggle active={s.isActive} onToggle={() => isLive(s.id) ? toggleLiveScholar(s.id) : toggleStagedScholar(s.id)} />
                        <button className="sa-action-btn sa-action-btn--danger sa-action-btn--sm" onClick={() => isLive(s.id) ? deleteLiveScholar(s.id) : removeStagedScholar(s.id)}><RiDeleteBinLine /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="sa-form-row sa-form-row--2">
                <label className="sa-label">Scholarship Name
                  <input
                    className={sErrors.coursename === true ? 'sa-input sa-input--error' : 'sa-input'}
                    value={sForm.coursename}
                    onChange={e => { setSForm(f => ({ ...f, coursename: e.target.value })); setSErrors(p => ({ ...p, coursename: false })); }}
                    placeholder="Scholarship name…"
                  />
                  {sErrors.coursename && <span className="sa-field-err">Scholarship name is required</span>}
                </label>
                <label className="sa-label">Amount (₹)
                  <input className="sa-input" type="number" min="0" value={sForm.amount} onChange={e => setSForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
                </label>
              </div>
              <label className="sa-label">Description
                <textarea className="sa-input sa-textarea" rows={2} value={sForm.description} onChange={e => setSForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of eligibility and coverage…" />
              </label>
              <div className="sa-add-row">
                <Toggle active={sForm.isActive} onToggle={() => setSForm(f => ({ ...f, isActive: !f.isActive }))} />
                <button type="button" className="sa-add-item-btn" onClick={addStagedScholar}><RiAddLine /> Add Scholarship</button>
              </div>

            </div>

            <div className="sa-modal-footer">
              <button className="sa-ghost-btn" onClick={closeModal} disabled={cSaving}><RiCloseLine /> Cancel</button>
              <button className="sa-save-btn" onClick={handleSubmit} disabled={cSaving}>
                {cSaving ? <><div className="sa-btn-spinner" /> Saving…</> : <><RiCheckLine /> {editId ? 'Save Changes' : 'Save Country'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {preview && (
        <div className="sa-backdrop" onClick={() => setPreview(null)}>
          <article className="sa-preview-modal" onClick={e => e.stopPropagation()}>
            <button className="sa-modal-close sa-preview-close" onClick={() => setPreview(null)}><RiCloseLine /></button>
            {preview.image ? <img src={imgSrc(preview.image)} alt={preview.countryName} className="sa-preview-img" /> : <div className="sa-preview-placeholder"><RiGlobalLine /></div>}
            <div className="sa-preview-body">
              <p className="sa-eyebrow"><RiGlobalLine /> Studies Abroad</p>
              <h2 className="sa-preview-title">{preview.countryName}</h2>
              {preview.description && <p className="sa-preview-desc">{preview.description}</p>}
              {(preview.features || []).length > 0 && (
                <div className="sa-preview-section">
                  <div className="sa-preview-section-title">Key Features</div>
                  <div className="sa-feature-tags sa-feature-tags--preview">
                    {preview.features.map((f, i) => <span key={i} className="sa-feat-tag">{f}</span>)}
                  </div>
                </div>
              )}
              <div className="sa-preview-stats">
                <div className="sa-preview-stat"><RiCalendarLine /><span>{(preview.tests||[]).length}</span><p>Test Windows</p></div>
                <div className="sa-preview-stat"><RiGraduationCapLine /><span>{(preview.educations||[]).length}</span><p>Programs</p></div>
                <div className="sa-preview-stat"><RiMedalLine /><span>{(preview.scholarships||[]).length}</span><p>Scholarships</p></div>
              </div>
              <div className="sa-preview-section">
                <div className="sa-preview-section-title"><RiCalendarLine /> Test Windows</div>
                {(preview.tests || []).length === 0 ? <p className="sa-preview-empty">No test windows added.</p> : (
                  <div className="sa-preview-list">
                    {(preview.tests || []).map(t => (
                      <div key={t.id} className="sa-preview-row">
                        <div className="sa-preview-row-icon sa-preview-row-icon--blue"><RiCalendarLine /></div>
                        <div className="sa-preview-row-info"><strong>{t.startMonth} – {t.endMonth}</strong><span>{t.year}</span></div>
                        <span className={`sa-status-pill ${t.isActive ? 'sa-status-pill--active' : 'sa-status-pill--inactive'}`}>{t.isActive ? <RiToggleFill /> : <RiToggleLine />} {t.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="sa-preview-section">
                <div className="sa-preview-section-title"><RiGraduationCapLine /> Education Programs</div>
                {(preview.educations || []).length === 0 ? <p className="sa-preview-empty">No education programs added.</p> : (
                  <div className="sa-preview-list">
                    {(preview.educations || []).map((e, idx) => (
                      <div key={e.id} className="sa-preview-row">
                        <span className="sa-preview-num">{String(idx + 1).padStart(2, '0')}</span>
                        <div className="sa-preview-row-icon sa-preview-row-icon--green"><RiGraduationCapLine /></div>
                        <div className="sa-preview-row-info"><strong>{e.name}</strong></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="sa-preview-section">
                <div className="sa-preview-section-title"><RiMedalLine /> Scholarships</div>
                {(preview.scholarships || []).length === 0 ? <p className="sa-preview-empty">No scholarships added.</p> : (
                  <div className="sa-preview-list">
                    {(preview.scholarships || []).map(s => (
                      <div key={s.id} className="sa-preview-row sa-preview-row--scholar">
                        <div className="sa-preview-row-icon sa-preview-row-icon--amber"><RiMedalLine /></div>
                        <div className="sa-preview-row-info"><strong>{s.coursename}</strong>{s.description && <p className="sa-preview-row-desc">{s.description}</p>}</div>
                        <div className="sa-preview-row-right">
                          {s.amount && <span className="sa-amount-chip">₹{Number(s.amount).toLocaleString()}</span>}
                          <span className={`sa-status-pill ${s.isActive ? 'sa-status-pill--active' : 'sa-status-pill--inactive'}`}>{s.isActive ? <RiToggleFill /> : <RiToggleLine />} {s.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      )}
    </>
  );
}