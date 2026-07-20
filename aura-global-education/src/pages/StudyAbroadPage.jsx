import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import StudyAbroadPortal from '../components/StudyAbroad/StudyAbroad';
import Whystudentssection from '../components/Whystudentssection/Whystudentssection';
import AuraAdvantage from '../components/Auraadvantage/Auraadvantage';
import { API, slugify } from '../config';
import './StudyAbroadPage.css';
import './Home.css';

const STEP_LABELS = {
  intake:    { step: 2, label: 'Intake Selection' },
  education: { step: 3, label: 'Education Level'  },
};

export default function StudyAbroadPage() {
  const heroRef  = useRef(null);
  const navigate = useNavigate();

  // Reads /study-abroad/:countrySlug from the URL
  // e.g. /study-abroad/india  →  countrySlug = "india"
  // e.g. /study-abroad/united-kingdom  →  countrySlug = "united-kingdom"
  const { countrySlug } = useParams();

  const [currentStep,     setCurrentStep]     = useState('country');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedTest,    setSelectedTest]    = useState(null);
  const [selectedEdu,     setSelectedEdu]     = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => {
      if (heroRef.current) heroRef.current.classList.add('sa-hero--zoomed');
    }, 80);
    return () => clearTimeout(t);
  }, []);

  /* ─────────────────────────────────────────────────────────────
     AUTO-SELECT: When navbar link is clicked e.g. "Study in India"
     → URL becomes /study-abroad/india
     → This effect fires, fetches all countries, matches by slug
     → Sets selectedCountry + jumps straight to intake (test) step
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!countrySlug) return; // no slug = normal /study-abroad page, skip

    const autoSelectCountry = async () => {
      try {
        const { data } = await axios.get(`${API}/studies-abroad`);
        const list = data.countries || [];

        // Convert "United Kingdom" → "united-kingdom" to match slug
        const matched = list.find(c => slugify(c.countryName) === countrySlug.toLowerCase());

        if (matched) {
          setSelectedCountry(matched);
          setCurrentStep('intake');   // jump straight to test/intake step
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Slug not found — fall back to country list view
          console.warn(`StudyAbroadPage: no country matched slug "${countrySlug}"`);
        }
      } catch (err) {
        console.error('StudyAbroadPage: failed to auto-select country', err);
      }
    };

    autoSelectCountry();
  }, [countrySlug]); // re-runs if user clicks a different country from navbar

  /* ── handlers ── */
  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setCurrentStep('intake');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectIntake = (test) => {
    setSelectedTest(test);
    setCurrentStep('education');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEducation = (education) => {
    setSelectedEdu(education);
    // modal opens inside StudyAbroad component
  };

  const handleBack = () => {
    if (currentStep === 'education') {
      setCurrentStep('intake');
    } else if (currentStep === 'intake') {
      setCurrentStep('country');
      setSelectedCountry(null);
      setSelectedTest(null);
      navigate('/study-abroad');   // go back to country list
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHome = () => {
    setCurrentStep('country');
    setSelectedCountry(null);
    setSelectedTest(null);
    setSelectedEdu(null);
    navigate('/study-abroad');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Portal view (intake / education steps) ── */
  if (currentStep !== 'country') {
    const { step } = STEP_LABELS[currentStep] || {};
    return (
      <div className="portal-full-page">
        {/* ── TOP BAR ── */}
        <div className="portal-topbar">
          <div className="portal-topbar-inner">
            <div className="portal-topbar-left">
              <button className="ptb-btn ptb-btn--back" onClick={handleBack}>
                <span className="ptb-arrow">←</span>
                <span>Back</span>
              </button>
              <button className="ptb-btn ptb-btn--home" onClick={handleHome}>
                <span className="ptb-home-icon">⌂</span>
                <span>Home</span>
              </button>
            </div>
            <div className="portal-topbar-center">
              <div className="ptb-breadcrumb">
                <span className={`ptb-crumb ${selectedCountry ? 'is-done' : ''}`}>
                  <span className="ptb-crumb-num">1</span>
                  <span className="ptb-crumb-text">Destination</span>
                </span>
                <span className="ptb-crumb-sep">›</span>
                <span className={`ptb-crumb ${currentStep === 'intake' ? 'is-active' : currentStep === 'education' ? 'is-done' : ''}`}>
                  <span className="ptb-crumb-num">2</span>
                  <span className="ptb-crumb-text">Intake</span>
                </span>
                <span className="ptb-crumb-sep">›</span>
                <span className={`ptb-crumb ${currentStep === 'education' ? 'is-active' : ''}`}>
                  <span className="ptb-crumb-num">3</span>
                  <span className="ptb-crumb-text">Education</span>
                </span>
              </div>
            </div>
            <div className="portal-topbar-right">
              <span className="ptb-step-badge">Step {step} of 3</span>
            </div>
          </div>
        </div>

        {/* ── PORTAL CONTENT ── */}
        <div className="portal-content-area">
          <StudyAbroadPortal
            currentStep={currentStep}
            onSelectCountry={handleSelectCountry}
            onSelectIntake={handleSelectIntake}
            onSelectEducation={handleSelectEducation}
            selectedCountryProp={selectedCountry}
            selectedTestProp={selectedTest}
          />
        </div>
      </div>
    );
  }

  /* ── Country selection view (default /study-abroad) ── */
  return (
    <main className="sa-page">
      {/* ── HERO ── */}
      <section className="sa-hero">
        <div className="sa-hero__bg" ref={heroRef} />
        <div className="sa-hero__overlay" />
        <div className="sa-hero__content">
          <h1>Study Abroad</h1>
        </div>
      </section>

      {/* ── COUNTRY CARDS ── */}
      <section className="sa-body">
        <StudyAbroadPortal
          currentStep={currentStep}
          onSelectCountry={handleSelectCountry}
          onSelectIntake={handleSelectIntake}
          onSelectEducation={handleSelectEducation}
        />
      </section>

      <Whystudentssection />
      <AuraAdvantage />
    </main>
  );
}
