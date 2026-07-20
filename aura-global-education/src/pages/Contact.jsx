// src/pages/Contact.jsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelopeOpenText, FaWhatsapp,
  FaUser, FaPaperPlane, FaEdit, FaArrowRight, FaInstagram, FaGlobe,
} from "react-icons/fa";
import { API } from "../config";
import { COUNTRIES } from "../data/countries";
import "./Contact.css";

/* ── Scroll Reveal ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("con-reveal-visible"); obs.unobserve(el); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, cls = "", delay = 0 }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`con-reveal-block ${cls}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

/* ── Initial form state ── */
const EMPTY = { fullName: "", email: "", phone: "", country: "", message: "" };

export default function Contact() {
  const bgRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { if (bgRef.current) bgRef.current.classList.add("con-bg-zoomed"); }, 100);
    return () => clearTimeout(t);
  }, []);

  const validateField = (name, value) => {
    if (!value.trim() && name !== "country") return "This field is required.";

    switch (name) {
      case "fullName":
        return /^[a-zA-Z\s]{2,50}$/.test(value.trim()) ? "" : "Full name must contain letters only.";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Please include a valid email with an '@' symbol and domain.";
      case "phone":
        return value.replace(/[^0-9]/g, "").length === 10 ? "" : "Phone number must be exactly 10 digits.";
      case "country":
        return value ? "" : "Please select your country from the list.";
      case "message":
        return value.trim().length >= 1 ? "" : "Message cannot be empty.";  // accept anything non-empty
      default:
        return "";
    }
  };

  // Only block invalid keys for name and phone — NOT for message
  const handleKeyDown = (e, type) => {
    const allowedSystemKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter"];
    if (allowedSystemKeys.includes(e.key)) return;

    if (type === "alphaOnly") {
      if (!/^[a-zA-Z\s]$/.test(e.key)) e.preventDefault();
    } else if (type === "numbersOnly") {
      if (!/^[0-9]$/.test(e.key)) e.preventDefault();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const getStatusClass = (fieldName) => {
    const value = form[fieldName];
    const isTouched = touched[fieldName];
    if (!isTouched) return "";
    const currentErr = validateField(fieldName, value);
    if (currentErr) return "con-invalid";
    if (value && !currentErr) return "con-valid";
    return "";
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const localErrors = {};
    const allTouched = {};

    Object.keys(form).forEach((key) => {
      allTouched[key] = true;
      const err = validateField(key, form[key]);
      if (err) localErrors[key] = err;
    });

    setTouched(allTouched);
    setErrors(localErrors);

    if (Object.keys(localErrors).length > 0) {
      toast.error("Please fix the highlighted errors before submitting.");
      return;
    }

    setSending(true);
    try {
      await axios.post(`${API}/inbox`, form);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm(EMPTY);
      setErrors({});
      setTouched({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="con-contact-wrapper">

      {/* ── HERO ── */}
      <section className="con-hero-section">
        <div className="con-hero-bg-image" ref={bgRef} />
        <div className="con-hero-overlay" />
        <div className="con-hero-inner">
          <h1 className="con-main-heading">Contact Us</h1>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="con-content-section con-interactive-block">
        <div className="con-layout-container con-split-grid">

          {/* LEFT: Info cards */}
          <div className="con-details-column">
            <Reveal>
              <span className="con-section-eyebrow">Get In Touch</span>
              <h2 className="con-section-title">We Are Here To <em>Help You</em></h2>
              <div className="con-divider-gold"></div>
              <p className="con-paragraph-text">
                Have questions about global configurations, visa systems, or application processing
                timelines? Drop us a line or visit our hub.
              </p>
            </Reveal>

            <div className="con-infobox-grid">
              <Reveal delay={0.05} cls="con-grid-cell-stretch">
                <div className="con-card">
                  <div className="con-icon-circle"><FaMapMarkerAlt className="con-infobox-icon" /></div>
                  <h3 className="con-title">Our Location</h3>
                  <p className="con-subtitle">Aura Global Education, Main Corporate Hub, Suite 4B, India</p>
                  <div className="con-btnRound con-btnService"><span>View Map</span><FaArrowRight className="con-btn-arrow" /></div>
                </div>
              </Reveal>
              <Reveal delay={0.1} cls="con-grid-cell-stretch">
                <a href="tel:6385585504" className="con-card">
                  <div className="con-icon-circle"><FaPhoneAlt className="con-infobox-icon" /></div>
                  <h3 className="con-title">Call Support</h3>
                  <p className="con-subtitle">+91 63855 85504</p>
                  <div className="con-btnRound con-btnService"><span>Call Now</span><FaArrowRight className="con-btn-arrow" /></div>
                </a>
              </Reveal>
              <Reveal delay={0.15} cls="con-grid-cell-stretch">
                <a href="mailto:Auraglobaledu@gmail.com" className="con-card">
                  <div className="con-icon-circle"><FaEnvelopeOpenText className="con-infobox-icon" /></div>
                  <h3 className="con-title">Email Queries</h3>
                  <p className="con-subtitle">Auraglobaledu@gmail.com</p>
                  <div className="con-btnRound con-btnService"><span>Send Mail</span><FaArrowRight className="con-btn-arrow" /></div>
                </a>
              </Reveal>
              <Reveal delay={0.2} cls="con-grid-cell-stretch">
                <a href="https://wa.me/916385585504" target="_blank" rel="noreferrer" className="con-card">
                  <div className="con-icon-circle"><FaWhatsapp className="con-infobox-icon" /></div>
                  <h3 className="con-title">WhatsApp Connect</h3>
                  <p className="con-subtitle">Chat instantly with advisors</p>
                  <div className="con-btnRound con-btnService"><span>Open Chat</span><FaArrowRight className="con-btn-arrow" /></div>
                </a>
              </Reveal>
              <Reveal delay={0.25} cls="con-grid-cell-stretch">
                <a href="https://www.instagram.com/auraglobaledu?igsh=MWl0aWVzMDZnZjYwdg%3D%3D&utm_source=qr" target="_blank" rel="noreferrer" className="con-card">
                  <div className="con-icon-circle"><FaInstagram className="con-infobox-icon" /></div>
                  <h3 className="con-title">Instagram Feed</h3>
                  <p className="con-subtitle">Follow our community updates</p>
                  <div className="con-btnRound con-btnService"><span>Follow Us</span><FaArrowRight className="con-btn-arrow" /></div>
                </a>
              </Reveal>
            </div>
          </div>

          {/* RIGHT: Contact form */}
          <Reveal delay={0.15} cls="con-form-column-stretch">
            <div className="con-form-box">
              <div className="con-form-header">
                <h3 className="con-form-box-title">Send A Message</h3>
                <p className="con-form-box-subtitle">
                  Fill out your details and our team will follow up within 24 hours.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="con-actual-form" noValidate>

                {/* Name */}
                <div className="con-input-container">
                  <div className={`con-input-group ${getStatusClass("fullName")}`}>
                    <FaUser className="con-field-icon" />
                    <input
                      type="text" name="fullName" placeholder="Full Name"
                      value={form.fullName} onChange={handleChange} onBlur={handleBlur}
                      onKeyDown={(e) => handleKeyDown(e, "alphaOnly")}
                      className="con-form-input"
                    />
                  </div>
                  {touched.fullName && errors.fullName && (
                    <span className="con-input-alert">{errors.fullName}</span>
                  )}
                </div>

                {/* Email */}
                <div className="con-input-container">
                  <div className={`con-input-group ${getStatusClass("email")}`}>
                    <FaEnvelopeOpenText className="con-field-icon" />
                    <input
                      type="email" name="email" placeholder="Email Address"
                      value={form.email} onChange={handleChange} onBlur={handleBlur}
                      className="con-form-input"
                    />
                  </div>
                  {touched.email && errors.email && (
                    <span className="con-input-alert">{errors.email}</span>
                  )}
                </div>

                {/* Phone */}
                <div className="con-input-container">
                  <div className={`con-input-group ${getStatusClass("phone")}`}>
                    <FaPhoneAlt className="con-field-icon" />
                    <input
                      type="tel" name="phone" placeholder="Phone Number"
                      maxLength="10" value={form.phone} onChange={handleChange} onBlur={handleBlur}
                      onKeyDown={(e) => handleKeyDown(e, "numbersOnly")}
                      className="con-form-input"
                    />
                  </div>
                  {touched.phone && errors.phone && (
                    <span className="con-input-alert">{errors.phone}</span>
                  )}
                </div>

                {/* Country */}
                <div className="con-input-container">
                  <div className={`con-input-group ${getStatusClass("country")}`}>
                    <FaGlobe className="con-field-icon" />
                    <select
                      name="country" value={form.country} onChange={handleChange} onBlur={handleBlur}
                      className="con-form-input con-form-select"
                    >
                      <option value="">  Your Country of Interest</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  {touched.country && errors.country && (
                    <span className="con-input-alert">{errors.country}</span>
                  )}
                </div>

                {/* Message — no keyDown restriction, accepts all characters */}
                <div className="con-input-container">
                  <div className={`con-input-group con-textarea-group ${getStatusClass("message")}`}>
                    <FaEdit className="con-field-icon con-textarea-icon" />
                    <textarea
                      name="message" placeholder="Your Message or Consultation Requirements..."
                      rows="6" value={form.message} onChange={handleChange} onBlur={handleBlur}
                      className="con-form-textarea"
                    />
                  </div>
                  {touched.message && errors.message && (
                    <span className="con-input-alert">{errors.message}</span>
                  )}
                </div>

                <button type="submit" className="con-submit-btn" disabled={sending}>
                  <FaPaperPlane className="con-submit-icon" />
                  {sending ? "Sending…" : "Dispatch Message"}
                </button>

              </form>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ── MAP ── */}
      <section className="con-map-section">
        <div className="con-map-frame-wrapper">
          <iframe
            title="Aura Global Education Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.3811652179184!2d76.95856417573998!3d11.010023654796338!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859af2f9737f1%3A0xc4eb7e12739ea516!2sCoimbatore%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
            width="100%" height="480" style={{ border: 0 }}
            allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

    </div>
  );
}
