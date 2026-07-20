import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutSection.css';

// Importing assets locally from assets/image
import mainStudentImg from '../../assets/aboutimg.webp';
import overlayLeftImg from '../../assets/about1.jpg';
import overlayRightImg from '../../assets/about2.jpg';

const IMAGES = {
  mainStudent: mainStudentImg,
  overlayLeft: overlayLeftImg,
  overlayRight: overlayRightImg,
};

const planeSVG = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"/>
  </svg>
);

/* Split heading into word spans for stagger animation */
const HeadingWords = ({ text, highlightWords = [] }) => {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => {
        const isHighlight = highlightWords.includes(word.replace(/[^a-zA-Z]/g, ''));
        return (
          <span
            key={i}
            className={`aura-word${isHighlight ? ' aura-word--highlight' : ''}`}
            style={{ '--word-delay': `${i * 0.07}s` }}
          >
            {word}
          </span>
        );
      })}
    </>
  );
};

const AboutSection = () => {
  const navigate = useNavigate();
  const sectionRef  = useRef(null);
  const headingRef  = useRef(null);
  const tagRef      = useRef(null);
  const descRef     = useRef(null);
  const actionRef   = useRef(null);

  useEffect(() => {
    /* --- Left visual block + generic scroll reveals --- */
    const genericObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('aura-in-view');
        });
      },
      { threshold: 0.15 }
    );

    const section = sectionRef.current;
    if (section) {
      genericObserver.observe(section);
      section.querySelectorAll('.aura-scroll-reveal').forEach((el) => genericObserver.observe(el));
    }

    /* --- Word-by-word heading observer --- */
    const wordObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const words = entry.target.querySelectorAll('.aura-word');
            words.forEach((w) => w.classList.add('aura-word--visible'));
            wordObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    /* --- Tag, desc, action bar fade-up observer --- */
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aura-fade--visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (headingRef.current) wordObserver.observe(headingRef.current);
    [tagRef, descRef, actionRef].forEach((r) => {
      if (r.current) fadeObserver.observe(r.current);
    });

    return () => {
      genericObserver.disconnect();
      wordObserver.disconnect();
      fadeObserver.disconnect();
    };
  }, []);

  return (
    <section className="aura-about-container" ref={sectionRef}>

      {/* ===== LEFT: VISUAL BLOCK ===== */}
      <div className="aura-about-left aura-scroll-reveal aura-reveal-left">
        <div className="aura-bg-dashed-ring" />
        <div className="aura-flight-orbit-track">
          <div className="flight-node fn-1">{planeSVG}</div>
          <div className="flight-node fn-2">{planeSVG}</div>
          <div className="flight-node fn-3">{planeSVG}</div>
          <div className="flight-node fn-4">{planeSVG}</div>
        </div>
        <div className="aura-main-circle-card">
          <div className="aura-circle-color-layer" />
          <div className="aura-inner-decor-circle decor-c1" />
          <div className="aura-inner-decor-circle decor-c2" />
          <div className="aura-inner-decor-circle decor-c3" />
          <img src={IMAGES.mainStudent} alt="Primary Consultant" className="aura-main-inside-img" />
        </div>
        <div className="aura-overlay-bubble bubble-pos-left">
          <div className="bubble-bg-color pink-layer" />
          <img src={IMAGES.overlayLeft} alt="Student Mentorship" />
        </div>
        <div className="aura-overlay-bubble bubble-pos-right">
          <div className="bubble-bg-color purple-layer" />
          <img src={IMAGES.overlayRight} alt="Global Admissions Success" />
        </div>
      </div>

      {/* ===== RIGHT: CONTENT BLOCK ===== */}
      <div className="aura-about-right">

        {/* Tag — fade up */}
        <span
          className="aura-about-tag aura-fade"
          ref={tagRef}
          style={{ '--fade-delay': '0s' }}
        >
          WHO WE ARE
        </span>

        {/* Heading — word by word */}
        <h2 className="aura-about-heading" ref={headingRef}>
          <HeadingWords
            text="Empowering Ambitions Globally With Trusted Experts."
            highlightWords={['Trusted', 'Experts.']}
          />
        </h2>

        {/* Description — fade up */}
        <p
          className="aura-about-description aura-fade"
          ref={descRef}
          style={{ '--fade-delay': '0.15s' }}
        >
          At Aura Global, we bridge the gap between capability and global
          opportunities. As a premier career guidance and overseas admissions
          platform, we utilize scientific psychometric frameworks and expert
          mentorship to steer students and professionals toward exceptional
          global futures.
        </p>

        {/* Action bar — fade up */}
        <div
          className="aura-about-action-bar aura-fade"
          ref={actionRef}
          style={{ '--fade-delay': '0.28s' }}
        >
          <div className="aura-about-info-text">
            <span className="aura-about-info-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
            <span className="aura-about-placeholder">
              Explore certified counseling solutions...
            </span>
          </div>
          <button className="aura-about-btn" onClick={() => navigate('/about')}>
            <span>About Us</span>
            <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;