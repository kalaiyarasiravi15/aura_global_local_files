import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FiGift, FiFileText, FiUser, FiPhone, FiMail, FiArrowRight,
  FiShield, FiDollarSign, FiMessageSquare, FiGlobe,
} from 'react-icons/fi';
import { API } from '../../config';
import { COUNTRIES } from '../../data/countries';
import './Consultationform.css';

const cards = [
  {
    icon: <FiGift />,
    title: 'Expert Consultation',
    desc: 'Receive comprehensive profile counseling, strategic university shortlisting, and career roadmap planning tailored to your global goals.',
  },
  {
    icon: <FiFileText />,
    title: 'Transparent Visa & SOP Guidance',
    desc: 'End-to-end student visa application assistance and dedicated SOP reviews. We keep our processes fully open and clear at every single step.',
  },
  {
    icon: <FiDollarSign />,
    title: 'Zero Service Fees for Partner Colleges',
    desc: 'From processing your applications to final pre-departure briefings, receive individualized support without paying service charges for our partner institutions.',
  },
];

const EMPTY = { name: '', phone: '', email: '', country: '', message: '' };

export default function AuraSection() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const hlineRef   = useRef(null);
  const hsubRef    = useRef(null);
  const cardRefs   = useRef([]);
  const iconRefs   = useRef([]);
  const formRef    = useRef(null);
  const btnRef     = useRef(null);

  /* ── Scroll Reveal ── */
  useEffect(() => {
    const targets = [
      { el: headingRef.current, cls: ['reveal', 'from-up'] },
      { el: hlineRef.current,   cls: ['reveal'] },
      { el: hsubRef.current,    cls: ['reveal', 'from-up'] },
      ...cardRefs.current.map(el => ({ el, cls: ['reveal', 'from-left'] })),
      { el: formRef.current,    cls: ['reveal', 'from-right'] },
    ];
    targets.forEach(({ el, cls }) => { if (el) cls.forEach(c => el.classList.add(c)); });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          iconRefs.current.forEach((ic, i) => {
            if (ic) setTimeout(() => ic.classList.add('icon-visible'), 300 + i * 150);
          });
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(({ el }) => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  /* ── Particle Burst ── */
  function spawnParticles() {
    const sec = sectionRef.current;
    const btn = btnRef.current;
    if (!sec || !btn) return;
    const bRect = btn.getBoundingClientRect();
    const sRect = sec.getBoundingClientRect();
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('div');
      p.className = 'as-particle';
      const px = (bRect.left - sRect.left) + Math.random() * bRect.width;
      const py = bRect.top - sRect.top;
      p.style.cssText = `left:${px}px;top:${py}px;--dx:${(Math.random() - 0.5) * 70}px;animation:asParticleUp ${0.55 + Math.random() * 0.5}s ease ${Math.random() * 0.3}s both`;
      sec.appendChild(p);
      setTimeout(() => p.remove(), 1600);
    }
  }

  /* ── Inline Syntax Validators ── */
  const isValidName    = (val) => val.trim().length > 0 && /^[A-Za-z\s]+$/.test(val);
  const isValidPhone   = (val) => /^\d{10}$/.test(val);
  const isValidEmail   = (val) => val.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isValidMessage = (val) => val.trim().length > 0;   // accept anything non-empty

  /* ── Get Input Class Designation ── */
  const getFieldClass = (id, val) => {
    if (!touched[id] && !errors[id]) return 'as-field-input';

    let valid = false;
    if (id === 'name')    valid = isValidName(val);
    else if (id === 'phone')   valid = isValidPhone(val);
    else if (id === 'email')   valid = isValidEmail(val);
    else if (id === 'message') valid = isValidMessage(val);
    else if (id === 'country') valid = val !== '';

    return `as-field-input ${valid ? 'as-field-success' : 'as-field-error'}`;
  };

  /* ── Master Validation Action ── */
  function validate() {
    const errs = {};
    if (!isValidName(form.name))    errs.name    = "Full name must contain letters only.";
    if (!isValidPhone(form.phone))  errs.phone   = "Phone number must be exactly 10 digits.";
    if (!isValidEmail(form.email))  errs.email   = "Please enter a valid email address containing '@'.";
    if (!form.country)              errs.country = "Please select your destination country.";
    if (!isValidMessage(form.message)) errs.message = "Message cannot be empty.";
    return errs;
  }

  /* ── Handlers ── */
  const handleChange = (id, value) => {
    // Keystroke filter for Name (only letters and spaces)
    if (id === 'name') {
      const sanitized = value.replace(/[^A-Za-z\s]/g, '');
      setForm(prev => ({ ...prev, [id]: sanitized }));
      return;
    }

    // Keystroke filter for Phone (only digits, max 10)
    if (id === 'phone') {
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setForm(prev => ({ ...prev, [id]: sanitized }));
      return;
    }

    // Message: no filtering — accept all characters
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleBlur = (id) => {
    setTouched(prev => ({ ...prev, [id]: true }));
  };

  /* ── Submit ── */
  async function handleSubmit() {
    setTouched({ name: true, phone: true, email: true, country: true, message: true });

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fill out the form fields correctly.");
      return;
    }

    setErrors({});
    setLoading(true);
    spawnParticles();

    try {
      await axios.post(`${API}/inbox`, {
        fullName: form.name.trim(),
        phone:    form.phone.trim(),
        email:    form.email.trim(),
        country:  form.country.trim() || null,
        message:  form.message.trim(),
      });
      toast.success("Session booked! We'll reach out to you shortly.");
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="as-section" ref={sectionRef}>
      <div className="as-glow-tl" aria-hidden="true" />
      <div className="as-glow-br" aria-hidden="true" />

      {/* ── HEADING ── */}
      <div className="as-heading">
        <h2 className="as-title" ref={headingRef}>
          Your Global Education, Built on <em>Honest & Reliable</em> Guidance
        </h2>
        <div className="as-hline" ref={hlineRef} />
        <p className="as-hsub" ref={hsubRef}>
          Get premium university shortlisting, transparent application cycles, and dedicated visa assistance. Enjoy zero service charges for applications to our partner colleges.
        </p>
      </div>

      {/* ── GRID ── */}
      <div className="as-grid">

        {/* LEFT CARDS */}
        <div className="as-cards-col">
          {cards.map((card, i) => (
            <div
              className="as-card" key={i}
              ref={el => (cardRefs.current[i] = el)}
              style={{ transitionDelay: `${0.1 + i * 0.12}s` }}
            >
              <div className="as-icon-wrap" ref={el => (iconRefs.current[i] = el)} aria-hidden="true">
                {card.icon}
              </div>
              <div className="as-card-inner-content">
                <div className="as-card-title">{card.title}</div>
                <p className="as-card-desc">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT FORM */}
        <div className="as-form-panel" ref={formRef} style={{ transitionDelay: '0.18s' }}>
          {!submitted ? (
            <>
              <div className="as-form-head">
                <h3 className="as-form-mini-title">Book Your <em>Consultation</em></h3>
                <p className="as-form-mini-desc">
                  Fill out the form below to set up a personalized planning session with our experienced study abroad mentors.
                </p>
              </div>

              {/* Name */}
              <div className="as-field-group">
                <label className="as-field-label" htmlFor="as-name">Full Name</label>
                <div className="as-field-inner">
                  <span className="as-field-icon" aria-hidden="true"><FiUser /></span>
                  <input
                    className={getFieldClass('name', form.name)}
                    id="as-name" type="text" autoComplete="name" placeholder="e.g. John Doe"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                  />
                  <div className="as-focus-bar" />
                </div>
                {(touched.name || errors.name) && !isValidName(form.name) && (
                  <span className="as-alert-msg">{errors.name || "Letters only allowed."}</span>
                )}
              </div>

              {/* Phone */}
              <div className="as-field-group">
                <label className="as-field-label" htmlFor="as-phone">Phone Number</label>
                <div className="as-field-inner">
                  <span className="as-field-icon" aria-hidden="true"><FiPhone /></span>
                  <input
                    className={getFieldClass('phone', form.phone)}
                    id="as-phone" type="tel" autoComplete="tel" placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                  />
                  <div className="as-focus-bar" />
                </div>
                {(touched.phone || errors.phone) && !isValidPhone(form.phone) && (
                  <span className="as-alert-msg">{errors.phone || "Must be 10 numeric digits."}</span>
                )}
              </div>

              {/* Email */}
              <div className="as-field-group">
                <label className="as-field-label" htmlFor="as-email">Email Address</label>
                <div className="as-field-inner">
                  <span className="as-field-icon" aria-hidden="true"><FiMail /></span>
                  <input
                    className={getFieldClass('email', form.email)}
                    id="as-email" type="email" autoComplete="email" placeholder="e.g. john@example.com"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                  />
                  <div className="as-focus-bar" />
                </div>
                {(touched.email || errors.email) && !isValidEmail(form.email) && (
                  <span className="as-alert-msg">{errors.email || "Requires '@' and standard domain syntax."}</span>
                )}
              </div>

              {/* Country */}
              <div className="as-field-group">
                <label className="as-field-label" htmlFor="as-country">Country of Interest</label>
                <div className="as-field-inner">
                  <span className="as-field-icon" aria-hidden="true"><FiGlobe /></span>
                  <select
                    className={getFieldClass('country', form.country)}
                    id="as-country"
                    value={form.country}
                    onChange={e => handleChange('country', e.target.value)}
                    onBlur={() => handleBlur('country')}
                  >
                    <option value="">Select Your Destination</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="as-focus-bar" />
                </div>
                {(touched.country || errors.country) && !form.country && (
                  <span className="as-alert-msg">{errors.country}</span>
                )}
              </div>

              {/* Message */}
              <div className="as-field-group">
                <label className="as-field-label" htmlFor="as-message">Your Message</label>
                <div className="as-field-inner as-textarea-inner">
                  <span className="as-field-icon as-textarea-icon" aria-hidden="true">
                    <FiMessageSquare />
                  </span>
                  <textarea
                    className={getFieldClass('message', form.message)}
                    id="as-message" rows={4}
                    placeholder="Tell us about your study abroad goals or ask any questions..."
                    value={form.message}
                    onChange={e => handleChange('message', e.target.value)}
                    onBlur={() => handleBlur('message')}
                  />
                  <div className="as-focus-bar" />
                </div>
                {(touched.message || errors.message) && !isValidMessage(form.message) && (
                  <span className="as-alert-msg">{errors.message || "Message cannot be empty."}</span>
                )}
              </div>

              <button
                className={`as-submit-btn${loading ? ' as-loading' : ''}`}
                ref={btnRef} disabled={loading} onClick={handleSubmit} type="button"
              >
                <span className="as-btn-shine" aria-hidden="true" />
                {loading ? (
                  <span className="as-dots" aria-label="Submitting">
                    <span className="as-bd" /><span className="as-bd" /><span className="as-bd" />
                  </span>
                ) : (
                  <>
                    <span>Book Consultation Now</span>
                    <FiArrowRight className="as-btn-arrow" aria-hidden="true" />
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="as-success" role="status" aria-live="polite">
              <div className="as-check-wrap" aria-hidden="true">
                <div className="as-ring" />
                <div className="as-check-circ">
                  <svg className="as-check-svg" viewBox="0 0 30 30">
                    <path className="as-check-path" d="M6 15 L13 22 L25 9" />
                  </svg>
                </div>
                <span className="as-star as-star-a">✦</span>
                <span className="as-star as-star-b">✦</span>
              </div>
              <div className="as-suc-title">Session <span>Reserved!</span></div>
              <p className="as-suc-sub">
                Thank you, <strong>{form.name || 'there'}</strong>. An expert advisor will reach
                out at <strong>{form.phone}</strong> or <strong>{form.email}</strong> shortly
                to help map out your admissions plan.
              </p>
              <div className="as-suc-tag">
                <FiShield aria-hidden="true" />
                Transparent Advice. Clear Terms.
              </div>
              <button
                className="as-home-btn"
                onClick={() => {
                  window.dispatchEvent(new Event('aura:go-home'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                type="button"
              >
                Go to Home
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}