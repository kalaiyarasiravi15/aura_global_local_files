import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../../config';
import './Hero.css';

/* ════════════════════════════════════════
   LETTER ANIMATION COMPONENT
════════════════════════════════════════ */
function AnimatedText({ text, className, delay = 0 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="hs-letter"
          style={{ animationDelay: `${delay + i * 0.052}s` }}
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

/* ════════════════════════════════════════
   GLOBE CANVAS COMPONENT
════════════════════════════════════════ */
function GlobeCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const SIZE = 360;
    canvas.width  = SIZE;
    canvas.height = SIZE;
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const R  = 145;

    /* -- Location dots -- */
    const LOCATIONS = [
      { lat: 37,  lon: -95,  phase: 0.10 }, // USA
      { lat: 54,  lon: -2,   phase: 1.40 }, // UK
      { lat: 20,  lon: 77,   phase: 2.20 }, // India
      { lat: -25, lon: 133,  phase: 3.10 }, // Australia
      { lat: 51,  lon: 10,   phase: 4.00 }, // Germany
      { lat: 46,  lon: 2,    phase: 5.10 }, // France
      { lat: -36, lon: 175,  phase: 0.80 }, // New Zealand
      { lat: 1,   lon: 103,  phase: 2.80 }, // Singapore
      { lat: 25,  lon: 55,   phase: 3.70 }, // Dubai
      { lat: 36,  lon: 138,  phase: 4.80 }, // Japan
      { lat: 52,  lon: 5,    phase: 1.90 }, // Netherlands
      { lat: -14, lon: -51,  phase: 5.80 }, // Brazil
      { lat: 30,  lon: 31,   phase: 0.40 }, // Egypt
      { lat: 53,  lon: -8,   phase: 2.50 }, // Ireland
      { lat: 4,   lon: 114,  phase: 4.40 }, // Malaysia
    ];

    /* -- Flight routes (index arrays into LOCATIONS) -- */
    const ROUTES = [
      [2, 1, 0, 13, 4, 8, 9, 7],
      [3, 6, 0, 11, 12, 14, 7, 4],
      [2, 8, 1, 10, 0, 3],
      [0, 13, 5, 4, 2, 9],
      [7, 3, 6, 0, 1, 5],
      [2, 7, 14, 9, 0, 13],
      [4, 10, 1, 0, 11, 12],
    ];

    /* -- Animated planes -- */
    const PLANES = [
      { routeIdx: 0, segIdx: 0, t: 0.00, speed: 0.0030, color: '#c9a84c', trail: 'rgba(201,168,76,0.55)' },
      { routeIdx: 1, segIdx: 3, t: 0.40, speed: 0.0024, color: '#e8d48a', trail: 'rgba(232,212,138,0.55)' },
      { routeIdx: 2, segIdx: 1, t: 0.15, speed: 0.0028, color: '#dfc27d', trail: 'rgba(223,194,125,0.55)' },
      { routeIdx: 3, segIdx: 4, t: 0.65, speed: 0.0022, color: '#ffeaa7', trail: 'rgba(255,234,167,0.55)' },
      { routeIdx: 4, segIdx: 2, t: 0.35, speed: 0.0032, color: '#d4af37', trail: 'rgba(212,175,55,0.55)' },
      { routeIdx: 5, segIdx: 0, t: 0.80, speed: 0.0026, color: '#f3e5ab', trail: 'rgba(243,229,171,0.55)' },
      { routeIdx: 6, segIdx: 3, t: 0.50, speed: 0.0029, color: '#e5c158', trail: 'rgba(229,193,88,0.55)' },
    ];

    let rotation = 0;

    /* -- 3D projection helper -- */
    function project(lat, lon, rot) {
      const phi   = (lat * Math.PI) / 180;
      const theta = ((lon + rot) * Math.PI) / 180;
      const x3    = Math.cos(phi) * Math.cos(theta);
      const y3    = Math.sin(phi);
      const z3    = Math.cos(phi) * Math.sin(theta);
      const scale = (z3 + 2) / 3;
      return {
        x: cx + R * x3 * scale,
        y: cy - R * y3 * scale,
        z: z3,
      };
    }

    /* -- Spherical linear interpolation -- */
    function slerp(lat1, lon1, lat2, lon2, t) {
      const toRad = d => (d * Math.PI) / 180;
      const toDeg = r => (r * 180) / Math.PI;
      const p1 = [
        Math.cos(toRad(lat1)) * Math.cos(toRad(lon1)),
        Math.cos(toRad(lat1)) * Math.sin(toRad(lon1)),
        Math.sin(toRad(lat1)),
      ];
      const p2 = [
        Math.cos(toRad(lat2)) * Math.cos(toRad(lon2)),
        Math.cos(toRad(lat2)) * Math.sin(toRad(lon2)),
        Math.sin(toRad(lat2)),
      ];
      const dot   = Math.min(1, p1[0]*p2[0] + p1[1]*p2[1] + p1[2]*p2[2]);
      const omega = Math.acos(dot);
      if (omega < 0.0001) return { lat: lat2, lon: lon2 };
      const sinO  = Math.sin(omega);
      const a     = Math.sin((1 - t) * omega) / sinO;
      const b     = Math.sin(t * omega) / sinO;
      return {
        lat: toDeg(Math.asin(Math.max(-1, Math.min(1, a * p1[2] + b * p2[2])))),
        lon: toDeg(Math.atan2(a * p1[1] + b * p2[1], a * p1[0] + b * p2[0])),
      };
    }

    /* -- Draw dashed trail behind plane -- */
    function drawTrail(plane, rot) {
      const route    = ROUTES[plane.routeIdx];
      const fromLoc  = LOCATIONS[route[plane.segIdx]];
      const toLoc    = LOCATIONS[route[(plane.segIdx + 1) % route.length]];
      const trailLen = 0.22;
      const tStart   = Math.max(0, plane.t - trailLen);
      const STEPS    = 32;

      ctx.beginPath();
      let first = true;
      for (let s = 0; s <= STEPS; s++) {
        const tt  = tStart + (plane.t - tStart) * (s / STEPS);
        const mid = slerp(fromLoc.lat, fromLoc.lon, toLoc.lat, toLoc.lon, tt);
        const p   = project(mid.lat, mid.lon, rot);
        if (p.z > -0.3) {
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        } else {
          first = true;
        }
      }
      ctx.strokeStyle = plane.trail;
      ctx.lineWidth   = 1.1;
      ctx.setLineDash([4, 4]);
      ctx.globalAlpha = 0.48;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    /* -- Draw plane icon -- */
    function drawPlane(plane, rot) {
      const route   = ROUTES[plane.routeIdx];
      const fromLoc = LOCATIONS[route[plane.segIdx]];
      const toLoc   = LOCATIONS[route[(plane.segIdx + 1) % route.length]];

      const pos = slerp(fromLoc.lat, fromLoc.lon, toLoc.lat, toLoc.lon, plane.t);
      const p   = project(pos.lat, pos.lon, rot);
      if (p.z < -0.15) return;

      const tAhead  = Math.min(1, plane.t + 0.04);
      const ahead   = slerp(fromLoc.lat, fromLoc.lon, toLoc.lat, toLoc.lon, tAhead);
      const pa      = project(ahead.lat, ahead.lon, rot);
      const heading = Math.atan2(pa.y - p.y, pa.x - p.x);

      const normZ = (p.z + 1) / 2;
      const depth = 0.4 + normZ * 0.6;
      const s     = (7 + p.z * 3) * depth;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(heading + Math.PI / 2);
      ctx.globalAlpha = Math.max(0.15, normZ);

      /* glow */
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2.5);
      glow.addColorStop(0, 'rgba(201,168,76,0.38)');
      glow.addColorStop(1, 'rgba(201,168,76,0)');
      ctx.beginPath();
      ctx.arc(0, 0, s * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      /* body */
      ctx.fillStyle = plane.color;
      ctx.beginPath();
      ctx.moveTo(0,        -s);
      ctx.lineTo(s * 0.3,   s * 0.5);
      ctx.lineTo(0,         s * 0.15);
      ctx.lineTo(-s * 0.3,  s * 0.5);
      ctx.closePath();
      ctx.fill();

      /* right wing */
      ctx.beginPath();
      ctx.moveTo(s * 0.08,  -s * 0.05);
      ctx.lineTo(s * 1.05,   s * 0.5);
      ctx.lineTo(s * 0.5,    s * 0.35);
      ctx.closePath();
      ctx.fill();

      /* left wing */
      ctx.beginPath();
      ctx.moveTo(-s * 0.08, -s * 0.05);
      ctx.lineTo(-s * 1.05,  s * 0.5);
      ctx.lineTo(-s * 0.5,   s * 0.35);
      ctx.closePath();
      ctx.fill();

      /* tail */
      ctx.beginPath();
      ctx.moveTo(0,          s * 0.15);
      ctx.lineTo(s * 0.4,    s * 0.55);
      ctx.lineTo(-s * 0.4,   s * 0.55);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      ctx.globalAlpha = 1;
    }

    /* -- Draw latitude circle -- */
    function drawLatCircle(lat, steps, rot, color, lineW) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth   = lineW;
      let first = true;
      for (let i = 0; i <= steps; i++) {
        const lon = (i / steps) * 360 - 180;
        const p   = project(lat, lon, rot);
        if (p.z >= -0.15) {
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        } else { first = true; }
      }
      ctx.stroke();
    }

    /* -- Draw meridian -- */
    function drawMeridian(lon, steps, rot, color, lineW) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth   = lineW;
      let first = true;
      for (let i = 0; i <= steps; i++) {
        const lat = (i / steps) * 180 - 90;
        const p   = project(lat, lon, rot);
        if (p.z >= -0.15) {
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        } else { first = true; }
      }
      ctx.stroke();
    }

    /* -- Main render loop -- */
    function render() {
      ctx.clearRect(0, 0, SIZE, SIZE);
      const rot = rotation;

      /* ambient glow */
      const grd = ctx.createRadialGradient(cx, cy, R * 0.75, cx, cy, R * 1.1);
      grd.addColorStop(0, 'rgba(201,168,76,0.09)');
      grd.addColorStop(1, 'rgba(201,168,76,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      /* globe fill */
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(17,26,62,0.38)';
      ctx.fill();

      /* latitude lines */
      [-75,-60,-45,-30,-15,0,15,30,45,60,75].forEach(lat =>
        drawLatCircle(lat, 120, rot,
          lat === 0 ? 'rgba(201,168,76,0.62)' : 'rgba(255,255,255,0.12)',
          lat === 0 ? 1.3 : 0.55
        )
      );

      /* meridians */
      for (let lon = -180; lon < 180; lon += 30) {
        drawMeridian(lon, 120, rot,
          lon % 90 === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.055)',
          lon % 90 === 0 ? 0.65 : 0.32
        );
      }

      /* globe border */
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(201,168,76,0.52)';
      ctx.lineWidth   = 1.4;
      ctx.stroke();

      /* location dots */
      LOCATIONS.forEach(({ lat, lon, phase }, i) => {
        const p = project(lat, lon, rot);
        if (p.z > 0.05) {
          const twinkle = 0.5 + Math.sin(rotation * 0.055 + phase + i * 0.45) * 0.5;
          const alpha   = Math.min(1, (p.z + 0.1) * 1.2) * (0.55 + twinkle * 0.45);
          const dotSize = 2.0 + p.z * 1.2 + twinkle * 0.85;

          /* outer glow */
          ctx.beginPath();
          ctx.arc(p.x, p.y, dotSize * 3.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201,168,76,${(alpha * 0.09).toFixed(2)})`;
          ctx.fill();

          /* mid glow */
          ctx.beginPath();
          ctx.arc(p.x, p.y, dotSize * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${(alpha * 0.07).toFixed(2)})`;
          ctx.fill();

          /* core */
          ctx.beginPath();
          ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201,168,76,${(alpha * 0.94).toFixed(2)})`;
          ctx.fill();
        }
      });

      /* planes */
      PLANES.forEach(plane => drawTrail(plane, rot));
      PLANES.forEach(plane => drawPlane(plane, rot));

      /* advance plane positions */
      PLANES.forEach(plane => {
        plane.t += plane.speed;
        if (plane.t >= 1) {
          plane.t = 0;
          plane.segIdx = (plane.segIdx + 1) % ROUTES[plane.routeIdx].length;
        }
      });

      rotation += 0.25;
      rafRef.current = requestAnimationFrame(render);
    }

    render();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hs-globe__canvas"
      aria-hidden="true"
    />
  );
}

/* ════════════════════════════════════════
   HERO SECTION — MAIN EXPORT
════════════════════════════════════════ */
const AUTO_INTERVAL = 4500;

export default function HeroSection() {
  const [slides, setSlides]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [current, setCurrent]         = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef(null);

  /* -- Resolve image URL -- */
  // const apiRoot  = API.replace('/api', '/uploads');
  const apiRoot = import.meta.env.VITE_IMG_URL || API.replace('/api', '/uploads');
  const imgUrl   = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${apiRoot}${img}`;
  };

  /* -- Fetch slides from API -- */
  useEffect(() => {
    axios.get(`${API}/banners`)
      .then(({ data }) => setSlides(data.banners || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* -- Timer helpers -- */
  const startTimer = useCallback((fn) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(fn, AUTO_INTERVAL);
  }, []);

  const goTo = useCallback((idx) => {
    setCurrent(idx);
    setProgressKey(k => k + 1);
  }, []);

  const nextRef = useRef(null);
  nextRef.current = () => goTo((current + 1) % (slides.length || 1));

  const goNext = useCallback(() => nextRef.current(), []);
  const goPrev = useCallback(
    () => goTo((current - 1 + (slides.length || 1)) % (slides.length || 1)),
    [current, goTo, slides.length]
  );

  useEffect(() => {
    if (!slides.length) return;
    startTimer(goNext);
    return () => clearInterval(timerRef.current);
  }, [goNext, startTimer, slides.length]);

  const pauseTimer  = () => clearInterval(timerRef.current);
  const resumeTimer = () => { if (slides.length) startTimer(goNext); };

  /* -- Empty / loading state -- */
  if (loading || !slides.length) {
    return (
      <section className="hs-section" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.40)', fontSize: '13px', letterSpacing: '1px' }}>
          {loading ? 'Loading…' : ''}
        </span>
      </section>
    );
  }

  return (
    <section
      className="hs-section"
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      aria-label="Hero carousel"
    >

      {/* ═══ SLIDES TRACK ═══ */}
      <div
        className="hs-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => {

          /* ── Title split:
               ≤ 3 words  → all on line 1, no gold line
               4 words    → 2 + 2
               5+ words   → 3 + rest                          */
          const words      = (slide.title || '').trim().split(/\s+/);
          const splitAt    = words.length <= 3 ? words.length : words.length === 4 ? 2 : 3;
          const line1      = words.slice(0, splitAt).join(' ');
          const lineGold   = words.slice(splitAt).join(' ');

          const badge      = slide.subtitle    || '';
          const desc       = slide.description || '';
          const btnLabel   = slide.button      || 'Learn More';
          const btnLink    = slide.buttonLink  || '/contact';
          const bgImage    = imgUrl(slide.image);

          return (
            <div
              key={slide.id}
              className="hs-slide"
              aria-hidden={i !== current}
            >
              {/* Background */}
              <div
                className={`hs-slide__bg${i === current ? ' hs-slide__bg--zoom' : ''}`}
                style={{ backgroundImage: `url('${bgImage}')` }}
              />

              {/* Overlay */}
              <div className="hs-slide__overlay" />

              {/* Decorative bars */}
              <div className="hs-deco" aria-hidden="true">
                <div className="hs-deco__bar hs-deco__bar--primary" />
                <div className="hs-deco__bar hs-deco__bar--secondary" />
                <div className="hs-deco__line" />
              </div>

              {/* Content */}
              <div className="hs-content" key={`content-${current}`}>

                {badge && (
                  <div className="hs-badge">✦&nbsp;{badge}</div>
                )}

                <h1 className="hs-heading" aria-label={slide.title}>
                  <AnimatedText
                    text={line1}
                    className="hs-heading__line"
                    delay={0.14}
                  />
                  {lineGold && (
                    <AnimatedText
                      text={lineGold}
                      className="hs-heading__line hs-heading__line--gold"
                      delay={0.52}
                    />
                  )}
                </h1>

                {desc && (
                  <p className="hs-description">{desc}</p>
                )}

                <div className="hs-cta-wrap">
                  <Link to={btnLink} className="hs-cta-btn">
                    <span className="hs-cta-btn__label">{btnLabel}</span>
                    <svg
                      className="hs-cta-btn__arrow"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="13 6 19 12 13 18" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Globe */}
              <div className="hs-globe" aria-hidden="true">
                <div className="hs-globe__ring hs-globe__ring--1" />
                <div className="hs-globe__ring hs-globe__ring--2" />
                <div className="hs-globe__ring hs-globe__ring--3" />
                <GlobeCanvas />
              </div>

            </div>
          );
        })}
      </div>

      {/* ═══ NAVIGATION ARROWS ═══ */}
      {slides.length > 1 && (
        <>
          <button className="hs-arrow hs-arrow--prev" onClick={goPrev} aria-label="Previous slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="hs-arrow hs-arrow--next" onClick={goNext} aria-label="Next slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* ═══ PAGINATION DOTS ═══ */}
      {slides.length > 1 && (
        <div className="hs-dots" role="tablist">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              className={`hs-dot${i === current ? ' hs-dot--active' : ''}`}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ═══ PROGRESS BAR ═══ */}
      {slides.length > 1 && (
        <div key={`progress-${progressKey}`} className="hs-progress" />
      )}

      {/* ═══ BOTTOM BANNER ═══ */}
      <div className="hs-banner">
        <p className="hs-banner__text" key={`banner-${current}`}>
          <span className="hs-banner__rule" aria-hidden="true" />
          Take Your First Step Towards Your Global Future
          <span className="hs-banner__rule" aria-hidden="true" />
        </p>
      </div>

    </section>
  );
}