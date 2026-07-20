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
} from 'react-icons/ri';
import { API } from '../config';
import { toastConfirm } from '../components/toastConfirm';
import './Services.css';

const MAX_FEATURES   = 10;
const MAX_DESC_CHARS = 500;

const THUMB_WIDTH    = 512;
const THUMB_HEIGHT   = 384;
const BANNER_WIDTH   = 1486;
const BANNER_HEIGHT  = 420;

const emptyForm = {
  title: '',
  subtitle: '',
  description: '',
  features: [],
  featureInput: '',
  button: '',
  image: null,
  bannerImage: null,
};

const emptyTouched = {
  title: false,
  subtitle: false,
  description: false,
  button: false,
  image: false,
  bannerImage: false,
};

// ── Upload Icon SVG ────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// ── Image dimension validator ──────────────────────────────────────────────
const validateImageDimensions = (file, expectedWidth, expectedHeight) =>
  new Promise((resolve) => {
    if (!file) { resolve({ valid: true }); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(
        img.width === expectedWidth && img.height === expectedHeight
          ? { valid: true }
          : { valid: false, actual: `${img.width}×${img.height}`, expected: `${expectedWidth}×${expectedHeight}` }
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ valid: true }); };
    img.src = url;
  });

// ── Per-field text validation ──────────────────────────────────────────────
const getFieldError = (name, value) => {
  switch (name) {
    case 'title':
      if (!value || !value.trim()) return 'Title is required.';
      if (value.trim().length < 3) return 'Title must be at least 3 characters.';
      return '';
    case 'subtitle':
      if (!value || !value.trim()) return 'Subtitle is required.';
      return '';
    case 'description':
      if (!value || !value.trim()) return 'Description is required.';
      if (value.trim().length < 10) return 'Description must be at least 10 characters.';
      if (value.trim().length > MAX_DESC_CHARS)
        return `Description cannot exceed ${MAX_DESC_CHARS} characters.`;
      return '';
    case 'button':
      if (!value || !value.trim()) return 'Button Label is required.';
      return '';
    default:
      return '';
  }
};

// ── Component ──────────────────────────────────────────────────────────────
const Services = () => {
  const [services,       setServices]       = useState([]);
  const [form,           setForm]           = useState(emptyForm);
  const [editingId,      setEditingId]      = useState(null);
  const [previewService, setPreviewService] = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [saving,         setSaving]         = useState(false);

  const [isFormOpen,  setIsFormOpen]  = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [touched,         setTouched]         = useState(emptyTouched);
  const [fieldErrors,     setFieldErrors]     = useState({});
  const [imageErrors,     setImageErrors]     = useState({ image: '', bannerImage: '' });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const apiRoot = useMemo(() => {
  return import.meta.env.VITE_IMG_URL || API.replace('/api', '/uploads');
}, []);
  const token = localStorage.getItem('adminToken');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadServices = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/services`);
      setServices(data.services || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadServices(); }, []);

  const imageSrc = (image) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `${apiRoot}${image}`;
  };

  const featureText = (features) => {
    if (Array.isArray(features)) return features.join(', ');
    return features || '';
  };

  // ── Compute whether the form is fully valid ───────────────────────────────
  const isFormValid = () => {
    if (!form.title?.trim() || form.title.trim().length < 3)              return false;
    if (!form.subtitle?.trim())                                             return false;
    if (!form.description?.trim() || form.description.trim().length < 10) return false;
    if (form.description.trim().length > MAX_DESC_CHARS)                   return false;
    if (!form.button?.trim())                                               return false;
    if (form.features.length === 0)                                         return false;
    if (imageErrors.image || imageErrors.bannerImage)                       return false;
    if (!editingId) {
      if (!form.image || !form.bannerImage) return false;
    }
    return true;
  };

  // ── Field change ──────────────────────────────────────────────────────────
  const updateField = async (event) => {
    const { name, value, files } = event.target;
    const newValue = files ? files[0] : value;

    if (name === 'description' && !files && value.length > MAX_DESC_CHARS) {
      return;
    }

    setForm((cur) => ({ ...cur, [name]: newValue }));
    setTouched((cur) => ({ ...cur, [name]: true }));

    if (files && files[0]) {
      if (name === 'image') {
        const r = await validateImageDimensions(files[0], THUMB_WIDTH, THUMB_HEIGHT);
        setImageErrors((cur) => ({
          ...cur,
          image: r.valid
            ? ''
            : `Thumbnail must be ${THUMB_WIDTH}×${THUMB_HEIGHT}px. Your image is ${r.actual}.`,
        }));
      }
      if (name === 'bannerImage') {
        const r = await validateImageDimensions(files[0], BANNER_WIDTH, BANNER_HEIGHT);
        setImageErrors((cur) => ({
          ...cur,
          bannerImage: r.valid
            ? ''
            : `Banner must be ${BANNER_WIDTH}×${BANNER_HEIGHT}px. Your image is ${r.actual}.`,
        }));
      }
    } else {
      const error = getFieldError(name, newValue);
      setFieldErrors((cur) => ({ ...cur, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((cur) => ({ ...cur, [name]: true }));
    setFieldErrors((cur) => ({ ...cur, [name]: getFieldError(name, value) }));
  };

  const fieldClass = (name) => {
    if (!touched[name]) return '';
    return fieldErrors[name] ? 'field-error' : 'field-success';
  };

  const imageFieldClass = (name) => {
    if (!touched[name]) return '';
    if (imageErrors[name]) return 'field-error';
    if (form[name]) return 'field-success';
    return '';
  };

  // ── Features ──────────────────────────────────────────────────────────────
  const addFeature = () => {
    const trimmed = form.featureInput.trim();
    if (!trimmed) return;
    if (form.features.length >= MAX_FEATURES) {
      toast.warning(`Maximum ${MAX_FEATURES} features allowed.`);
      return;
    }
    if (form.features.includes(trimmed)) {
      toast.info('This feature already exists.');
      return;
    }
    setForm((cur) => ({ ...cur, features: [...cur.features, trimmed], featureInput: '' }));
  };

  const removeFeature = (index) =>
    setForm((cur) => ({ ...cur, features: cur.features.filter((_, i) => i !== index) }));

  const handleFeatureKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addFeature(); }
  };

  // ── Open / Close ──────────────────────────────────────────────────────────
  const resetValidation = () => {
    setTouched(emptyTouched);
    setFieldErrors({});
    setImageErrors({ image: '', bannerImage: '' });
    setSubmitAttempted(false);
  };

  const closeFormView = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(false);
    resetValidation();
  };

  const openAddView = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
    resetValidation();
  };

  const openEditView = (service) => {
    setEditingId(service.id);
    setForm({
      title:        service.title       || '',
      subtitle:     service.subtitle    || '',
      description:  service.description || '',
      features: Array.isArray(service.features)
        ? service.features
        : String(service.features || '').split(',').map((f) => f.trim()).filter(Boolean),
      featureInput: '',
      button:       service.button     || '',
      image:        null,
      bannerImage:  null,
    });
    setIsFormOpen(true);
    resetValidation();
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const submitService = async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);

    const allTouched = Object.keys(emptyTouched).reduce(
      (acc, k) => ({ ...acc, [k]: true }), {}
    );
    setTouched(allTouched);

    const textFields = ['title', 'subtitle', 'description', 'button'];
    const errors = {};
    textFields.forEach((name) => {
      const err = getFieldError(name, form[name]);
      if (err) errors[name] = err;
    });
    setFieldErrors(errors);

    // Build missing-fields list for individual toasts
    const missingList = [];

    if (!form.title?.trim() || form.title.trim().length < 3)
      missingList.push('📌 Title (min. 3 characters)');
    if (!form.subtitle?.trim())
      missingList.push('📌 Subtitle is required');
    if (!form.description?.trim() || form.description.trim().length < 10)
      missingList.push('📌 Description (min. 10 characters)');
    if (form.description?.trim().length > MAX_DESC_CHARS)
      missingList.push(`📌 Description (max ${MAX_DESC_CHARS} characters)`);
    if (!form.button?.trim())
      missingList.push('📌 Button Label is required');
    if (form.features.length === 0)
      missingList.push('📌 Features (at least 1 required)');

    if (!editingId) {
      if (!form.image)       missingList.push('🖼️ Thumbnail Image is required');
      if (!form.bannerImage) missingList.push('🖼️ Banner Image is required');
    }

    if (form.image && imageErrors.image)
      missingList.push(`🖼️ Thumbnail — ${imageErrors.image}`);
    if (form.bannerImage && imageErrors.bannerImage)
      missingList.push(`🖼️ Banner — ${imageErrors.bannerImage}`);

    // ── Fire each error as its own separate toast ──
    if (missingList.length > 0) {
      missingList.forEach((item, i) => {
        setTimeout(() => {
          toast.error(item, { autoClose: 5000 });
        }, i * 150);
      });
      return;
    }

    // Re-validate image dimensions one final time
    if (form.image) {
      const r = await validateImageDimensions(form.image, THUMB_WIDTH, THUMB_HEIGHT);
      if (!r.valid) {
        toast.error(`Thumbnail must be ${THUMB_WIDTH}×${THUMB_HEIGHT}px. You uploaded: ${r.actual}.`);
        setImageErrors((cur) => ({ ...cur, image: `Must be ${THUMB_WIDTH}×${THUMB_HEIGHT}px.` }));
        return;
      }
    }
    if (form.bannerImage) {
      const r = await validateImageDimensions(form.bannerImage, BANNER_WIDTH, BANNER_HEIGHT);
      if (!r.valid) {
        toast.error(`Banner must be ${BANNER_WIDTH}×${BANNER_HEIGHT}px. You uploaded: ${r.actual}.`);
        setImageErrors((cur) => ({ ...cur, bannerImage: `Must be ${BANNER_WIDTH}×${BANNER_HEIGHT}px.` }));
        return;
      }
    }

    // All good — submit
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('title',       form.title);
      payload.append('subtitle',    form.subtitle);
      payload.append('description', form.description);
      payload.append('features',    JSON.stringify(form.features));
      payload.append('button',      form.button);
      if (form.image)       payload.append('image',       form.image);
      if (form.bannerImage) payload.append('bannerImage', form.bannerImage);

      if (editingId) {
        await axios.put(`${API}/services/${editingId}`, payload, { headers: authHeaders });
        toast.success('✅ Service updated successfully!');
      } else {
        await axios.post(`${API}/services`, payload, { headers: authHeaders });
        toast.success('✅ Service added successfully!');
      }

      closeFormView();
      loadServices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save service.');
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id) => {
    toastConfirm('Delete this service?', async () => {
      try {
        await axios.delete(`${API}/services/${id}`, { headers: authHeaders });
        toast.success('Service deleted.');
        loadServices();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not delete.');
      }
    });
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const indexOfLastItem  = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices  = services.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages       = Math.ceil(services.length / itemsPerPage);

  const descCharsLeft = MAX_DESC_CHARS - (form.description?.length || 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <section className="services-main">
        <header className="services-header">
          <div>
            <p>Aura Global Education</p>
            <h1>Services Management</h1>
          </div>
          {!isFormOpen && (
            <button type="button" className="add-service-btn" onClick={openAddView}>
              <RiAddLine /> Add New Service
            </button>
          )}
        </header>

        {/* ── Form View ── */}
        {isFormOpen ? (
          <section className="form-view-container">
            <form className="services-form" onSubmit={submitService} noValidate>
              <div className="form-title">
                <RiStackLine />
                <div>
                  <p>{editingId ? 'Update Service' : 'Create New Service'}</p>
                  <span>
                    {editingId
                      ? `Entry ID: #${editingId} — All fields are required.`
                      : '⚠️ All fields must be filled before submitting.'}
                  </span>
                </div>
              </div>

              <div className="form-grid">
                {/* Left Column */}
                <div className="form-column">
                  <label>
                    Title <span className="req-star">*</span>
                    <input
                      name="title"
                      value={form.title}
                      onChange={updateField}
                      onBlur={handleBlur}
                      placeholder="Service Main Title"
                      className={fieldClass('title')}
                    />
                    {touched.title && fieldErrors.title && (
                      <span className="field-error-msg">{fieldErrors.title}</span>
                    )}
                    {touched.title && !fieldErrors.title && form.title?.trim() && (
                      <span className="field-success-msg">✓ Looks good</span>
                    )}
                  </label>

                  <label>
                    Subtitle <span className="req-star">*</span>
                    <input
                      name="subtitle"
                      value={form.subtitle}
                      onChange={updateField}
                      onBlur={handleBlur}
                      placeholder="Catchy subtitle header"
                      className={fieldClass('subtitle')}
                    />
                    {touched.subtitle && fieldErrors.subtitle && (
                      <span className="field-error-msg">{fieldErrors.subtitle}</span>
                    )}
                    {touched.subtitle && !fieldErrors.subtitle && form.subtitle?.trim() && (
                      <span className="field-success-msg">✓ Looks good</span>
                    )}
                  </label>

                  <label>
                    Description <span className="req-star">*</span>
                    <div className="desc-counter-wrap">
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={updateField}
                        onBlur={handleBlur}
                        rows="5"
                        placeholder={`Detailed service description... (max ${MAX_DESC_CHARS} characters)`}
                        className={fieldClass('description')}
                        maxLength={MAX_DESC_CHARS}
                      />
                      <span
                        className={`desc-char-counter${descCharsLeft <= 50 ? ' desc-char-counter--warn' : ''}${descCharsLeft === 0 ? ' desc-char-counter--limit' : ''}`}
                      >
                        {descCharsLeft} / {MAX_DESC_CHARS} characters remaining
                      </span>
                    </div>
                    {touched.description && fieldErrors.description && (
                      <span className="field-error-msg">{fieldErrors.description}</span>
                    )}
                    {touched.description && !fieldErrors.description && form.description?.trim() && (
                      <span className="field-success-msg">✓ Looks good</span>
                    )}
                  </label>
                </div>

                {/* Right Column */}
                <div className="form-column">
                  {/* Features */}
                  <div className="feature-field">
                    <div className="feature-field-header">
                      <span className="feature-label">
                        Features <span className="req-star">*</span>
                        <span className="feature-count">{form.features.length}/{MAX_FEATURES}</span>
                      </span>
                    </div>

                    {form.features.length > 0 && (
                      <div className="feature-tags">
                        {form.features.map((feat, idx) => (
                          <span key={idx} className="feature-tag">
                            {feat}
                            <button
                              type="button"
                              className="feature-tag-remove"
                              onClick={() => removeFeature(idx)}
                              aria-label={`Remove ${feat}`}
                            >
                              <RiCloseLine />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {form.features.length < MAX_FEATURES && (
                      <div className="feature-input-row">
                        <input
                          name="featureInput"
                          value={form.featureInput}
                          onChange={updateField}
                          onKeyDown={handleFeatureKeyDown}
                          placeholder="Type a feature and press Enter or click +"
                          className="feature-input"
                        />
                        <button
                          type="button"
                          className="feature-add-btn"
                          onClick={addFeature}
                          disabled={!form.featureInput.trim()}
                          title="Add feature"
                        >
                          <RiAddLine />
                        </button>
                      </div>
                    )}

                    {form.features.length === 0 && (
                      <span className="feature-required-note">⚠️ At least 1 feature is required</span>
                    )}
                    {form.features.length >= MAX_FEATURES && (
                      <p className="feature-limit-note">Maximum {MAX_FEATURES} features reached.</p>
                    )}
                  </div>

                  {/* Button fields */}
                  <div className="form-row">
                    <label>
                      Button Label <span className="req-star">*</span>
                      <input
                        name="button"
                        value={form.button}
                        onChange={updateField}
                        onBlur={handleBlur}
                        placeholder="e.g. Apply Now"
                        className={fieldClass('button')}
                      />
                      {touched.button && fieldErrors.button && (
                        <span className="field-error-msg">{fieldErrors.button}</span>
                      )}
                      {touched.button && !fieldErrors.button && form.button?.trim() && (
                        <span className="field-success-msg">✓</span>
                      )}
                    </label>

                  </div>

                  {/* Images */}
                  <div className="form-row">
                    {/* ── Thumbnail Upload ── */}
                    <div className="upload-field-wrapper">
                      <span className="upload-field-label">
                        Thumbnail Image <span className="req-star">*</span>
                      </span>
                      <span className="upload-size-hint">({THUMB_WIDTH}×{THUMB_HEIGHT}px)</span>
                      <label className={`file-drop-zone ${imageFieldClass('image')}`}>
                        <input
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={updateField}
                          className="hidden-file-input"
                        />
                        <div className="upload-icon">
                          <UploadIcon />
                        </div>
                        {form.image && !imageErrors.image ? (
                          <span className="upload-main-text upload-success-text">
                            ✓ {form.image.name}
                          </span>
                        ) : (
                          <>
                            <span className="upload-main-text">Click to select image</span>
                            <span className="upload-formats">PNG, JPG, JPEG, WEBP, GIF</span>
                            <span className="upload-size-label">
                              Required size: {THUMB_WIDTH}×{THUMB_HEIGHT}px
                            </span>
                          </>
                        )}
                        {imageErrors.image && (
                          <span className="field-error-msg">{imageErrors.image}</span>
                        )}
                        {!form.image && touched.image && !imageErrors.image && (
                          <span className="field-error-msg">Please select an image.</span>
                        )}
                      </label>
                    </div>

                    {/* ── Banner Upload ── */}
                    <div className="upload-field-wrapper">
                      <span className="upload-field-label">
                        Banner Image <span className="req-star">*</span>
                      </span>
                      <span className="upload-size-hint">({BANNER_WIDTH}×{BANNER_HEIGHT}px)</span>
                      <label className={`file-drop-zone ${imageFieldClass('bannerImage')}`}>
                        <input
                          name="bannerImage"
                          type="file"
                          accept="image/*"
                          onChange={updateField}
                          className="hidden-file-input"
                        />
                        <div className="upload-icon">
                          <UploadIcon />
                        </div>
                        {form.bannerImage && !imageErrors.bannerImage ? (
                          <span className="upload-main-text upload-success-text">
                            ✓ {form.bannerImage.name}
                          </span>
                        ) : (
                          <>
                            <span className="upload-main-text">Click to select image</span>
                            <span className="upload-formats">PNG, JPG, JPEG, WEBP, GIF</span>
                            <span className="upload-size-label">
                              Required size: {BANNER_WIDTH}×{BANNER_HEIGHT}px
                            </span>
                          </>
                        )}
                        {imageErrors.bannerImage && (
                          <span className="field-error-msg">{imageErrors.bannerImage}</span>
                        )}
                        {!form.bannerImage && touched.bannerImage && !imageErrors.bannerImage && (
                          <span className="field-error-msg">Please select a banner image.</span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving || (submitAttempted && !isFormValid())}
                  title={
                    submitAttempted && !isFormValid()
                      ? 'Please fill all required fields before submitting.'
                      : ''
                  }
                >
                  {editingId ? <RiSave3Line /> : <RiAddLine />}
                  {saving ? 'Processing...' : editingId ? 'Update Service' : 'Publish Service'}
                </button>
                <button type="button" className="ghost-btn" onClick={closeFormView}>
                  <RiCloseLine /> Cancel
                </button>
              </div>
            </form>
          </section>
        ) : (
          /* ── Table View ── */
          <section className="table-view-container">
            <div className="table-responsive">
              <table className="ui-services-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Subtitle / Category</th>
                    <th>Features Summary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4" className="table-empty-state">Loading...</td></tr>
                  ) : currentServices.length === 0 ? (
                    <tr><td colSpan="4" className="table-empty-state">No services added yet.</td></tr>
                  ) : (
                    currentServices.map((service) => (
                      <tr key={service.id}>
                        <td className="td-service-info">
                          <div className="service-icon-wrapper">
                            {service.image
                              ? <img src={imageSrc(service.image)} alt="" />
                              : <RiStackLine className="fallback-table-icon" />}
                          </div>
                          <span className="service-title-text">{service.title}</span>
                        </td>
                        <td className="td-subtitle">
                          {service.subtitle || <span className="text-muted">—</span>}
                        </td>
                        <td className="td-features">
                          <span className="feature-truncate" title={featureText(service.features)}>
                            {featureText(service.features) || <span className="text-muted">—</span>}
                          </span>
                        </td>
                        <td className="td-actions">
                          <button type="button" className="table-action-icon view"   title="Preview" onClick={() => setPreviewService(service)}><RiEyeLine /></button>
                          <button type="button" className="table-action-icon edit"   title="Edit"    onClick={() => openEditView(service)}><RiEditLine /></button>
                          <button type="button" className="table-action-icon delete" title="Delete"  onClick={() => deleteService(service.id)}><RiDeleteBinLine /></button>
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
                  {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, services.length)} / {services.length} services
                </span>
                <div className="pagination-controls-wrapper">
                  <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} className="page-control-arrow"><RiArrowLeftSLine /></button>
                  <div className="page-numbers-group">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i + 1} type="button" className={`page-num-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                    ))}
                  </div>
                  <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} className="page-control-arrow"><RiArrowRightSLine /></button>
                </div>
              </footer>
            )}
          </section>
        )}

        {/* ── Preview Modal ── */}
        {previewService && (
          <div className="preview-backdrop" role="presentation" onClick={() => setPreviewService(null)}>
            <article className="preview-modal" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="modal-close" onClick={() => setPreviewService(null)}><RiCloseLine /></button>
              {previewService.bannerImage && (
                <img src={imageSrc(previewService.bannerImage)} alt="Banner" className="modal-banner-img" />
              )}
              <h2>{previewService.title}</h2>
              <p className="modal-sub">{previewService.subtitle}</p>
              <div className="modal-scroll-desc">
                <strong>Description:</strong>
                <p>{previewService.description || 'No description'}</p>
                {previewService.features?.length > 0 && (
                  <>
                    <strong style={{ display: 'block', marginTop: 12 }}>Features:</strong>
                    <div className="modal-feature-tags">
                      {(Array.isArray(previewService.features)
                        ? previewService.features
                        : String(previewService.features).split(',').map((f) => f.trim()).filter(Boolean)
                      ).map((feat, i) => (
                        <span key={i} className="modal-feature-tag">{feat}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </article>
          </div>
        )}
      </section>
    </>
  );
};

export default Services;