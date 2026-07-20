import { useEffect, useRef } from 'react';
import './Auraadvantage.css';
import abroadImg from '../../assets/studyabroad.jpg';

const advantages = [
  'Clear and honest communication at every stage',
  'Guidance based on student goals and future plans',
  'Responsible support throughout the study abroad journey',
  'Helping students make informed and confident decisions',
  'Simplifying complex processes with proper direction',
  'End-to-end assistance from application to departure',
];

export default function AuraAdvantage() {
  const listRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const items = listRef.current?.querySelectorAll('.aa-item');
    const cta = ctaRef.current;
    if (!items) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        items.forEach((item, i) => {
          setTimeout(() => item.classList.add('visible'), i * 80);
        });
        setTimeout(() => cta?.classList.add('visible'), items.length * 80 + 100);
        obs.disconnect();
      }
    }, { threshold: 0.2 });

    obs.observe(listRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="aa-section">
      <div className="aa-container">

        {/* Image side */}
        <div className="aa-img-scene">
          <div className="aa-img-wrap">
            <img src={abroadImg} alt="Student studying abroad" className="aa-image" />
            <div className="aa-img-frame"></div>
          </div>
          <div className="aa-stat-pill">
            <div>
              <div className="aa-stat-num">5000+</div>
              <div className="aa-stat-label">Students placed globally</div>
            </div>
          </div>
          {/* <div className="aa-exp-badge">
            <div className="aa-exp-icon">🏆</div> */}
            {/* <div className="aa-exp-text">
              <strong>10+ Years</strong>
              <span>Trusted experience</span>
            </div> */}
          {/* </div> */}
        </div>

        {/* Content side */}
        <div className="aa-content">
          <span className="aa-badge">✦ The Aura Global Advantage</span>
          <h2 className="aa-heading">
            How Aura Global Supports{' '}
            <span>Study-Abroad</span> Education
          </h2>
          <p className="aa-subtext">
            We guide students through every step of their international education journey —
            from university selection to arrival support — with transparency and care.
          </p>
          <ul className="aa-list" ref={listRef}>
            {advantages.map((item, i) => (
              <li className="aa-item" key={i}>
                <span className="aa-check" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5L6.5 12L13 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="aa-item-text">{item}</span>
              </li>
            ))}
          </ul>
          <div className="aa-cta-row" ref={ctaRef}>
            <a href="/contact" className="aa-btn">
              Get Started →
            </a>
            {/* <div className="aa-trust">
              <strong>Free consultation</strong>
              No commitment required
            </div> */}
          </div>
        </div>

      </div>
    </section>
  );
}