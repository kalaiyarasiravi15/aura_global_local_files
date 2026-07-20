import { useEffect, useRef } from "react";
import {
  FaGraduationCap, FaNetworkWired, FaLaptopCode, FaChartLine, FaBriefcase,
  FaAward, FaCoins,
  FaUniversity, FaChalkboardTeacher, FaLayerGroup,
  FaShieldAlt, FaGlobeAmericas, FaCertificate, FaIdCard, FaHandsHelping, FaUserCheck,
  FaPhoneAlt, FaEnvelopeOpenText, FaPercentage
} from "react-icons/fa";
import "./About.css";

// Importing assets locally from assets/image
import studentsIntroImg from "../assets/about4.webp";
import counselorIntroImg from "../assets/about5.webp";

/* ── Scroll Reveal Component ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("age-reveal-visible"); obs.unobserve(el); } },
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
    <div ref={ref} className={`age-reveal-block ${cls}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

/* ── DATA CONTEXT REVISIONS ── */
const offers = [
  { Icon: FaGraduationCap,     title: "UG, PG & PhD Programs",     desc: "Multiple disciplines across top-ranked global universities." },
  { Icon: FaNetworkWired,      title: "Global University Network", desc: "Partnerships with leading institutions worldwide." },
  { Icon: FaLaptopCode,        title: "Online & Offline Learning", desc: "Flexible pathways tailored to your lifestyle and goals." },
  { Icon: FaChartLine,         title: "Career-Oriented Advice",    desc: "Guidance aligned with real-world industry needs." },
  { Icon: FaBriefcase,         title: "End-to-End Guidance",       desc: "Full support from application through to admission." },
];

const benefits = [
  { Icon: FaAward,             title: "Personalised Counselling",  text: "Customized path tracking for course and country selection mapping." },
  { Icon: FaCoins,             title: "Scholarships & Funding",    text: "Scholarships, grants, and strategic funding options completely explored." },
];

const modes = [
  { Icon: FaUniversity,        title: "On-Campus Learning",        desc: "Experience true international exposure and standard campus life." },
  { Icon: FaChalkboardTeacher, title: "Online Learning",           desc: "Flexible and highly accessible structure from anywhere in the world." },
  { Icon: FaLayerGroup,        title: "Hybrid Programs",           desc: "The best of both configurations — beautifully blended and balanced." },
];

const reasons = [
  { 
    Icon: FaPercentage, 
    title: "Zero Agency Fees", 
    text: "Premium admissions guidance and counseling with zero service charges for our partner colleges" 
  },
  { 
    Icon: FaShieldAlt, 
    title: "Student-First", 
    text: "Honest, reliable guidance focused entirely on your academic goals" 
  },
  { 
    Icon: FaGlobeAmericas, 
    title: "Global Network", 
    text: "Strong, direct tie-ups with a vast network of international universities" 
  },
  { 
    Icon: FaCertificate, 
    title: "High Success Rate", 
    text: "Proven track record in successful university admissions and visa approvals" 
  },
  { 
    Icon: FaIdCard, 
    title: "Personal Planning", 
    text: "Personalised career profiling and strategic academic roadmap planning" 
  },
  { 
    Icon: FaHandsHelping, 
    title: "Full Support", 
    text: "Continuous assistance from initial shortlisting up to your pre-departure" 
  },
  { 
    Icon: FaUserCheck, 
    title: "Expert Mentors", 
    text: "Dedicated mentors and seasoned counselors guiding your application" 
  },
];

const process = [
  { num: "01", title: "Consultation",         desc: "Understand your goals and preferences through expert sessions." },
  { num: "02", title: "University Selection",  desc: "Choose the right program and country for your future." },
  { num: "03", title: "Application Support",  desc: "End-to-end documentation help with zero stress." },
  { num: "04", title: "Visa Assistance",      desc: "Smooth and guided visa process from start to finish." },
  { num: "05", title: "Pre-Departure Support", desc: "Get fully prepared and confident before your journey." },
];

export default function About() {
  const bgRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => { if (bgRef.current) bgRef.current.classList.add("age-bg-zoomed"); }, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="age-about-wrapper">

      {/* ── HERO SECTION ── */}
      <section className="age-hero-section">
        <div className="age-hero-bg-image" ref={bgRef} />
        <div className="age-hero-overlay" />
        <div className="age-hero-inner">
          <h1 className="age-main-heading">About Us</h1>
        </div>
      </section>

      {/* ── INTRO SECTION ── */}
      <section className="age-content-section age-intro-block">
        <div className="age-layout-container age-intro-grid">
          <Reveal>
            <span className="age-section-eyebrow">Who We Are</span>
            <h2 className="age-section-title">Unlock Your Future with <em>Aura Global Education</em></h2>
            <div className="age-divider-gold"></div>
            <p className="age-paragraph-text">
              Aura Global Education is your all-in-one gateway to world-class education. We connect ambitious
              students to top universities, offering UG, PG, and PhD programs across multiple disciplines.
            </p>
            <p className="age-paragraph-text">
              Whether you dream of studying in the UK, USA, Canada, Australia, Ireland, Singapore, New Zealand, Europe,
              or India, we provide flexible education pathways tailored to your career goals.
            </p>
            <div className="age-tags-wrapper">
              {["UK","USA","Canada","Australia","Ireland","Singapore","New Zealand","Germany","India"].map(c => (
                <span key={c} className="age-tag-item">{c}</span>
              ))}
            </div>
          </Reveal>
          <Reveal cls="age-image-stack-wrapper" delay={0.2}>
            <div className="age-image-main">
              <img src={studentsIntroImg} alt="Students" />
            </div>
            <div className="age-image-secondary">
              <img src={counselorIntroImg} alt="Counselor" />
            </div>
            <div className="age-floating-badge">
              <span className="age-badge-number">5000+</span>
              <span className="age-badge-text">Students<br />Placed</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WHAT WE OFFER SECTION ── */}
      <section className="age-content-section age-offers-block">
        <div className="age-layout-container">
          <Reveal>
            <span className="age-section-eyebrow age-text-center">Programs & Services</span>
            <h2 className="age-section-title age-text-center">What We <em>Offer</em></h2>
            <div className="age-divider-gold age-divider-center"></div>
          </Reveal>
          <div className="age-offers-grid">
            {offers.map((o, i) => (
              <Reveal key={i} delay={i * 0.08} cls="age-grid-cell-stretch">
                <div className="age-ofcard">
                  <div className="age-ofcard-hover-bg"></div>
                  <o.Icon className="age-ofcard-ghost-icon" />
                  <o.Icon className="age-ofcard-primary-icon" />
                  <h3 className="age-ofcard-title">{o.title}</h3>
                  <p className="age-ofcard-description">{o.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS & MODES SECTION ── */}
      <section className="age-content-section age-benefits-block">
        <div className="age-layout-container age-split-grid">
          
          {/* Benefits Column */}
          <Reveal cls="age-flex-column-stretch">
            <span className="age-section-eyebrow">Your Advantage</span>
            <h2 className="age-section-title">Your Future <em>Benefits</em></h2>
            <div className="age-divider-gold"></div>
            <div className="age-bencard-stack">
              {benefits.map((b, i) => (
                <div className="age-bencard" key={i}>
                  <div className="age-bencard-content">
                    <div className="age-bencard-icon-holder"><b.Icon className="age-bencard-icon" /></div>
                    <div className="age-bencard-text-holder">
                      <h3 className="age-bencard-heading">{b.title}</h3>
                      <p className="age-bencard-paragraph">{b.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Modes Column */}
          <Reveal delay={0.2} cls="age-flex-column-stretch">
            <span className="age-section-eyebrow">How You Learn</span>
            <h2 className="age-section-title">Study <em>Modes</em></h2>
            <div className="age-divider-gold"></div>
            <div className="age-modecard-stack">
              {modes.map((m, i) => (
                <div className="age-modecard" key={i}>
                  <div className="age-modecard-content">
                    <div className="age-modecard-icon-holder"><m.Icon className="age-modecard-icon" /></div>
                    <div className="age-modecard-text-holder">
                      <h3 className="age-modecard-heading">{m.title}</h3>
                      <p className="age-modecard-paragraph">{m.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

        </div>
      </section>

      {/* ── WHY CHOOSE US SECTION ── */}
      <section className="age-content-section age-why-us-block">
        <div className="age-layout-container">
          <Reveal>
            <span className="age-section-eyebrow age-text-center">Why Choose Us</span>
            <h2 className="age-section-title age-text-center">Why Aura Global <em>Education?</em></h2>
            <div className="age-divider-gold age-divider-center"></div>
          </Reveal>
          <div className="age-reasons-grid">
            {reasons.map((r, i) => (
              <Reveal key={i} delay={i * 0.07} cls="age-grid-cell-stretch">
                <div className="age-whycard">
                  <div className="age-whycard-icon-badge">
                    <r.Icon className="age-whycard-icon" />
                  </div>
                  <div className="age-whycard-body">
                    <h3 className="age-whycard-title">{r.title}</h3>
                    <p className="age-whycard-text">{r.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS SECTION ── */}
      <section className="age-content-section age-process-block">
        <div className="age-layout-container">
          <Reveal>
            <span className="age-section-eyebrow age-text-center">Our Process</span>
            <h2 className="age-section-title age-text-center">Your Journey <em>Step by Step</em></h2>
            <div className="age-divider-gold age-divider-center"></div>
          </Reveal>
          <div className="age-process-timeline">
            {process.map((p, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="age-timeline-step">
                  <div className="age-timeline-node">
                    <div className="age-timeline-number">{p.num}</div>
                    {i < process.length - 1 && <div className="age-timeline-connector"></div>}
                  </div>
                  <div className="age-timeline-content">
                    <h3 className="age-timeline-title">{p.title}</h3>
                    <p className="age-timeline-desc">{p.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER SECTION ── */}
      {/* <section className="age-cta-banner-section">
        <div className="age-cta-banner-inner">
          <Reveal>
            <h2 className="age-cta-title">Start Your Journey <em>Today</em></h2>
            <p className="age-cta-subtitle">
              Connect with Aura Global Education and explore global education opportunities tailored for your future.
            </p>
            <div className="age-cta-actions">
              <a href="tel:9994817310" className="age-cta-button age-btn-primary">
                <FaPhoneAlt className="age-btn-icon-spacing" /> Call Us
              </a>
              <a href="mailto:auraglobaledu@gmail.com" className="age-cta-button age-btn-secondary">
                <FaEnvelopeOpenText className="age-btn-icon-spacing" /> Email Us
              </a>
            </div>
          </Reveal>
        </div>
      </section> */}
    </div>
  );
}