import React, { useState, useEffect, useRef } from 'react';
import './Home.css';
import Hero from '../components/Hero/Hero';
import StudyAbroad from '../components/StudyAbroad/StudyAbroad';
import ConsultationForm from '../components/Consultationform/Consultationform';
import OverseasServices from '../components/OverseasServices/OverseasServices';
import AboutSection from '../components/AboutSection/AboutSection';

/* ── Section reveal wrapper ── */
function SectionReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('is-revealed'), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.07 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return <div ref={ref} className="section-reveal">{children}</div>;
}

/* ── Step label map ── */
const STEP_LABELS = {
  intake:    { step: 2, label: 'Intake Selection' },
  education: { step: 3, label: 'Education Level'  },
};

/* ── Session keys ── */
const STEP_KEY      = 'aura_currentStep';
const SELECTION_KEY = 'aura_selections';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(
    () => sessionStorage.getItem(STEP_KEY) || 'country'
  );
  const [selections, setSelections] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(SELECTION_KEY)) || {}; }
    catch { return {}; }
  });

  /* persist step for refresh */
  useEffect(() => { sessionStorage.setItem(STEP_KEY, currentStep); }, [currentStep]);
  useEffect(() => { sessionStorage.setItem(SELECTION_KEY, JSON.stringify(selections)); }, [selections]);

  /* listen for global "go home" event */
  useEffect(() => {
    const onNavHome = () => {
      sessionStorage.removeItem(STEP_KEY);
      sessionStorage.removeItem(SELECTION_KEY);
      setSelections({});
      setCurrentStep('country');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('aura:go-home', onNavHome);
    return () => window.removeEventListener('aura:go-home', onNavHome);
  }, []);

  /* ── handlers ── */
  const handleCountrySelection = (country) => {
    setSelections(prev => ({ ...prev, country }));
    setCurrentStep('intake');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIntakeSelection = (test) => {
    setSelections(prev => ({ ...prev, test }));
    setCurrentStep('education');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEducationSelection = (education) => {
    setSelections(prev => ({ ...prev, education }));
  };

  const handleBack = () => {
    if (currentStep === 'education') setCurrentStep('intake');
    else if (currentStep === 'intake')  setCurrentStep('country');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHome = () => {
    sessionStorage.removeItem(STEP_KEY);
    sessionStorage.removeItem(SELECTION_KEY);
    setSelections({});
    setCurrentStep('country');
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
                <span className={`ptb-crumb ${selections.country ? 'is-done' : ''}`}>
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
          {/* ✅ FIX: pass selectedCountryProp and selectedTestProp so sub-steps work correctly */}
          <StudyAbroad
            currentStep={currentStep}
            onSelectCountry={handleCountrySelection}
            onSelectIntake={handleIntakeSelection}
            onSelectEducation={handleEducationSelection}
            selectedCountryProp={selections.country || null}
            selectedTestProp={selections.test || null}
          />
        </div>
      </div>
    );
  }

  /* ── Normal home page (country selection step) ── */
  return (
    <main className="homepage-wrapper">
      <Hero />
      <SectionReveal delay={0}>
        <StudyAbroad
          currentStep={currentStep}
          onSelectCountry={handleCountrySelection}
          onSelectIntake={handleIntakeSelection}
          onSelectEducation={handleEducationSelection}
        />
      </SectionReveal>
      <SectionReveal delay={50}><ConsultationForm /></SectionReveal>
      <SectionReveal delay={50}><OverseasServices /></SectionReveal>
      <SectionReveal delay={50}><AboutSection /></SectionReveal>
    </main>
  );
}
