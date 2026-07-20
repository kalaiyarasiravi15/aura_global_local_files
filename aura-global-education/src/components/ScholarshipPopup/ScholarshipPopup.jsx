import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API } from '../../config';
import './ScholarshipPopup.css';

/* icons as inline SVG to avoid extra dependency */
const IconClose    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconMedal    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>;
const IconGlobe    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>;
const IconRupee    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12M6 8h12M6 13h8a4 4 0 000-8"/><path d="M6 21l7-8"/></svg>;
const IconChevLeft = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevRight= () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconGift     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>;

const POPUP_DELAY_MS  = 1500;   // show after 1.5s
const SESSION_KEY     = 'aura_scholar_dismissed';

export default function ScholarshipPopup() {
  const [scholarships, setScholarships] = useState([]);
  const [visible,      setVisible]      = useState(false);
  const [active,       setActive]       = useState(0);   // which card is shown
  const [animDir,      setAnimDir]      = useState('');  // 'left' | 'right'

  /* fetch only active scholarships */
  useEffect(() => {
    const already = sessionStorage.getItem(SESSION_KEY);
    if (already) return;                      // dismissed this session — skip

    axios.get(`${API}/studies-abroad/scholarships/active`)
      .then(({ data }) => {
        const list = data.scholarships || [];
        if (list.length === 0) return;
        setScholarships(list);
        const t = setTimeout(() => setVisible(true), POPUP_DELAY_MS);
        return () => clearTimeout(t);
      })
      .catch(() => { /* silent — popup is non-critical */ });
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, '1');
  }, []);

  const go = useCallback((dir) => {
    setAnimDir(dir);
    setTimeout(() => {
      setActive(prev =>
        dir === 'right'
          ? (prev + 1) % scholarships.length
          : (prev - 1 + scholarships.length) % scholarships.length
      );
      setAnimDir('');
    }, 220);
  }, [scholarships.length]);

  /* keyboard navigation */
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => {
      if (e.key === 'Escape')      dismiss();
      if (e.key === 'ArrowRight')  go('right');
      if (e.key === 'ArrowLeft')   go('left');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, dismiss, go]);

  if (!visible || scholarships.length === 0) return null;

  const s = scholarships[active];
  const countryName = s.studiesAbroad?.countryName || '';

  return (
    <div className="sp-backdrop" onClick={dismiss} role="dialog" aria-modal="true" aria-label="Scholarship Offer">

      <div className="sp-card" onClick={e => e.stopPropagation()}>

        {/* top accent bar */}
        <div className="sp-accent-bar" />

        {/* close */}
        <button className="sp-close" onClick={dismiss} aria-label="Close">
          <IconClose />
        </button>

        {/* header */}
        <div className="sp-header">
          <div className="sp-icon-ring">
            <IconGift />
          </div>
          <div>
            <p className="sp-eyebrow">🎓 Scholarship Alert</p>
            <h2 className="sp-title">Current Scholarship Offer</h2>
          </div>
        </div>

        {/* card body with slide animation */}
        <div className={`sp-body ${animDir ? `sp-slide-${animDir}` : ''}`} key={active}>

          <h3 className="sp-course">{s.coursename}</h3>

          {countryName && (
            <div className="sp-meta-row">
              <span className="sp-meta-icon"><IconGlobe /></span>
              <span className="sp-meta-text">{countryName}</span>
            </div>
          )}

          {s.amount && (
            <div className="sp-amount-badge">
              <span className="sp-meta-icon"><IconRupee /></span>
              <span>₹{Number(s.amount).toLocaleString('en-IN')} Scholarship</span>
            </div>
          )}

          {s.description && (
            <p className="sp-description">{s.description}</p>
          )}

          <div className="sp-medal-row">
            <IconMedal />
            <span>Limited seats available — Apply now!</span>
          </div>
        </div>

        {/* pagination dots + arrows (only if multiple) */}
        {scholarships.length > 1 && (
          <div className="sp-nav">
            <button className="sp-nav-arrow" onClick={() => go('left')} aria-label="Previous">
              <IconChevLeft />
            </button>

            <div className="sp-dots">
              {scholarships.map((_, i) => (
                <button
                  key={i}
                  className={`sp-dot ${i === active ? 'sp-dot--active' : ''}`}
                  onClick={() => { setAnimDir(i > active ? 'right' : 'left'); setTimeout(() => { setActive(i); setAnimDir(''); }, 220); }}
                  aria-label={`Scholarship ${i + 1}`}
                />
              ))}
            </div>

            <button className="sp-nav-arrow" onClick={() => go('right')} aria-label="Next">
              <IconChevRight />
            </button>
          </div>
        )}

        {/* counter */}
        {scholarships.length > 1 && (
          <p className="sp-counter">{active + 1} of {scholarships.length} offers</p>
        )}

        {/* CTA */}
        <div className="sp-footer">
          <button className="sp-cta" onClick={dismiss}>
            Explore Study Abroad
          </button>
          <button className="sp-dismiss-link" onClick={dismiss}>
            Maybe later
          </button>
        </div>

      </div>
    </div>
  );
}
