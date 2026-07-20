import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './IntakeSelection.css';
import { IoSnowOutline, IoLeafOutline, IoFlameOutline, IoCheckmarkCircle } from 'react-icons/io5';
import { MdOutlineCalendarMonth } from 'react-icons/md';
import { API } from '../../config';

const getSeason = (month) => {
  const winterMonths = ['December', 'January', 'February'];
  const springMonths = ['March', 'April', 'May'];
  const autumnMonths = ['September', 'October', 'November'];

  if (winterMonths.includes(month)) return { season: 'Winter', icon: <IoSnowOutline /> };
  if (springMonths.includes(month)) return { season: 'Spring', icon: <IoLeafOutline /> };
  if (autumnMonths.includes(month)) return { season: 'Autumn', icon: <IoFlameOutline /> };
  return { season: 'Summer', icon: <IoFlameOutline /> };
};

const titleWords = ['Your', 'Preferred', 'Intake?'];

const IntakeSelection = ({ countryId, countryName, onSelectIntake }) => {
  const [intakes, setIntakes]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedIntake, setSelectedIntake] = useState(null);
  const [error, setError]                   = useState(null);

  const eyebrowRef  = useRef(null);
  const headerRef   = useRef(null);
  const dividerRef  = useRef(null);
  const subtitleRef = useRef(null);
  const hintRef     = useRef(null);
  const wordRefs    = useRef([]);
  const cardRefs    = useRef([]);

  useEffect(() => {
    if (countryId) {
      fetchIntakes();
    } else {
      setLoading(false);
      setError('No country selected. Please go back and select a country.');
    }
  }, [countryId]);

  const fetchIntakes = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API}/studies-abroad/tests/country/${countryId}`;
      const { data } = await axios.get(url);

      const allTests    = data.tests || [];
      const activeTests = allTests.filter(test => test.isActive === true);

      if (activeTests.length === 0) {
        setError(`No active intake options available for ${countryName || 'this country'}`);
        setIntakes([]);
        setLoading(false);
        return;
      }

      const formattedIntakes = activeTests.map(test => {
        const season = getSeason(test.startMonth);
        return {
          id:         test.id,
          season:     `${season.season} Intake`,
          months:     `${test.startMonth} – ${test.endMonth} ${test.year}`,
          icon:       season.icon,
          tag:        season.season,
          startMonth: test.startMonth,
          endMonth:   test.endMonth,
          year:       test.year,
          isActive:   test.isActive,
        };
      });

      setIntakes(formattedIntakes);
      setLoading(false);
    } catch (err) {
      console.error('IntakeSelection - Error fetching:', err);
      setError(err.response?.data?.message || 'Failed to load intake options');
      toast.error('Could not load intake options');
      setLoading(false);
    }
  };

  /* ── FIX: header animation with 50ms delay so refs are populated ── */
  useEffect(() => {
    const eyebrowTimer = setTimeout(() => {
      if (eyebrowRef.current) eyebrowRef.current.classList.add('is-visible');
    }, 100);

    const observerTimer = setTimeout(() => {
      const headerObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          wordRefs.current.forEach((el, i) => {
            if (!el) return;
            el.style.animation = `intakeWordReveal 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.15}s forwards`;
          });

          const finish = titleWords.length * 150 + 80;
          setTimeout(() => dividerRef.current?.classList.add('is-visible'), finish);
          setTimeout(() => subtitleRef.current?.classList.add('is-visible'), finish + 120);
          setTimeout(() => hintRef.current?.classList.add('is-visible'),    finish + 400);

          headerObserver.disconnect();
        },
        { threshold: 0.2 }
      );

      if (headerRef.current) headerObserver.observe(headerRef.current);
      return () => headerObserver.disconnect();
    }, 50);

    return () => {
      clearTimeout(eyebrowTimer);
      clearTimeout(observerTimer);
    };
  }, []);

  /* ── card reveal ── */
  useEffect(() => {
    if (intakes.length === 0) return;

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const card  = entry.target;
          const delay = parseFloat(card.dataset.delay || 0);
          setTimeout(() => card.classList.add('is-visible'), delay);
          cardObserver.unobserve(card);
        });
      },
      { threshold: 0.12 }
    );

    cardRefs.current.forEach((el) => { if (el) cardObserver.observe(el); });
    return () => cardObserver.disconnect();
  }, [intakes]);

  const handleIntakeSelect = (intake) => {
    setSelectedIntake(intake.id);
    if (onSelectIntake) {
      onSelectIntake({
        id:         intake.id,
        startMonth: intake.startMonth,
        endMonth:   intake.endMonth,
        year:       intake.year,
        isActive:   true,
      });
    }
  };

  if (loading) {
    return (
      <section className="intake-section">
        <div className="intake-container">
          <div className="loading-spinner-container">
            <div className="loading-spinner" />
            <p>Loading intake options for {countryName || 'this country'}...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="intake-section">
        <div className="intake-container">
          <div className="no-data-message">
            <p>⚠️ {error}</p>
            <button className="back-button" onClick={() => window.history.back()}>
              Go Back to Countries
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (intakes.length === 0) {
    return (
      <section className="intake-section">
        <div className="intake-container">
          <div className="no-data-message">
            <p>📭 No intake options available for {countryName || 'this country'}.</p>
            <button className="back-button" onClick={() => window.history.back()}>
              Go Back to Countries
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="intake-section">
      <div className="intake-container">

        <div className="intake-header-wrapper" ref={headerRef}>
          <div className="intake-eyebrow" ref={eyebrowRef}>
            Step 2 of 3
          </div>
          <h2 className="intake-section-title">
            {titleWords.map((word, i) => (
              <span key={i} className="intake-word">
                {/* FIX: no inline style override — CSS fallback handles visibility */}
                <span
                  className={`intake-word-inner${word === 'Intake?' ? ' is-gold' : ''}`}
                  ref={(el) => (wordRefs.current[i] = el)}
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>
          <div className="intake-divider" ref={dividerRef} />
          <p className="intake-section-subtitle" ref={subtitleRef}>
            Select the academic term you wish to begin your journey in {countryName}.
          </p>
        </div>

        <div className="intake-grid-layout">
          {intakes.map((item, i) => (
            <label
              key={item.id}
              className={`intake-interactive-card${selectedIntake === item.id ? ' card-checked' : ''}`}
              ref={(el) => (cardRefs.current[i] = el)}
              data-delay={i * 130}
            >
              <input
                type="radio"
                name="intake"
                value={item.id}
                checked={selectedIntake === item.id}
                onChange={() => handleIntakeSelect(item)}
                className="intake-hidden-radio"
              />
              <div className="intake-card-ui">
                <div className="intake-card-accent-border" />
                <div className="intake-season-tag">{item.tag}</div>
                <div className="intake-giant-bg-icon">{item.icon}</div>
                <div className="intake-content-box">
                  <div className="intake-icon-frame">{item.icon}</div>
                  <h3 className="intake-card-name">{item.season}</h3>
                  <div className="intake-timeline">
                    <MdOutlineCalendarMonth className="calendar-icon" />
                    <p className="intake-card-date">{item.months}</p>
                  </div>
                </div>
                <div className="intake-selected-badge">
                  <IoCheckmarkCircle />
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="intake-hint-row" ref={hintRef}>
          <span className="intake-hint-dot" />
          Click a card to select your intake and continue
          <span className="intake-hint-dot" />
        </div>

      </div>
    </section>
  );
};

export default IntakeSelection;