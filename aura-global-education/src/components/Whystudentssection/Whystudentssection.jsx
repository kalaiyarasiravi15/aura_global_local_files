import './Whystudentssection.css';

const studentBenefits = [
  {
    title: 'Personalized Country Guidance',
    desc: 'Get destination advice based on your course goals, budget, profile, and long-term career plans.',
  },
  {
    title: 'University & Course Shortlisting',
    desc: 'Compare suitable universities and programs with clear guidance on eligibility and admission fit.',
  },
  {
    title: 'Application Support',
    desc: 'Receive step-by-step help with applications, documents, SOP guidance, and admission follow-ups.',
  },
  {
    title: 'Visa & Pre-Departure Help',
    desc: 'Prepare confidently with visa documentation support, interview guidance, and travel readiness.',
  },
];

export default function Whystudentssection() {
  return (
    <section className="wss-section">
      <h2 className="wss-heading">Why Students Choose Aura Global Education</h2>
      <div className="wss-grid">
        {studentBenefits.map((item) => (
          <article className="wss-card" key={item.title}>
            <div className="wss-card-inner">
              <h3 className="wss-card-title">{item.title}</h3>
              <p className="wss-card-desc">{item.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}