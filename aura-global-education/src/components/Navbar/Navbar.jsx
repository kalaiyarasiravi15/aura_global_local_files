import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { API, slugify } from '../../config';
import './Navbar.css';
import logo from '../../assets/aura-global-logo.png';

// Preferred country display order — new countries added from the backend
// will automatically appear after these entries.
const COUNTRY_ORDER = [
  'United Kingdom',
  'Germany',
  'France',
  'Australia',
  'New Zealand',
  'Ireland',
  'Canada',
  'United States',
  'USA',          // alternate name guard
  'Singapore',
];

function sortCountries(countries) {
  return [...countries].sort((a, b) => {
    const countryA = a.countryName || '';
    const countryB = b.countryName || '';
    const ai = COUNTRY_ORDER.findIndex(name =>
      countryA.toLowerCase().includes(name.toLowerCase())
    );
    const bi = COUNTRY_ORDER.findIndex(name =>
      countryB.toLowerCase().includes(name.toLowerCase())
    );
    // Both in preferred list → sort by position
    if (ai !== -1 && bi !== -1) return ai - bi;
    // Only a is in list → a comes first
    if (ai !== -1) return -1;
    // Only b is in list → b comes first
    if (bi !== -1) return 1;
    // Neither in list → keep original backend order (alphabetical fallback)
    return countryA.localeCompare(countryB);
  });
}

export default function Navbar() {
  const [drawerOpen,          setDrawerOpen]          = useState(false);
  const [mobileServicesOpen,  setMobileServicesOpen]  = useState(false);
  const [mobileCountriesOpen, setMobileCountriesOpen] = useState(false);
  const [mobileExamOpen,      setMobileExamOpen]      = useState(false);
  const [logoErr,             setLogoErr]             = useState(false);

  // All dynamic links from API
  const [servicesLinks,  setServicesLinks]  = useState([]);
  const [examLinks,      setExamLinks]      = useState([]);
  const [countryLinks,   setCountryLinks]   = useState([]);

  const navbarRef = useRef(null);
  const navigate  = useNavigate();
  const location  = useLocation();

  // Fetch services
  useEffect(() => {
    fetch(`${API}/services`)
      .then(res => res.json())
      .then(data => {
        const links = (data.services || []).map(svc => ({
          label: svc.title || 'Service',
          path:  `/services/${slugify(svc.title)}`,
        })).reverse();
        setServicesLinks(links);
      })
      .catch(err => console.error('Navbar: failed to load services', err));
  }, []);

  // Fetch exams dynamically from admin panel
  useEffect(() => {
    fetch(`${API}/studies-abroad/exams`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.exams || [];
        setExamLinks(list.map(exam => ({
          label: exam.name || 'Exam Prep',
          path:  `/exam-prep/${slugify(exam.name)}`,
        })));
      })
      .catch(err => console.error('Navbar: failed to load exams', err));
  }, []);

  // Fetch study abroad countries dynamically from admin panel
  useEffect(() => {
    fetch(`${API}/studies-abroad`)
      .then(res => res.json())
      .then(data => {
        const filtered = (data.countries || []).filter(c => (c.tests || []).some(t => t.isActive));
        const sorted = sortCountries(filtered);
        setCountryLinks(sorted.map(c => ({
          label: `Study in ${c.countryName || 'Destination'}`,
          path:  `/study-abroad/${slugify(c.countryName)}`,
          id:    c.id,
        })));
      })
      .catch(err => console.error('Navbar: failed to load countries', err));
  }, []);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setMobileServicesOpen(false);
    setMobileCountriesOpen(false);
    setMobileExamOpen(false);
  };

  const goHome = () => {
    closeDrawer();
    window.dispatchEvent(new Event('aura:go-home'));
    if (location.pathname !== '/') navigate('/');
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        // Dropdowns close via hover CSS
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <>
      <nav className="navbar" ref={navbarRef}>

        {/* ── Logo ── */}
        <button className="navbar__logo-btn" onClick={goHome} aria-label="Go to home">
          <div className="navbar__logo-icon">
            {!logoErr ? (
              <img src={logo} alt="Aura Global Education" onError={() => setLogoErr(true)} />
            ) : (
              <svg width="46" height="46" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,10 18,80 82,80" fill="none" stroke="#1a2558" strokeWidth="9" strokeLinejoin="round"/>
                <line x1="30" y1="63" x2="70" y2="63" stroke="#1a2558" strokeWidth="8"/>
                <path d="M24,59 Q50,38 76,59" fill="none" stroke="#c9a84c" strokeWidth="5" strokeLinecap="round"/>
                <circle cx="50" cy="10" r="5" fill="#c9a84c"/>
              </svg>
            )}
          </div>
          <div className="navbar__logo-text">
            <div className="brand">AURA</div>
            <div className="sub">GLOBAL EDUCATION</div>
          </div>
        </button>

        {/* ── Desktop Nav ── */}
        <div className="navbar__menu">

          <NavLink
            to="/"
            end
            className={({ isActive }) => `navbar__menu-link${isActive ? ' is-active' : ''}`}
            onClick={() => window.dispatchEvent(new Event('aura:go-home'))}
          >
            Home
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) => `navbar__menu-link${isActive ? ' is-active' : ''}`}
          >
            About Us
          </NavLink>

          {/* Services dropdown */}
          {servicesLinks.length > 0 && (
            <div className="navbar__dropdown">
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `navbar__dropdown-trigger${isActive || location.pathname.startsWith('/services') ? ' is-active' : ''}`
                }
              >
                Services
                <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </NavLink>
              <div className="navbar__dropdown-content">
                {servicesLinks.map(item => (
                  <Link key={item.path} to={item.path} className="navbar__dropdown-item">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Study Abroad dropdown */}
          {countryLinks.length > 0 && (
            <div className="navbar__dropdown">
              <NavLink
                to="/study-abroad"
                className={({ isActive }) =>
                  `navbar__dropdown-trigger${isActive || location.pathname.startsWith('/study-abroad') ? ' is-active' : ''}`
                }
              >
                Study Abroad
                <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </NavLink>
              <div className="navbar__dropdown-content">
                {countryLinks.map(country => (
                  <Link key={country.id} to={country.path} className="navbar__dropdown-item">
                    {country.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Exam Prep dropdown */}
          {examLinks.length > 0 && (
            <div className="navbar__dropdown">
              <NavLink
                to="/exam-prep"
                className={({ isActive }) =>
                  `navbar__dropdown-trigger${isActive || location.pathname.startsWith('/exam-prep') ? ' is-active' : ''}`
                }
              >
                Exam Prep
                <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </NavLink>
              <div className="navbar__dropdown-content">
                {examLinks.map(exam => (
                  <Link key={exam.path} to={exam.path} className="navbar__dropdown-item">
                    {exam.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <NavLink
            to="/contact"
            className={({ isActive }) => `navbar__menu-link${isActive ? ' is-active' : ''}`}
          >
            Contact
          </NavLink>
        </div>

        {/* ── Right side ── */}
        <div className="navbar__right">
          <a href="mailto:auraglobaledu@gmail.com" className="navbar__contact-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <polyline points="2,4 12,13 22,4"/>
            </svg>
            auraglobaledu@gmail.com
          </a>
          <a href="tel:6385585504" className="navbar__contact-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            6385585504
          </a>
          <button
            className={`navbar__hamburger${drawerOpen ? ' is-open' : ''}`}
            onClick={() => setDrawerOpen(o => !o)}
            aria-label="Toggle navigation menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {drawerOpen && <div className="drawer-overlay" onClick={closeDrawer} aria-hidden="true" />}

      {/* ── Mobile Drawer ── */}
      <aside className={`drawer${drawerOpen ? ' drawer--open' : ''}`} aria-label="Site navigation">
        <div className="drawer__head">
          <div className="drawer__brand">
            <span className="drawer__brand-name">AURA</span>
            <span className="drawer__brand-sub">Global Education</span>
          </div>
          <button className="drawer__close" onClick={closeDrawer} aria-label="Close menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <nav className="drawer__nav">

          <NavLink
            to="/"
            end
            className={({ isActive }) => `drawer__link${isActive ? ' drawer__link--active' : ''}`}
            onClick={() => { closeDrawer(); window.dispatchEvent(new Event('aura:go-home')); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
              <polyline points="9,21 9,12 15,12 15,21"/>
            </svg>
            Home
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) => `drawer__link${isActive ? ' drawer__link--active' : ''}`}
            onClick={closeDrawer}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            About Us
          </NavLink>

          {/* Services accordion */}
          {servicesLinks.length > 0 && (
            <div className="drawer__accordion">
              <button
                className={`drawer__link drawer__link--accordion${mobileServicesOpen ? ' drawer__link--expanded' : ''}${location.pathname.startsWith('/services') ? ' drawer__link--active' : ''}`}
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                Services
                <span className="drawer__chevron">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </span>
              </button>
              {mobileServicesOpen && (
                <ul className="drawer__sub drawer__sub--list">
                  <li>
                    <Link
                      to="/services"
                      className={`drawer__service-item${location.pathname === '/services' ? ' drawer__service-item--active' : ''}`}
                      onClick={closeDrawer}
                    >
                      <span className="drawer__dot" />All Services
                    </Link>
                  </li>
                  {servicesLinks.map(item => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`drawer__service-item${location.pathname === item.path ? ' drawer__service-item--active' : ''}`}
                        onClick={closeDrawer}
                      >
                        <span className="drawer__dot" />{item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Study Abroad accordion */}
          {countryLinks.length > 0 && (
            <div className="drawer__accordion">
              <button
                className={`drawer__link drawer__link--accordion${mobileCountriesOpen ? ' drawer__link--expanded' : ''}${location.pathname.startsWith('/study-abroad') ? ' drawer__link--active' : ''}`}
                onClick={() => setMobileCountriesOpen(!mobileCountriesOpen)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20"/>
                </svg>
                Study Abroad
                <span className="drawer__chevron">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </span>
              </button>
              {mobileCountriesOpen && (
                <ul className="drawer__sub drawer__sub--list">
                  <li>
                    <Link
                      to="/study-abroad"
                      className={`drawer__service-item${location.pathname === '/study-abroad' ? ' drawer__service-item--active' : ''}`}
                      onClick={closeDrawer}
                    >
                      <span className="drawer__dot" />All Study Abroad
                    </Link>
                  </li>
                  {countryLinks.map(country => (
                    <li key={country.id}>
                      <Link
                        to={country.path}
                        className={`drawer__service-item${location.pathname === country.path ? ' drawer__service-item--active' : ''}`}
                        onClick={closeDrawer}
                      >
                        <span className="drawer__dot" />{country.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Exam Prep accordion */}
          {examLinks.length > 0 && (
            <div className="drawer__accordion">
              <button
                className={`drawer__link drawer__link--accordion${mobileExamOpen ? ' drawer__link--expanded' : ''}${location.pathname.startsWith('/exam-prep') ? ' drawer__link--active' : ''}`}
                onClick={() => setMobileExamOpen(!mobileExamOpen)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                Exam Prep
                <span className="drawer__chevron">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </span>
              </button>
              {mobileExamOpen && (
                <ul className="drawer__sub drawer__sub--list">
                  {examLinks.map(exam => (
                    <li key={exam.path}>
                      <Link
                        to={exam.path}
                        className={`drawer__service-item${location.pathname === exam.path ? ' drawer__service-item--active' : ''}`}
                        onClick={closeDrawer}
                      >
                        <span className="drawer__dot" />{exam.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <NavLink
            to="/contact"
            className={({ isActive }) => `drawer__link drawer__link--cta${isActive ? ' drawer__link--cta-active' : ''}`}
            onClick={closeDrawer}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            Contact Us
          </NavLink>

        </nav>

        <div className="drawer__footer">
          <p className="drawer__footer-label">Get in touch</p>
          <a href="mailto:auraglobaledu@gmail.com" className="drawer__footer-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <polyline points="2,4 12,13 22,4"/>
            </svg>
            auraglobaledu@gmail.com
          </a>
          <a href="tel:6385585504" className="drawer__footer-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            6385585504
          </a>
        </div>
      </aside>
    </>
  );
}
