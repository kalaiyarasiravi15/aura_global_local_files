import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  RiBookOpenLine,
  RiContactsBookLine,
  RiFileList3Line,
  RiFlightTakeoffLine,
  RiImageLine,
  RiStackLine,
  RiQuestionAnswerLine,
  RiInboxLine,
  RiEarthLine,
} from 'react-icons/ri';
import { API } from '../config';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('adminName') || 'Admin';

  const [bannerCount,       setBannerCount]       = useState(0);
  const [serviceCount,      setServiceCount]      = useState(0);
  const [inboxCount,        setInboxCount]        = useState(0);
  const [studyAbroadCount,  setStudyAbroadCount]  = useState(0);
  const [examCount,         setExamCount]         = useState(0);
  const [applicationCount,  setApplicationCount]  = useState(0);
  const [enquiryCount,      setEnquiryCount]      = useState(0); // ← NEW

  // Unread alert counts
  const [unreadInbox,        setUnreadInbox]        = useState(0);
  const [unreadEnquiries,    setUnreadEnquiries]    = useState(0);
  const [unreadApplications, setUnreadApplications] = useState(0);

  const token = localStorage.getItem('adminToken');
  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const loadCounts = async () => {
      const [
        bannerRes, serviceRes, inboxRes, studyAbroadRes, examRes,
        applicationRes, enquiryRes,
        unreadInboxRes, unreadEnqRes, unreadAppRes,
      ] = await Promise.allSettled([
        axios.get(`${API}/banners`),
        axios.get(`${API}/services`),
        axios.get(`${API}/inbox`,                { headers: authHeaders }),
        axios.get(`${API}/studies-abroad`),
        axios.get(`${API}/studies-abroad/exams`),
        axios.get(`${API}/student-applications`, { headers: authHeaders }),
        axios.get(`${API}/enquiries`,            { headers: authHeaders }), // ← NEW
        axios.get(`${API}/inbox/unread-count`,                { headers: authHeaders }),
        axios.get(`${API}/enquiries/unread-count`,            { headers: authHeaders }),
        axios.get(`${API}/student-applications/unread-count`, { headers: authHeaders }),
      ]);

      setBannerCount(bannerRes.status         === 'fulfilled' ? bannerRes.value.data.banners?.length       || 0 : 0);
      setServiceCount(serviceRes.status       === 'fulfilled' ? serviceRes.value.data.services?.length     || 0 : 0);
      setInboxCount(inboxRes.status           === 'fulfilled' ? inboxRes.value.data.messages?.length       || 0 : 0);
      setStudyAbroadCount(studyAbroadRes.status === 'fulfilled' ? studyAbroadRes.value.data.countries?.length || 0 : 0);
      setExamCount(
        examRes.status === 'fulfilled'
          ? Array.isArray(examRes.value.data)
            ? examRes.value.data.length
            : examRes.value.data.exams?.length || 0
          : 0
      );
      setApplicationCount(applicationRes.status === 'fulfilled' ? applicationRes.value.data.applications?.length || 0 : 0);

      // ── Enquiry total count ──
      if (enquiryRes.status === 'fulfilled') {
        const d = enquiryRes.value.data;
        setEnquiryCount(
          Array.isArray(d) ? d.length : d.enquiries?.length || d.total || 0
        );
      }

      setUnreadInbox(unreadInboxRes.status         === 'fulfilled' ? unreadInboxRes.value.data.unreadCount || 0 : 0);
      setUnreadEnquiries(unreadEnqRes.status       === 'fulfilled' ? unreadEnqRes.value.data.unreadCount   || 0 : 0);
      setUnreadApplications(unreadAppRes.status    === 'fulfilled' ? unreadAppRes.value.data.unreadCount   || 0 : 0);
    };

    loadCounts();
  }, [token]);

  const cards = useMemo(() => ([
    {
      title: 'Services',
      value: serviceCount.toString().padStart(2, '0'),
      icon: <RiStackLine />,
      tone: 'navy',
      path: '/services',
    },
    {
      title: 'Banner',
      value: bannerCount.toString().padStart(2, '0'),
      icon: <RiImageLine />,
      tone: 'green',
      path: '/banners',
    },
    {
      title: 'Contact Messages',
      value: inboxCount.toString().padStart(2, '0'),
      icon: <RiContactsBookLine />,
      tone: 'rose',
      path: '/inbox',
    },
    {
      title: 'Student Applications',
      value: applicationCount.toString().padStart(2, '0'),
      icon: <RiFileList3Line />,
      tone: 'gold',
      path: '/student-applications',
    },
    {
      title: 'Study Abroad',
      value: studyAbroadCount.toString().padStart(2, '0'),
      icon: <RiFlightTakeoffLine />,
      tone: 'blue',
      path: '/studies-abroad',
    },
    {
      title: 'Exams',
      value: examCount.toString().padStart(2, '0'),
      icon: <RiBookOpenLine />,
      tone: 'violet',
      path: '/exams',
    },
    {
      title: 'Other Country Enquiries',       // ← NEW CARD
      value: enquiryCount.toString().padStart(2, '0'),
      icon: <RiEarthLine />,
      tone: 'teal',
      path: '/enquiries',
    },
  ]), [bannerCount, serviceCount, inboxCount, applicationCount, studyAbroadCount, examCount, enquiryCount]);

  const alertShortcuts = [
    {
      label: 'Enquiries',
      icon: <RiQuestionAnswerLine />,
      count: unreadEnquiries,
      path: '/enquiries',
      color: '#7053a8',
      bg: 'rgba(112,83,168,0.1)',
    },
    {
      label: 'Inbox',
      icon: <RiInboxLine />,
      count: unreadInbox,
      path: '/inbox',
      color: '#b74a5d',
      bg: 'rgba(183,74,93,0.1)',
    },
    {
      label: 'Applications',
      icon: <RiFileList3Line />,
      count: unreadApplications,
      path: '/student-applications',
      color: '#c9a84c',
      bg: 'rgba(201,168,76,0.1)',
    },
  ];

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <img src={logo} alt="Aura Global Education" className="dashboard-logo" />
          <div>
            <p>Aura Global Education</p>
            <h1>Admin Dashboard</h1>
            <span>Welcome, {adminName}</span>
          </div>
        </div>

        {/* ── 3 Alert Icons ── */}
        <div className="dashboard-alerts">
          {alertShortcuts.map((s) => (
            <button
              key={s.label}
              type="button"
              className="dash-alert-btn"
              style={{ '--alert-color': s.color, '--alert-bg': s.bg }}
              onClick={() => navigate(s.path)}
              title={`${s.count} unread ${s.label}`}
            >
              <span className="dash-alert-icon">{s.icon}</span>
              {s.count > 0 && (
                <span className="dash-alert-badge">{s.count > 99 ? '99+' : s.count}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      <section className="dashboard-overview" aria-label="Dashboard modules">
        {cards.map((card) => (
          <article
            className={`dashboard-card ${card.tone} ${card.path ? 'clickable' : ''}`}
            key={card.title}
            onClick={() => card.path && navigate(card.path)}
          >
            <div className="card-icon">{card.icon}</div>
            <div>
              <p>{card.title}</p>
              <h2>{card.value}</h2>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
};

export default Dashboard;