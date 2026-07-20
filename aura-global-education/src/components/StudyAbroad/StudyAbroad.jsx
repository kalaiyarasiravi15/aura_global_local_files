import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './StudyAbroad.css';

import IntakeSelection from '../IntakeSelection/IntakeSelection';
import EducationQualification from '../EducationQualification/EducationQualification';

import { IoClose } from 'react-icons/io5';
import { MdCheckCircle } from 'react-icons/md';
import { IoAirplaneSharp } from 'react-icons/io5';
import { MdLock } from 'react-icons/md';
import { MdSupportAgent } from 'react-icons/md';
import { MdSchool } from 'react-icons/md';
import { MdPerson } from 'react-icons/md';
import { MdPhone } from 'react-icons/md';
import { MdEmail } from 'react-icons/md';
import { MdArrowForward } from 'react-icons/md';
import { IoHome } from 'react-icons/io5';
import { RiGlobalLine, RiGraduationCapLine, RiTimeLine } from 'react-icons/ri';
import { MdFlightTakeoff, MdVerified, MdAutoAwesome, MdPublic, MdEditNote } from 'react-icons/md';

import { API } from '../../config';
import img1 from '../../assets/othercountries.jpg';

/* ── Preferred country display order ─────────────────────────────────
   Countries in this list appear first (in this exact sequence).
   Any new country added from the backend will automatically appear
   after these, sorted alphabetically.                                  */
const COUNTRY_ORDER = [
  'United Kingdom',
  'Germany',
  'France',
  'Australia',
  'New Zealand',
  'Ireland',
  'Canada',
  'United States',
  'USA',        // alternate name guard
  'Singapore',
];

function sortCountries(countries) {
  return [...countries].sort((a, b) => {
    const ai = COUNTRY_ORDER.findIndex(name =>
      a.countryName.toLowerCase().includes(name.toLowerCase())
    );
    const bi = COUNTRY_ORDER.findIndex(name =>
      b.countryName.toLowerCase().includes(name.toLowerCase())
    );
    if (ai !== -1 && bi !== -1) return ai - bi;  // both in list → by position
    if (ai !== -1) return -1;                     // only a in list → a first
    if (bi !== -1) return 1;                      // only b in list → b first
    return a.countryName.localeCompare(b.countryName); // neither → alphabetical
  });
}

/* ── Test mode options ── */
const TEST_MODES = [
  { label: 'Jan – Feb', value: 'Jan-Feb' },
  { label: 'May – Jun', value: 'May-Jun' },
  { label: 'Nov – Dec', value: 'Nov-Dec' },
];

/* ── "Other Countries" quick-apply card ─────────────────────── */
function OtherCountriesCard({ onApply }) {
  return (
    <div className="other-country-card" onClick={onApply}>
      <div className="other-card-bg">
        <img src={img1} alt="Other Countries" className="other-card-img" />
        <div className="other-card-overlay" />
        <div className="other-card-badge">Open</div>
        <div className="other-card-corner-accent" />
        <div className="other-card-content">
          <span className="other-card-code">OT</span>
          <h3 className="other-card-name">Other Countries</h3>
          <p className="other-card-hint">
            <span className="hint-dot" /><span className="hint-dot" /><span className="hint-dot" />
            Click to apply
          </p>
        </div>
        <div className="other-card-hover-layer">
          <div className="other-card-hover-inner">
            <MdFlightTakeoff className="other-hover-plane" />
            <span className="other-hover-name">Other Countries</span>
            <div className="other-features-list">
              <div className="other-feature-item"><MdVerified className="back-feature-icon" /><span>Custom Destination</span></div>
              <div className="other-feature-item"><MdVerified className="back-feature-icon" /><span>Flexible Intakes</span></div>
              <div className="other-feature-item"><MdVerified className="back-feature-icon" /><span>Expert Guidance</span></div>
            </div>
            <button className="other-apply-btn">
              Apply Now <MdArrowForward className="enroll-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */

const StudyAbroad = ({
  currentStep,
  onSelectCountry,
  onSelectIntake,
  onSelectEducation,
  selectedCountryProp,
  selectedTestProp,
}) => {
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(selectedCountryProp || null);
  const [selectedTest, setSelectedTest]       = useState(selectedTestProp || null);
  const [selectedEducation, setSelectedEducation] = useState(null);

  const [showModal, setShowModal]     = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData]       = useState({ name: '', phone: '', email: '', testMode: '', education: '' });
  const [submitting, setSubmitting]   = useState(false);

  /* "Other / quick-apply" flow — bypasses country steps */
  const [isOtherFlow, setIsOtherFlow] = useState(false);

  const cardRefs = useRef([]);

  /* sync props → local state */
  useEffect(() => { if (selectedCountryProp) setSelectedCountry(selectedCountryProp); }, [selectedCountryProp]);
  useEffect(() => { if (selectedTestProp)    setSelectedTest(selectedTestProp);       }, [selectedTestProp]);

  /* fetch countries when on step 1 */
  useEffect(() => {
    if (currentStep === 'country') fetchCountries();
  }, [currentStep]);

  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const { data } = await axios.get(`${API}/studies-abroad`);
      // Apply preferred order; new countries added from backend appear at the end
      const sorted = sortCountries(data.countries || []);
      setCountries(sorted);
    } catch (err) {
      console.error('Error fetching countries:', err);
      toast.error('Could not load countries. Please try again.');
    } finally {
      setLoadingCountries(false);
    }
  };

  /* card reveal */
  useEffect(() => {
    if (currentStep !== 'country' || countries.length === 0) return;

    const revealTimer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } }),
        { threshold: 0.05 }
      );
      cardRefs.current.forEach((el) => el && observer.observe(el));

      const fallbackTimer = setTimeout(() => {
        cardRefs.current.forEach((el) => {
          if (el && !el.classList.contains('is-visible')) {
            el.classList.add('is-visible');
          }
        });
      }, 500);

      return () => {
        observer.disconnect();
        clearTimeout(fallbackTimer);
      };
    }, 50);

    return () => clearTimeout(revealTimer);
  }, [currentStep, countries]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_IMG_URL}${imagePath}`;
  };

  /* handlers */
  const handleCountrySelect  = (country)   => { setSelectedCountry(country);      if (onSelectCountry)  onSelectCountry(country);   };
  const handleIntakeSelect   = (test)      => { setSelectedTest(test);             if (onSelectIntake)   onSelectIntake(test);        };
  const handleEducationSelect = (education) => {
    setSelectedEducation(education);
    if (onSelectEducation) onSelectEducation(education);
    setIsOtherFlow(false);
    setShowModal(true);
  };

  /* open Other-country / Quick-enquire popup */
  const openOtherFlow = () => {
    setIsOtherFlow(true);
    setFormData({ name: '', phone: '', email: '', testMode: '', education: '' });
    setIsSubmitted(false);
    setShowModal(true);
  };

  /* submit */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim())      { toast.error('Please enter your full name');     return; }
    if (!formData.phone.trim())     { toast.error('Please enter your phone number');  return; }
    if (!formData.email.trim())     { toast.error('Please enter your email address'); return; }

    if (isOtherFlow) {
      /* Other/Quick flow — submit directly without country/test/education IDs */
      if (!formData.testMode)       { toast.error('Please select a test mode');       return; }
      if (!formData.education.trim()) { toast.error('Please enter your education level'); return; }

      setSubmitting(true);
      try {
        await axios.post(`${API}/student-applications/enquiry`, {
          fullName:  formData.name.trim(),
          phone:     formData.phone.trim(),
          email:     formData.email.trim(),
          testMode:  formData.testMode,
          education: formData.education.trim(),
          note:      'Other countries / quick enquiry',
        });
        setIsSubmitted(true);
        toast.success('Enquiry submitted successfully!');
      } catch (err) {
        console.error('Enquiry submission error:', err);
        toast.error(err.response?.data?.message || 'Could not submit. Please try again.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    /* Normal flow */
    if (!selectedCountry?.id)       { toast.error('Country missing. Please go back and select a country.');    return; }
    if (!selectedTest?.id)          { toast.error('Intake missing. Please go back and select an intake.');     return; }
    if (!selectedEducation?.id)     { toast.error('Education missing. Please go back and select education.');  return; }

    setSubmitting(true);
    try {
      await axios.post(`${API}/student-applications`, {
        fullName:        formData.name.trim(),
        phone:           formData.phone.trim(),
        email:           formData.email.trim(),
        studiesAbroadId: selectedCountry.id,
        testSectionId:   selectedTest.id,
        educationId:     selectedEducation.id,
      });
      setIsSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err.response?.data?.message || 'Could not submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeFormModal = () => {
    setShowModal(false);
    setIsSubmitted(false);
    setIsOtherFlow(false);
    setFormData({ name: '', phone: '', email: '', testMode: '', education: '' });
  };

  const handleGoHome = () => {
    closeFormModal();
    window.dispatchEvent(new Event('aura:go-home'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/');
  };

  return (
    <div className="portal-step-renderer">

      {/* ── STEP 1: COUNTRY SELECTOR ── */}
      {currentStep === 'country' && (
        <section className="study-section">
          <div className="study-header">
            <h2 className="study-title">
              Which Country Do You Want to <span>Study In?</span>
            </h2>
            <p className="study-sub">
              Choose your dream destination and we'll guide you every step of the way.
            </p>
            <div className="study-divider" />
          </div>

          {loadingCountries ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
              <p>Loading countries...</p>
            </div>
          ) : (
            <div className="country-grid">
              {/* ── Country cards (sorted: UK first → Singapore last → new countries after) ── */}
              {countries.map((country, i) => {
                const featuresToShow = country.features?.slice(0, 3) || ['Quality Education', 'Global Opportunities', 'Expert Guidance'];
                const activeTestsCount = (country.tests || []).filter((t) => t.isActive).length;
                const bgImage = country.image
                  ? getImageUrl(country.image)
                  : 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80';

                return (
                  <div
                    key={country.id}
                    ref={(el) => (cardRefs.current[i] = el)}
                    className="flip-country-card"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flip-card-inner">

                      {/* ── FRONT ── */}
                      <div
                        className="flip-card-front"
                        style={{ backgroundImage: `url(${bgImage})` }}
                      >
                        <div className="front-overlay" />
                        <div className="front-badge">
                          {activeTestsCount > 0 ? `${activeTestsCount} Intake${activeTestsCount > 1 ? 's' : ''}` : 'Available'}
                        </div>
                        <div className="front-corner-accent" />
                        <div className="front-content">
                          <span className="front-code">{country.countryName?.slice(0, 2).toUpperCase()}</span>
                          <h3 className="front-name">{country.countryName}</h3>
                          <p className="front-hint">
                            <span className="hint-dot" /><span className="hint-dot" /><span className="hint-dot" />
                            Hover to explore
                          </p>
                        </div>
                      </div>

                      {/* ── BACK ── */}
                      <div
                        className="flip-card-back"
                        style={{ backgroundImage: `url(${bgImage})` }}
                      >
                        <div className="back-overlay" />
                        <div className="back-content">
                          <div className="back-country-name-row">
                            <MdFlightTakeoff className="back-plane-icon" />
                            <span className="back-country-name">{country.countryName}</span>
                          </div>

                          <div className="back-features-list">
                            {featuresToShow.map((feat, fi) => (
                              <div key={fi} className="back-feature-item">
                                <MdVerified className="back-feature-icon" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>

                          {activeTestsCount > 0 && (
                            <div className="back-intake-pill">
                              <MdAutoAwesome className="intake-star" />
                              {activeTestsCount} Intake{activeTestsCount > 1 ? 's' : ''} Available
                            </div>
                          )}

                          <button
                            className="back-enroll-btn"
                            onClick={() => handleCountrySelect(country)}
                          >
                            Enroll Now
                            <MdArrowForward className="enroll-arrow" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}

              {/* ── OTHER COUNTRIES CARD (always last) ── */}
              <div
                className="flip-country-card is-visible"
                style={{ animationDelay: `${countries.length * 0.05}s` }}
              >
                <OtherCountriesCard onApply={openOtherFlow} />
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── STEP 2: INTAKE SELECTION ── */}
      {currentStep === 'intake' && (
        <IntakeSelection
          countryId={selectedCountry?.id}
          countryName={selectedCountry?.countryName}
          onSelectIntake={handleIntakeSelect}
        />
      )}

      {/* ── STEP 3: EDUCATION SELECTION ── */}
      {currentStep === 'education' && selectedCountry && selectedTest && (
        <EducationQualification
          countryId={selectedCountry.id}
          onSelectLevel={handleEducationSelect}
        />
      )}

      {/* ── LEAD CAPTURE MODAL ── */}
      {showModal && (
        <div className="lead-modal-overlay">
          <div className="lead-modal-container">
            <div className="modal-accent-bar" />
            <button className="modal-close-icon-btn" onClick={closeFormModal} aria-label="Close">
              <IoClose />
            </button>

            {!isSubmitted ? (
              <div className="modal-form-body">
                <div className="modal-form-icon">
                  {isOtherFlow ? <MdPublic /> : <IoAirplaneSharp />}
                </div>
                <h2 className="form-heading">
                  {isOtherFlow ? <>Enquire About <span>Other Countries</span></> : <>Start Your <span>Study Abroad</span> Journey</>}
                </h2>
                <p className="form-subheading">
                  {isOtherFlow
                    ? 'Tell us your preferences — our counselor will reach out with options tailored to you.'
                    : 'Fill in your details — our senior overseas counselor will reach out shortly.'}
                </p>

                {/* Show selection summary for normal flow */}
                {!isOtherFlow && (
                  <div className="selected-options-summary">
                    <div className="summary-item">
                      <RiGlobalLine className="summary-icon" />
                      <span>{selectedCountry?.countryName}</span>
                    </div>
                    {selectedTest && (
                      <div className="summary-item">
                        <RiTimeLine className="summary-icon" />
                        <span>{selectedTest.startMonth} – {selectedTest.endMonth} {selectedTest.year}</span>
                      </div>
                    )}
                    {selectedEducation && (
                      <div className="summary-item">
                        <RiGraduationCapLine className="summary-icon" />
                        <span>{selectedEducation.name}</span>
                      </div>
                    )}
                  </div>
                )}

                <form className="lead-generation-form" onSubmit={handleFormSubmit}>
                  <div className="input-group-field">
                    <label className="input-label">Full Name</label>
                    <div className="input-icon-wrapper">
                      <MdPerson className="input-icon" />
                      <input type="text" placeholder="e.g. Arjun Sharma" required value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                  </div>
                  <div className="input-group-field">
                    <label className="input-label">Phone Number</label>
                    <div className="input-icon-wrapper">
                      <MdPhone className="input-icon" />
                      <input type="tel" placeholder="+91 98765 43210" required value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="input-group-field">
                    <label className="input-label">Email Address</label>
                    <div className="input-icon-wrapper">
                      <MdEmail className="input-icon" />
                      <input type="email" placeholder="you@email.com" required value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>

                  {/* Extra fields for Other/Quick flow */}
                  {isOtherFlow && (
                    <>
                      <div className="input-group-field">
                        <label className="input-label">Preferred Test Mode</label>
                        <div className="input-icon-wrapper">
                          <RiTimeLine className="input-icon" />
                          <select
                            required
                            value={formData.testMode}
                            onChange={(e) => setFormData({ ...formData, testMode: e.target.value })}
                            className="select-field"
                          >
                            <option value="">Select intake window…</option>
                            {TEST_MODES.map(tm => (
                              <option key={tm.value} value={tm.value}>{tm.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="input-group-field">
                        <label className="input-label">Education Qualification</label>
                        <div className="input-icon-wrapper">
                          <MdEditNote className="input-icon" />
                          <input
                            type="text"
                            placeholder="e.g. Bachelor's, Master's, 12th Grade…"
                            required
                            value={formData.education}
                            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button type="submit" className="form-submit-cta-btn" disabled={submitting}>
                    {submitting ? 'Submitting...' : (isOtherFlow ? 'Submit Enquiry' : 'Start My Journey')}
                    {!submitting && <MdArrowForward className="btn-arrow-icon" />}
                  </button>
                </form>
              </div>
            ) : (
              <div className="modal-success-body">
                <div className="success-ripple-wrapper">
                  <div className="success-ripple" />
                  <div className="success-ripple delay-1" />
                  <div className="success-icon-badge"><MdCheckCircle /></div>
                </div>
                <h2 className="success-heading">You're All Set!</h2>
                <p className="success-message">
                  Thank you, <strong>{formData.name || 'there'}</strong>! Our senior overseas
                  counselor will contact you at <strong>{formData.phone}</strong> shortly.
                </p>
                <button className="success-home-btn" onClick={handleGoHome}>
                  <IoHome className="home-btn-icon" />
                  <span>Go to Home Page</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyAbroad;