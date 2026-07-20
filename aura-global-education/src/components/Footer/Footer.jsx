import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from 'react-icons/fa';
import { API } from '../../config';
import logo from '../../assets/logo.png';
import './Footer.css';

const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const [services,  setServices]  = useState([]);
  const [countries, setCountries] = useState([]);
  const [exams,     setExams]     = useState([]);

  useEffect(() => {
    fetch(`${API}/services`)
      .then(r => r.json())
      .then(d => setServices((d.services || []).slice().reverse()))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API}/studies-abroad`)
      .then(r => r.json())
      // reverse() use panni order-ah bottom-to-top ah mathiyachu (UK first, Singapore last)
      .then(d => setCountries((d.countries || []).slice().reverse()))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API}/studies-abroad/exams`)
      .then(r => r.json())
      .then(d => setExams(Array.isArray(d) ? d : d.exams || []))
      .catch(() => {});
  }, []);

  return (
    <footer className="aura-footer">
      <div className="aura-footer-main">
        <div className="aura-footer-grid">

          {/* Col 1 — Brand */}
          <div className="aura-footer-col brand-summary">
            <div className="footer-logo-circle">
              <img src={logo} alt="Aura Global Education" className="footer-logo-img" />
            </div>

            <h2 className="aura-footer-logo">
              Aura<span>Global</span>
            </h2>
            <p className="aura-brand-desc">
              Empowering students with expert counselling, seamless admissions, visa support,
              and exam preparation for top institutions worldwide.
            </p>

            {/* Social icons */}
            <div className="aura-social-links">
              <a
                href="https://www.instagram.com/auraglobaledu?igsh=MWl0aWVzMDZnZjYwdg%3D%3D&utm_source=qr"
                target="_blank" rel="noopener noreferrer"
                aria-label="Instagram" className="social-icon-circle"
              ><FaInstagram /></a>
              <a
                href="https://wa.me/916385585504"
                target="_blank" rel="noopener noreferrer"
                aria-label="WhatsApp" className="social-icon-circle"
              ><FaWhatsapp /></a>
              <a
                href="mailto:auraglobaledu@gmail.com"
                aria-label="Email" className="social-icon-circle"
              ><FaEnvelope /></a>
              <a
                href="tel:6385585504"
                aria-label="Phone" className="social-icon-circle"
              ><FaPhoneAlt /></a>
            </div>
          </div>

          {/* Col 2 — Study Destinations */}
          <div className="aura-footer-col">
            <h3 className="aura-col-heading">Study Destinations</h3>
            <ul className="aura-footer-links">
              {countries.length > 0
                ? countries.map(c => (
                    <li key={c.id}>
                      <Link to={`/study-abroad/${slugify(c.countryName)}`}>
                        Study in {c.countryName}
                      </Link>
                    </li>
                  ))
                : (
                    /* Fallback links updated to match the UK-first order */
                    <>
                      <li><Link to="/study-abroad">Study in United Kingdom</Link></li>
                      <li><Link to="/study-abroad">Study in Germany</Link></li>
                      <li><Link to="/study-abroad">Study in France</Link></li>
                      <li><Link to="/study-abroad">Study in Australia</Link></li>
                      <li><Link to="/study-abroad">Study in New Zealand</Link></li>
                      <li><Link to="/study-abroad">Study in Ireland</Link></li>
                      <li><Link to="/study-abroad">Study in Canada</Link></li>
                      <li><Link to="/study-abroad">Study in United States</Link></li>
                      <li><Link to="/study-abroad">Study in Singapore</Link></li>
                    </>
                  )
              }
            </ul>
          </div>

          {/* Col 3 — Our Services */}
          <div className="aura-footer-col">
            <h3 className="aura-col-heading">Our Services</h3>
            <ul className="aura-footer-links">
              {services.length > 0
                ? services.map(svc => (
                    <li key={svc.id}>
                      <Link to={`/services/${slugify(svc.title)}`}>
                        {svc.title}
                      </Link>
                    </li>
                  ))
                : (
                    <>
                      <li><Link to="/services">University Shortlisting</Link></li>
                      <li><Link to="/services">Visa Support</Link></li>
                      <li><Link to="/services">SOP Support</Link></li>
                      <li><Link to="/services">Application Submission</Link></li>
                    </>
                  )
              }
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div className="aura-footer-col contact-block">
            <h3 className="aura-col-heading">Get In Touch</h3>
            <ul className="aura-contact-details">
              <li>
                <span className="contact-icon"><FaPhoneAlt /></span>
                <div className="contact-text">
                  <a href="tel:6385585504">+91 63855 85504</a>
                </div>
              </li>
              <li>
                <span className="contact-icon"><FaWhatsapp /></span>
                <div className="contact-text">
                  <a href="https://wa.me/916385585504" target="_blank" rel="noopener noreferrer">
                    +91 63855 85504
                  </a>
                </div>
              </li>
              <li>
                <span className="contact-icon"><FaEnvelope /></span>
                <div className="contact-text">
                  <a href="mailto:auraglobaledu@gmail.com">auraglobaledu@gmail.com</a>
                </div>
              </li>
              <li>
                <span className="contact-icon"><FaInstagram /></span>
                <div className="contact-text">
                  <a
                    href="https://www.instagram.com/auraglobaledu?igsh=MWl0aWVzMDZnZjYwdg%3D%3D&utm_source=qr"
                    target="_blank" rel="noopener noreferrer"
                  >
                    @auraglobaledu
                  </a>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="aura-footer-bottom">
        <div className="aura-bottom-container">
          <p className="copyright-text">
            &copy; {currentYear} Aura Global Education. All Rights Reserved.
          </p>
          <p className="developer-text">
            Developed by{' '}
            <a href="https://saitechnosolutions.com/" target="_blank" rel="noopener noreferrer">
              Sai Techno Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;