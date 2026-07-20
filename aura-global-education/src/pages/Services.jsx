// src/pages/Services.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoAirplaneSharp } from 'react-icons/io5';
import { API, slugify } from '../config';
import './Services.css';

export default function ServicesPage() {
  const bgRef = useRef(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      if (bgRef.current) bgRef.current.classList.add('srv-bg-zoomed');
    }, 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch(`${API}/services`)
      .then((res) => res.json())
      .then((data) => setServices(data.services || []))
      .catch((err) => console.error('Failed to load services:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="srv-services-page">

      <section className="srv-hero-section">
        <div className="srv-hero-bg-image" ref={bgRef}></div>
        <div className="srv-hero-overlay"></div>
        <div className="srv-hero-inner">
          <h1 className="srv-main-heading">Our Services</h1>
        </div>
      </section>

      <section className="srv-grid-section">
        {loading ? (
          <div className="srv-loading">Loading services...</div>
        ) : (
          <div className="srv-grid">
            {services.map((svc, i) => (
              <article
                className="srv-service-card"
                key={svc.id}
                style={{ '--card-idx': i }}
              >
                <div className="srv-service-card__icon-badge" aria-hidden="true">
                  <div className="srv-service-card__icon-glow" />
                  <IoAirplaneSharp className="srv-service-card__icon" />
                </div>

                <div className="srv-service-card__content">
                  <h2 className="srv-service-card__title">{svc.title}</h2>
                  <p className="srv-service-card__desc">{svc.description}</p>
                </div>

                {/* svc.title is slugified → route becomes /services/university-shortlisting */}
                <Link to={`/services/${slugify(svc.title)}`} className="srv-service-card__btn">
                  <span>{svc.button || 'View Details'}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12,5 19,12 12,19" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
