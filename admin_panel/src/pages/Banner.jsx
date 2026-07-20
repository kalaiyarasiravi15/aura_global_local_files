import { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  RiAddLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeLine,
  RiImageAddLine,
  RiImageLine,
  RiSave3Line,
} from 'react-icons/ri';
import { API } from '../config';
import { toastConfirm } from '../components/toastConfirm';
import './Banner.css';

const REQUIRED_WIDTH  = 907;
const REQUIRED_HEIGHT = 514;
const MIN_DESC_WORDS  = 20;  // ✅ UPDATED: Minimum 20 words
const MAX_DESC_WORDS  = 300; // ✅ UPDATED: Maximum 300 words

const emptyForm = {
  title:       '',
  subtitle:    '',
  description: '',
  button:      '',
  buttonLink:  '',
  image:       null,
};

const emptyTouched = {
  title:       false,
  subtitle:    false,
  description: false,
  button:      false,
  buttonLink:  false,
  image:       false,
};

// ── Upload Icon ───────────────────────────────────────────────────────────
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

// ── Word counter ──────────────────────────────────────────────────────────
const countWords = (text) =>
  text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

// ── Per-field validation ──────────────────────────────────────────────────
const getFieldError = (name, value) => {
  switch (name) {
    case 'title':
      if (!value || !value.trim()) return 'Title is required.';
      if (value.trim().length < 3)  return 'Title must be at least 3 characters.';
      return '';
    case 'subtitle':
      if (!value || !value.trim()) return 'Subtitle is required.';
      return '';
    case 'description': {
      if (!value || !value.trim()) return 'Description is required.';
      const wc = countWords(value);
      if (wc < MIN_DESC_WORDS)  return `Description must be at least ${MIN_DESC_WORDS} words.`; // ✅ UPDATED
      if (wc > MAX_DESC_WORDS) return `Description cannot exceed ${MAX_DESC_WORDS} words.`;    // ✅ UPDATED
      return '';
    }
    case 'button':
      if (!value || !value.trim()) return 'Button Text is required.';
      return '';
    case 'buttonLink':
      if (!value || !value.trim()) return 'Button Link is required.';
      return '';
    default:
      return '';
  }
};

// ── Component ─────────────────────────────────────────────────────────────
const Banner = () => {
  const [banners,       setBanners]       = useState([]);
  const [form,          setForm]          = useState(emptyForm);
  const [editingId,     setEditingId]     = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [isFormOpen,    setIsFormOpen]    = useState(false);

  const [touched,         setTouched]         = useState(emptyTouched);
  const [fieldErrors,     setFieldErrors]     = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Image state
  const [imageValid,      setImageValid]      = useState(null); // null | true | false
  const [imageDimensions, setImageDimensions] = useState(null);
  const [imageFileName,   setImageFileName]   = useState('');
  const [imageError,      setImageError]      = useState('');
  const fileInputRef = useRef(null);
const apiRoot = useMemo(() => {
  return import.meta.env.VITE_IMG_URL || API.replace('/api', '/uploads');
}, []);
  const token   = localStorage.getItem('adminToken');
  const authHeaders = { Authorization: `Bearer ${token}` };

  // ── Load ──────────────────────────────────────────────────────────────
  const loadBanners = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/banners`);
      setBanners(data.banners || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load banners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const imageSrc = (image) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `${apiRoot}${image}`;
  };

  // ── Reset helpers ─────────────────────────────────────────────────────
  const resetImageState = () => {
    setImageValid(null);
    setImageDimensions(null);
    setImageFileName('');
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetValidation = () => {
    setTouched(emptyTouched);
    setFieldErrors({});
    setSubmitAttempted(false);
    resetImageState();
  };

  // ── Open / Close ──────────────────────────────────────────────────────
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

  const editBanner = (banner) => {
    setEditingId(banner.id);
    setForm({
      title:       banner.title       || '',
      subtitle:    banner.subtitle    || '',
      description: banner.description || '',
      button:      banner.button      || '',
      buttonLink:  banner.buttonLink  || '',
      image:       null,
    });
    setIsFormOpen(true);
    resetValidation();
  };

  // ── Field classes ─────────────────────────────────────────────────────
  const fieldClass = (name) => {
    if (!touched[name]) return '';
    return fieldErrors[name] ? 'field-error' : 'field-success';
  };

  const imageZoneClass = () => {
    if (!touched.image) return '';
    if (imageValid === false || imageError) return 'field-error';
    if (imageValid === true)               return 'field-success';
    return '';
  };

  // ── Field change ──────────────────────────────────────────────────────
  const updateField = (event) => {
    const { name, value, files } = event.target;

    if (name === 'image' && files && files[0]) {
      const file = files[0];
      setTouched((cur) => ({ ...cur, image: true }));
      setImageFileName(file.name);

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setImageDimensions({ width: w, height: h });
        URL.revokeObjectURL(url);

        if (w === REQUIRED_WIDTH && h === REQUIRED_HEIGHT) {
          setImageValid(true);
          setImageError('');
          setForm((cur) => ({ ...cur, image: file }));
        } else {
          setImageValid(false);
          setImageError(
            `Must be ${REQUIRED_WIDTH}×${REQUIRED_HEIGHT}px. Your image is ${w}×${h}px.`
          );
          setForm((cur) => ({ ...cur, image: null }));
        }
      };
      img.onerror = () => { URL.revokeObjectURL(url); };
      img.src = url;
      return;
    }

    // Description word cap — silently block beyond MAX
    if (name === 'description') {
      const words = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
      const currentWords = countWords(form.description);
      if (words > MAX_DESC_WORDS && words > currentWords) return;
    }

    setForm((cur) => ({ ...cur, [name]: value }));
    setTouched((cur) => ({ ...cur, [name]: true }));
    setFieldErrors((cur) => ({ ...cur, [name]: getFieldError(name, value) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((cur) => ({ ...cur, [name]: true }));
    setFieldErrors((cur) => ({ ...cur, [name]: getFieldError(name, value) }));
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const submitBanner = async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);

    // Mark all touched
    const allTouched = Object.keys(emptyTouched).reduce(
      (acc, k) => ({ ...acc, [k]: true }), {}
    );
    setTouched(allTouched);

    // Validate text fields
    const textFields = ['title', 'subtitle', 'description', 'button', 'buttonLink'];
    const errors = {};
    textFields.forEach((name) => {
      const err = getFieldError(name, form[name]);
      if (err) errors[name] = err;
    });
    setFieldErrors(errors);

    // Build missing list
    const missingList = [];

    if (!form.title?.trim() || form.title.trim().length < 3)
      missingList.push(' Title (min. 3 characters)');
    if (!form.subtitle?.trim())
      missingList.push(' Subtitle is required');
    if (!form.description?.trim() || countWords(form.description) < MIN_DESC_WORDS)
      missingList.push(` Description (min. ${MIN_DESC_WORDS} words)`); // ✅ UPDATED
    if (countWords(form.description) > MAX_DESC_WORDS)
      missingList.push(` Description (max ${MAX_DESC_WORDS} words)`);
    if (!form.button?.trim())
      missingList.push(' Button Text is required');
    if (!form.buttonLink?.trim())
      missingList.push(' Button Link is required');
    if (!editingId && !form.image)
      missingList.push(` Banner Image is required (${REQUIRED_WIDTH}×${REQUIRED_HEIGHT}px)`);
    if (imageValid === false)
      missingList.push(` Image must be exactly ${REQUIRED_WIDTH}×${REQUIRED_HEIGHT}px`);

    // Fire each as separate toast
    if (missingList.length > 0) {
      missingList.forEach((item, i) => {
        setTimeout(() => {
          toast.error(item, { autoClose: 5000 });
        }, i * 150);
      });
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('title',       form.title);
      payload.append('subtitle',    form.subtitle);
      payload.append('description', form.description);
      payload.append('button',      form.button);
      payload.append('buttonLink',  form.buttonLink);
      if (form.image) payload.append('image', form.image);

      if (editingId) {
        await axios.put(`${API}/banners/${editingId}`, payload, { headers: authHeaders });
        toast.success(' Banner updated successfully!');
      } else {
        await axios.post(`${API}/banners`, payload, { headers: authHeaders });
        toast.success(' Banner published successfully!');
      }

      closeFormView();
      loadBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save banner.');
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (id) => {
    toastConfirm('Delete this banner?', async () => {
      try {
        await axios.delete(`${API}/banners/${id}`, { headers: authHeaders });
        toast.success('Banner deleted.');
        loadBanners();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not delete banner.');
      }
    });
  };

  const descWordCount  = countWords(form.description);
  const descWordsLeft  = MAX_DESC_WORDS - descWordCount;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <section className="banner-main">
      {/* Header */}
      <header className="banner-header">
        <div>
          <p>Aura Global Education</p>
          <h1>Banner Management</h1>
        </div>
        {!isFormOpen && (
          <button type="button" className="add-banner-btn" onClick={openAddView}>
            <RiAddLine /> Add New Banner
          </button>
        )}
      </header>

      {/* ── Form View ── */}
      {isFormOpen ? (
        <section className="form-view-container">
          <form className="banner-form" onSubmit={submitBanner} noValidate>
            <div className="form-title">
              <RiImageAddLine />
              <div>
                <p>{editingId ? 'Update Banner' : 'Create New Banner'}</p>
                <span>
                  {editingId
                    ? `Entry ID: #${editingId} — All fields are required.`
                    : ' All fields must be filled before submitting.'}
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
                    placeholder="Primary display header text"
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
                    placeholder="Catchy context descriptor label"
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
                      placeholder={`Write banner description... (min ${MIN_DESC_WORDS}, max ${MAX_DESC_WORDS} words)`} // ✅ UPDATED
                      className={fieldClass('description')}
                    />
                    <span
                      className={`desc-char-counter${descWordsLeft <= 20 ? ' desc-char-counter--warn' : ''}${descWordsLeft === 0 ? ' desc-char-counter--limit' : ''}`}
                    >
                      {descWordsLeft} / {MAX_DESC_WORDS} words remaining
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
                {/* Button fields */}
                <div className="form-row">
                  <label>
                    Button Text <span className="req-star">*</span>
                    <input
                      name="button"
                      value={form.button}
                      onChange={updateField}
                      onBlur={handleBlur}
                      placeholder="e.g. Learn More"
                      className={fieldClass('button')}
                    />
                    {touched.button && fieldErrors.button && (
                      <span className="field-error-msg">{fieldErrors.button}</span>
                    )}
                    {touched.button && !fieldErrors.button && form.button?.trim() && (
                      <span className="field-success-msg">✓</span>
                    )}
                  </label>

                  <label>
                    Button Link <span className="req-star">*</span>
                    <input
                      name="buttonLink"
                      value={form.buttonLink}
                      onChange={updateField}
                      onBlur={handleBlur}
                      placeholder="e.g. /about"
                      className={fieldClass('buttonLink')}
                    />
                    {touched.buttonLink && fieldErrors.buttonLink && (
                      <span className="field-error-msg">{fieldErrors.buttonLink}</span>
                    )}
                    {touched.buttonLink && !fieldErrors.buttonLink && form.buttonLink?.trim() && (
                      <span className="field-success-msg">✓</span>
                    )}
                  </label>
                </div>

                {/* ── Image Upload ── */}
                <div className="upload-field-wrapper">
                  <span className="upload-field-label">
                    Banner Image {!editingId && <span className="req-star">*</span>}
                  </span>
                  <span className="upload-size-hint">({REQUIRED_WIDTH}×{REQUIRED_HEIGHT}px)</span>
                  <label className={`file-drop-zone ${imageZoneClass()}`}>
                    <input
                      ref={fileInputRef}
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={updateField}
                      className="hidden-file-input"
                    />
                    <div className="upload-icon">
                      <UploadIcon />
                    </div>

                    {form.image && imageValid === true ? (
                      <>
                        <span className="upload-main-text upload-success-text">
                          ✓ {imageFileName}
                        </span>
                        {imageDimensions && (
                          <span className="upload-formats" style={{ color: '#10b981' }}>
                            {imageDimensions.width}×{imageDimensions.height}px — Correct size
                          </span>
                        )}
                      </>
                    ) : imageValid === false ? (
                      <>
                        <span className="upload-main-text" style={{ color: '#ef4444' }}>
                          ✕ {imageFileName}
                        </span>
                        {imageDimensions && (
                          <span className="upload-formats" style={{ color: '#ef4444' }}>
                            {imageDimensions.width}×{imageDimensions.height}px — Wrong size
                          </span>
                        )}
                        <span className="field-error-msg" style={{ marginTop: 2 }}>
                          {imageError}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="upload-main-text">Click to select image</span>
                        <span className="upload-formats">PNG, JPG, JPEG, WEBP, GIF</span>
                        <span className="upload-size-label">
                          Required size: {REQUIRED_WIDTH}×{REQUIRED_HEIGHT}px
                        </span>
                      </>
                    )}

                    {!form.image && touched.image && (
                      <span className="field-error-msg" style={{ marginTop: 2 }}>
                        Please select a banner image.
                      </span>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={saving}
              >
                {editingId ? <RiSave3Line /> : <RiAddLine />}
                {saving ? 'Processing...' : editingId ? 'Update Banner' : 'Publish Banner'}
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
            <table className="ui-banner-table">
              <thead>
                <tr>
                  <th>Banner Details</th>
                  <th>Subtitle</th>
                  <th>Action Links</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="table-empty-state">Loading...</td></tr>
                ) : banners.length === 0 ? (
                  <tr><td colSpan="4" className="table-empty-state">No banners configured yet. Click "Add New Banner" to begin.</td></tr>
                ) : (
                  banners.map((banner) => (
                    <tr key={banner.id}>
                      <td className="td-service-info">
                        <div className="service-icon-wrapper banner-thumb">
                          {banner.image
                            ? <img src={imageSrc(banner.image)} alt="" />
                            : <RiImageLine className="fallback-table-icon" />}
                        </div>
                        <span className="service-title-text">{banner.title}</span>
                      </td>
                      <td className="td-subtitle">
                        {banner.subtitle || <span className="text-muted">—</span>}
                      </td>
                      <td className="td-features">
                        <span className="feature-truncate">
                          {banner.button
                            ? `${banner.button} → ${banner.buttonLink || '#'}`
                            : <span className="text-muted">No Action Set</span>}
                        </span>
                      </td>
                      <td className="td-actions">
                        <button type="button" className="table-action-icon view"   title="Preview" onClick={() => setPreviewBanner(banner)}><RiEyeLine /></button>
                        <button type="button" className="table-action-icon edit"   title="Edit"    onClick={() => editBanner(banner)}><RiEditLine /></button>
                        <button type="button" className="table-action-icon delete" title="Delete"  onClick={() => deleteBanner(banner.id)}><RiDeleteBinLine /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Preview Modal ── */}
      {previewBanner && (
        <div className="preview-backdrop" role="presentation" onClick={() => setPreviewBanner(null)}>
          <article className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setPreviewBanner(null)}>
              <RiCloseLine />
            </button>
            {previewBanner.image && (
              <img src={imageSrc(previewBanner.image)} alt="Banner Preview" className="modal-banner-img" />
            )}
            <h2>{previewBanner.title}</h2>
            <p className="modal-sub">{previewBanner.subtitle || 'No subheading'}</p>
            <div className="modal-scroll-desc">
              <strong>Description:</strong>
              <p>{previewBanner.description || 'No description added.'}</p>
            </div>
          </article>
        </div>
      )}
    </section>
  );
};

export default Banner;