import React, { useEffect, useRef } from 'react';
import {
  FiCheckCircle,
  FiFileText,
  FiBookOpen,
  FiCreditCard,
  FiBarChart2,
  FiUsers,
} from 'react-icons/fi';
import './OverseasServices.css';

const services = [
  {
    icon: FiCheckCircle,
    title: 'University Shortlisting',
    desc: 'We assist in selecting the best-fit universities based on your academic goals and preferences.',
    num: '01',
  },
  {
    icon: FiFileText,
    title: 'Application Submission',
    desc: 'We streamline the application process, ensuring all required documents are submitted accurately and on time.',
    num: '02',
  },
  {
    icon: FiBookOpen,
    title: 'IELTS Preparation',
    desc: 'We offer specialized IELTS preparation to help you achieve your desired score and meet language proficiency requirements.',
    num: '03',
  },
  {
    icon: FiCreditCard,
    title: 'Visa Support',
    desc: 'We guide you through the visa application process, helping you navigate complexities and increase your chances of approval.',
    num: '04',
  },
  {
    icon: FiBarChart2,
    title: 'SOP Support',
    desc: 'Our experts craft a compelling Statement of Purpose that highlights your strengths and aspirations.',
    num: '05',
  },
  {
    icon: FiUsers,
    title: 'Dedicated Counselor',
    desc: "You'll have a dedicated counselor providing personalized guidance and support throughout your educational journey.",
    num: '06',
  },
];

const headingWords = [
  { text: 'We', highlight: false },
  { text: 'provide', highlight: false },
  { text: 'End-to-End', highlight: false },
  { text: 'overseas', highlight: false },
  { text: 'Education', highlight: true },
  { text: 'solutions', highlight: false },
];

export default function OverseasServices() {
  const wordRefs = useRef([]);
  const descRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observerOptions = { threshold: 0.15 };

    /* --- Heading words observer --- */
    const headingObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          wordRefs.current.forEach((el, i) => {
            if (el) {
              setTimeout(() => el.classList.add('os-word--visible'), i * 70);
            }
          });
          if (descRef.current) {
            setTimeout(() => descRef.current.classList.add('os-desc--visible'), headingWords.length * 70 + 100);
          }
          headingObserver.disconnect();
        }
      });
    }, observerOptions);

    if (wordRefs.current[0]) headingObserver.observe(wordRefs.current[0]);

    /* --- Cards observer --- */
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('os-card--visible');
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    cardRefs.current.forEach((card) => {
      if (card) cardObserver.observe(card);
    });

    return () => {
      headingObserver.disconnect();
      cardObserver.disconnect();
    };
  }, []);

  return (
    <section className="os-section">
      <div className="os-container">

        {/* Header */}
        <div className="os-header">
          <h2 className="os-heading">
            {headingWords.map((word, i) => (
              <span
                key={i}
                ref={(el) => (wordRefs.current[i] = el)}
                className={`os-word${word.highlight ? ' os-word--highlight' : ''}`}
                style={{ transitionDelay: `${i * 0.07}s` }}
              >
                {word.text}
              </span>
            ))}
          </h2>
          <p
            className="os-desc"
            ref={descRef}
            style={{ transitionDelay: `${headingWords.length * 0.07 + 0.1}s` }}
          >
            From university shortlisting to visa support, we offer comprehensive services to make
            your overseas education journey seamless and successful.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="os-grid">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <div
                key={i}
                ref={(el) => (cardRefs.current[i] = el)}
                className="os-card"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <span className="os-card__bar" aria-hidden="true" />
                <span className="os-card__shimmer" aria-hidden="true" />

                <div className="os-card__icon" aria-hidden="true">
                  <Icon />
                </div>
                <h3 className="os-card__title">{service.title}</h3>
                <p className="os-card__desc">{service.desc}</p>
                <span className="os-card__num" aria-hidden="true">{service.num}</span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}