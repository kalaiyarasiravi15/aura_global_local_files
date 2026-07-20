import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import StudyAbroadPage from './pages/StudyAbroadPage';
import CustomCursor from './components/CustomCursor/CustomCursor';
import StudyAbroad from './components/StudyAbroad/StudyAbroad';
import ScholarshipPopup from './components/ScholarshipPopup/ScholarshipPopup';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';


import ExamPrepPage from './pages/ExamPrep';

function PlaceholderPage({ title }) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      fontFamily: 'var(--font-display)',
      color: 'var(--navy)',
    }}>
      <span style={{ fontSize: '2.2rem', fontWeight: 700 }}>{title}</span>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: '1rem',
        color: 'var(--gold)',
        letterSpacing: '2px',
        textTransform: 'uppercase',
      }}>
        Coming Soon
      </span>
    </div>
  );
}

function ProfilingPage()   { return <PlaceholderPage title="Profiling" />; }
function AdmissionsPage()  { return <PlaceholderPage title="India & Overseas Admissions" />; }

/* Travel sub-pages */
function TravelPage()         { return <PlaceholderPage title="Travel Arrangements" />; }
function FlightsPage()        { return <PlaceholderPage title="Flights Booking" />; }
function HotelsPage()         { return <PlaceholderPage title="Hotels Booking" />; }
function AccommodationPage()  { return <PlaceholderPage title="Abroad Accommodation" />; }

/* Service sub-pages */
function UniversityShortlistingPage() { return <PlaceholderPage title="University Shortlisting" />; }
function ApplicationSubmissionPage()  { return <PlaceholderPage title="Application Submission" />; }
function VisaSupportPage()            { return <PlaceholderPage title="Visa Support" />; }
function SopSupportPage()             { return <PlaceholderPage title="SOP Support" />; }
function DedicatedCounselorPage()     { return <PlaceholderPage title="Dedicated Counselor" />; }

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={4000} />
      <ScrollToTop />
      <CustomCursor />
      <ScholarshipPopup />
      <Navbar />

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        <Route path="/about"   element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Study Abroad */}
        <Route path="/study-abroad"                              element={<StudyAbroadPage />} />
        <Route path="/study-abroad/:countrySlug"                element={<StudyAbroadPage />} />
        <Route path="/study-abroad/:countrySlug/:intakeSlug"    element={<StudyAbroadPage />} />

        {/* Profiling */}
        <Route path="/profiling" element={<ProfilingPage />} />

        {/* Services */}
        <Route path="/services"                                  element={<Services />} />
        <Route path="/services/university-shortlisting"         element={<UniversityShortlistingPage />} />
        <Route path="/services/application-submission"          element={<ApplicationSubmissionPage />} />
        <Route path="/services/visa-support"                    element={<VisaSupportPage />} />
        <Route path="/services/sop-support"                     element={<SopSupportPage />} />
        <Route path="/services/dedicated-counselor"             element={<DedicatedCounselorPage />} />
        <Route path="/services/:serviceSlug"                    element={<ServiceDetail />} />

        
        <Route path="/exam-prep"          element={<ExamPrepPage />} />
        <Route path="/exam-prep/:examId"  element={<ExamPrepPage />} />

        {/* Travel */}
        <Route path="/travel"               element={<TravelPage />} />
        <Route path="/travel/flights"       element={<FlightsPage />} />
        <Route path="/travel/hotels"        element={<HotelsPage />} />
        <Route path="/travel/accommodation" element={<AccommodationPage />} />

        {/* Admissions */}
        <Route path="/admissions" element={<AdmissionsPage />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}