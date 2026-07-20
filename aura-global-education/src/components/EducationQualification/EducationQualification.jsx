import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './EducationQualification.css';
import {
  MdSchool, MdBook, MdWork, MdPublic, MdLayers, MdStar, MdChevronRight,
} from 'react-icons/md';
import { API } from '../../config';

const titleWords = [
  { text: "What's", gold: true },
  { text: 'the', gold: false },
  { text: 'Highest', gold: false },
  { text: 'Education', gold: false },
  { text: "You've", gold: true },
  { text: 'Completed?', gold: true },
];

/* ─── helpers ─────────────────────────────────────────────────────── */

const KNOWN_SUFFIXES = [
  'Undergraduate academic degree courses',
  'Postgraduate specialized career track',
  'Advanced global research programs',
  'Technical or short vocational streams',
  'Short-term professional certification',
  'Educational program for your career growth',
  'Completed secondary level schooling',
];

function splitNameAndDesc(rawName) {
  for (const suffix of KNOWN_SUFFIXES) {
    if (rawName.includes(suffix)) {
      const title = rawName.replace(suffix, '').trim();
      return { title, desc: suffix };
    }
  }
  return { title: rawName, desc: getDescriptionByName(rawName) };
}

function getDescriptionByName(name) {
  const n = name.toLowerCase();
  if (n.includes('bachelor'))                       return 'Undergraduate academic degree courses';
  if (n.includes('master'))                         return 'Postgraduate specialized career track';
  if (n.includes('phd') || n.includes('doctorate')) return 'Advanced global research programs';
  if (n.includes('diploma'))                        return 'Technical or short vocational streams';
  if (n.includes('certificate'))                    return 'Short-term professional certification';
  if (n.includes('high school') || n.includes('12th')) return 'Completed secondary level schooling';
  return 'Educational program for your career growth';
}

function getIconByName(name) {
  const n = name.toLowerCase();
  if (n.includes('bachelor'))                       return <MdSchool />;
  if (n.includes('master'))                         return <MdWork />;
  if (n.includes('phd') || n.includes('doctorate')) return <MdPublic />;
  if (n.includes('diploma'))                        return <MdLayers />;
  if (n.includes('certificate'))                    return <MdStar />;
  return <MdBook />;
}

/* ─── component ───────────────────────────────────────────────────── */

const EducationQualification = ({ countryId, onSelectLevel }) => {
  const [educations, setEducations]               = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [selectedEducation, setSelectedEducation] = useState(null);

  const headerRef   = useRef(null);
  const dividerRef  = useRef(null);
  const subtitleRef = useRef(null);
  const wordRefs    = useRef([]);
  const rowRefs     = useRef([]);

  useEffect(() => { if (countryId) fetchEducations(); }, [countryId]);

  const fetchEducations = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/studies-abroad/educations/country/${countryId}`);
      const formatted = (data.educations || []).map(edu => {
        const { title, desc } = splitNameAndDesc(edu.name);
        return { id: edu.id, title, desc, icon: getIconByName(edu.name) };
      });
      setEducations(formatted);
    } catch (error) {
      console.error('Error fetching educations:', error);
      toast.error('Could not load education options');
    } finally {
      setLoading(false);
    }
  };

  /* ── FIX: header animation with 50ms delay so refs are ready ── */
  useEffect(() => {
    const timeout = setTimeout(() => {
      const headerObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          wordRefs.current.forEach((el, i) => {
            if (!el) return;
            el.style.animation = `eduWordReveal 0.6s cubic-bezier(0.25, 1, 0.5, 1) ${i * 0.1}s forwards`;
          });

          const finish = titleWords.length * 100 + 200;
          setTimeout(() => dividerRef.current?.classList.add('is-visible'), finish);
          setTimeout(() => subtitleRef.current?.classList.add('is-visible'), finish + 150);
          headerObserver.disconnect();
        },
        { threshold: 0.15 }
      );

      if (headerRef.current) headerObserver.observe(headerRef.current);
      return () => headerObserver.disconnect();
    }, 50);

    return () => clearTimeout(timeout);
  }, []);

  /* ── row reveal ── */
  useEffect(() => {
    if (educations.length === 0 || loading) return;
    const rowObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-reveal-active');
          rowObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08 }
    );
    rowRefs.current.forEach(el => { if (el) rowObserver.observe(el); });
    return () => rowObserver.disconnect();
  }, [educations, loading]);

  const handleEducationSelect = (education) => {
    setSelectedEducation(education.id);
    if (onSelectLevel) onSelectLevel({ id: education.id, name: education.title });
  };

  if (loading) {
    return (
      <section className="edu-section">
        <div className="edu-container">
          <div className="loading-spinner-container">
            <div className="loading-spinner" />
            <p>Loading education programs...</p>
          </div>
        </div>
      </section>
    );
  }

  if (educations.length === 0) {
    return (
      <section className="edu-section">
        <div className="edu-container">
          <div className="no-data-message">
            <p>No education programs available for this country.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="edu-section">
      <div className="edu-container">

        <div className="edu-header-wrapper" ref={headerRef}>
          <h2 className="edu-section-title">
            {titleWords.map((word, i) => (
              <span key={i} className="edu-word">
                {/* FIX: removed debug style={{ color: "red" }} */}
                <span
                  className={`edu-word-inner${word.gold ? ' is-gold' : ''}`}
                  ref={el => (wordRefs.current[i] = el)}
                >
                  {word.text}
                </span>
              </span>
            ))}
          </h2>
          <div className="edu-divider" ref={dividerRef} />
          <p className="edu-section-subtitle" ref={subtitleRef}>
            Select your completed or currently pursuing academic tier.
          </p>
        </div>

        <div className="edu-stack-layout">
          {educations.map((level, i) => {
            const side     = i % 2 === 0 ? 'from-left' : 'from-right';
            const rowDelay = `${Math.floor(i / 2) * 0.15}s`;

            return (
              <label
                key={level.id}
                className={`edu-list-row ${side}`}
                ref={el => (rowRefs.current[i] = el)}
                style={{ '--row-delay': rowDelay }}
              >
                <input
                  type="radio"
                  name="education"
                  value={level.id}
                  checked={selectedEducation === level.id}
                  className="edu-hidden-radio"
                  onChange={() => handleEducationSelect(level)}
                />
                <div className="edu-row-ui-box">
                  <div className="edu-left-meta">
                    <div className="edu-custom-radio-btn">
                      <div className="edu-radio-core" />
                    </div>
                    <div className="edu-icon-wrapper">{level.icon}</div>
                    <div className="edu-text-meta">
                      <h3 className="edu-card-title">{level.title}</h3>
                      <p className="edu-card-desc">{level.desc}</p>
                    </div>
                  </div>
                  <div className="edu-arrow-indicator"><MdChevronRight /></div>
                </div>
              </label>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default EducationQualification;