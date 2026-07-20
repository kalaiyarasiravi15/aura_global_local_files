import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { API, API_ROOT, slugify } from '../config';
import './ServiceDetail.css';

export default function ServiceDetail() {
  const { serviceSlug } = useParams();          // matches :serviceSlug in App.jsx
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const imgWrapRef = useRef(null);

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  const imageSrc = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_ROOT}${path}`;
  };

  // Fetch service by slug (e.g. "university-shortlisting")
  useEffect(() => {
    if (!serviceSlug) return;

    setLoading(true);
    setService(null);

    // Try fetching all services and match by slug
    fetch(`${API}/services`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const list = data.services || [];
        const found = list.find((s) => slugify(s.title) === serviceSlug);
        if (found) {
          setService(found);
        } else {
          // Fallback: try fetching by id (legacy numeric URLs)
          return fetch(`${API}/services/${serviceSlug}`)
            .then((r) => r.ok ? r.json() : Promise.reject())
            .then((d) => setService(d.service || null))
            .catch(() => navigate('/services', { replace: true }));
        }
      })
      .catch(() => {
        navigate('/services', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [serviceSlug]);

  // Hero zoom + image entry animation — only after service data is ready
  useEffect(() => {
    if (!service) return;

    window.scrollTo(0, 0);

    // reset hero zoom
    if (heroRef.current) {
      heroRef.current.classList.remove('sd-hero--zoomed');
    }
    const t = setTimeout(() => {
      if (heroRef.current) heroRef.current.classList.add('sd-hero--zoomed');
    }, 80);

    // re-trigger image float entry
    if (imgWrapRef.current) {
      imgWrapRef.current.classList.remove('sd-img-animate');
      void imgWrapRef.current.offsetWidth;
      imgWrapRef.current.classList.add('sd-img-animate');
    }

    return () => clearTimeout(t);
  }, [service]);

  // Normalise features — API returns parsed array from Sequelize getter
  const features = Array.isArray(service?.features)
    ? service.features
    : String(service?.features || '')
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

  if (loading) {
    return (
      <main className="sd-page">
        <div className="sd-loading">Loading...</div>
      </main>
    );
  }

  if (!service) return null;

  return (
    <main className="sd-page">

      {/* ── HERO: bannerImage background + title ── */}
      <section className="sd-hero">
        <div
          className="sd-hero__bg"
          ref={heroRef}
          style={{ backgroundImage: `url(${imageSrc(service.bannerImage)})` }}
        />
        <div className="sd-hero__overlay" />
        <div className="sd-hero__content">
          <h1>{service.title}</h1>
        </div>
      </section>

      {/* ── BODY: left text + right image ── */}
      <section className="sd-body">
        <div className="sd-body__inner">

          {/* LEFT */}
          <div className="sd-left">
            <Link to="/services" className="sd-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12,19 5,12 12,5" />
              </svg>
              Back to Services
            </Link>

            <span className="sd-eyebrow">Service In-Depth</span>
            <h2 className="sd-title">{service.title}</h2>
            <div className="sd-rule" />
            <p className="sd-desc">{service.description}</p>

            {features.length > 0 && (
              <>
                <h3 className="sd-features-heading">Key Features &amp; Offerings</h3>
                <ul className="sd-features">
                  {features.map((feature, i) => (
                    <li
                      key={i}
                      className="sd-feature"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <span className="sd-feature__check" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* <div className="sd-actions">
              {service.buttonLink && service.button ? (
                <Link to={service.buttonLink} className="sd-cta">{service.button}</Link>
              ) : (
                <Link to="/contact" className="sd-cta">Get Started</Link>
              )}
              <Link to="/services" className="sd-back-btn">All Services</Link>
            </div> */}
          </div>

          {/* RIGHT — floating image */}
          <div className="sd-right">
            <div className="sd-img-scene">
              <div className="sd-img-wrap sd-img-animate" ref={imgWrapRef}>
                <img
                  src={imageSrc(service.image)}
                  alt={service.title}
                  className="sd-img"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
