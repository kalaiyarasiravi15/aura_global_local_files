// src/pages/ExamPrep.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { IoBookSharp, IoTimeOutline, IoCalendarOutline, IoLayersOutline } from 'react-icons/io5';
import { API, slugify } from '../config';
import './ExamPrep.css';

export default function ExamPrepPage() {
  const bgRef = useRef(null);

  // Now reads from /exam-prep/:examId
  const { examId } = useParams();

  const [examData,  setExamData]  = useState(null);
  const [countries, setCountries] = useState([]);
  const [loading,   setLoading]   = useState(true);

  // Hero zoom-in animation on mount
  useEffect(() => {
    const t = setTimeout(() => {
      if (bgRef.current) bgRef.current.classList.add('exm-bg-zoomed');
    }, 100);
    return () => clearTimeout(t);
  }, []);

  // Fetch exam list + countries whenever examId changes
  useEffect(() => {
    const fetchExamDetails = async () => {
      setLoading(true);
      try {
        const [examsRes, countriesRes] = await Promise.all([
          axios.get(`${API}/studies-abroad/exams`),
          axios.get(`${API}/studies-abroad`),
        ]);

        const examList = Array.isArray(examsRes.data)
          ? examsRes.data
          : examsRes.data.exams || [];

        setCountries(countriesRes.data.countries || []);

        // If examId present in URL → find that specific exam by slug
        // Otherwise → fall back to the first exam in the list
        const currentExam = examId
          ? examList.find((e) => slugify(e.name) === examId)
          : examList[0];

        setExamData(currentExam || null);
      } catch (error) {
        console.error("Failed to fetch exam data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [examId]);

  const getCountryName = (countryId) => {
    if (!countryId) return 'All Countries';
    const match = countries.find((c) => String(c.id) === String(countryId));
    return match ? match.countryName : 'Global Registration';
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div
        className="exm-prep-page"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <div className="table-empty-state">Loading course curriculum frameworks...</div>
      </div>
    );
  }

  /* ── Empty / not-found state ── */
  if (!examData) {
    return (
      <div
        className="exm-prep-page"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <div className="table-empty-state">No active exam preparation metrics found.</div>
      </div>
    );
  }

  return (
    <div className="exm-prep-page">

      {/* ══════════════════════════════════
          HERO BANNER
          ══════════════════════════════════ */}
      <section className="exm-hero-section">
        <div className="exm-hero-bg-image" ref={bgRef}></div>
        <div className="exm-hero-overlay"></div>
        <div className="exm-hero-inner">
          <h1 className="exm-main-heading">Exam Preparation</h1>
        </div>
      </section>

      {/* ══════════════════════════════════
          EXAM INTRO SECTION
          ══════════════════════════════════ */}
      <section className="exm-intro-section">
        <div className="exm-container">
          <div className="exm-header-block">
            <h2 className="exm-title">{examData.name}</h2>
            <div className="exm-country-tag">
              <span>Country Area:</span>{' '}
              <strong>{getCountryName(examData.studiesAbroadId)}</strong>
            </div>
          </div>

          <div className="exm-desc-box">
            <h3>Description</h3>
            <p>
              {examData.description ||
                'Comprehensive test syllabus blueprint configuration is being loaded for this specific course stack.'}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          PROGRAM BATCHES — 2-COLUMN GRID
          ══════════════════════════════════ */}
      <section className="exm-batches-section">
        <div className="exm-container">
          <h3 className="exm-section-subtitle">Program Batches</h3>

          <div
            className="exm-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(45%, 1fr))',
              gap: '30px',
            }}
          >
            {examData.programs &&
              examData.programs
                .filter((b) => b.isActive)
                .map((batch, i) => (
                  <article
                    className="exm-batch-card"
                    key={batch.id || i}
                    style={{
                      '--card-idx': i,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    {/* Floating Icon Badge */}
                    <div className="exm-batch-card__icon-badge" aria-hidden="true">
                      <div className="exm-batch-card__icon-glow" />
                      <IoBookSharp className="exm-batch-card__icon" />
                    </div>

                    <div className="exm-batch-card__status-row">
                      <span className="exm-status-pill">Active</span>
                    </div>

                    <div className="exm-batch-card__content" style={{ flexGrow: 1 }}>
                      <h4 className="exm-batch-card__title">{batch.title}</h4>

                      {/* Core specs */}
                      <div className="exm-specs-matrix">
                        <div className="exm-spec-item">
                          <IoCalendarOutline />
                          <span>
                            {batch.duration} ({batch.totalSessions} sessions)
                          </span>
                        </div>
                        <div className="exm-spec-item">
                          <IoTimeOutline />
                          <span>{batch.sessionDuration} per class</span>
                        </div>
                        <div className="exm-spec-item">
                          <IoLayersOutline />
                          <span>{batch.mockTests} Mocks</span>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="exm-schedule-box">
                        <span className="exm-schedule-label">Schedule:</span>
                        <p className="exm-schedule-text">{batch.timing}</p>
                      </div>
                    </div>

                    {/* Price footer */}
                    <div
                      className="exm-batch-card__footer"
                      style={{
                        justifyContent: 'center',
                        paddingTop: '20px',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div className="exm-price-tag" style={{ fontSize: '1.4rem', margin: 0 }}>
                        ₹{parseFloat(batch.price).toLocaleString('en-IN')} INR
                      </div>
                    </div>
                  </article>
                ))}
          </div>

          {/* Fallback if no active programs */}
          {(!examData.programs ||
            examData.programs.filter((b) => b.isActive).length === 0) && (
            <div
              className="text-center text-muted"
              style={{ padding: '40px 0', textAlign: 'center', color: '#888' }}
            >
              No program tracks are actively configured for display right now.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
