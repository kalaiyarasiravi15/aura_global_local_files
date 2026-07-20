// src/components/Navbar.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  RiSearchLine, RiNotification3Line, RiInboxLine,
  RiCloseLine, RiMailLine, RiQuestionAnswerLine, RiFileList3Line,
  RiUserLine,
} from 'react-icons/ri';
import axios from 'axios';
import { API } from '../config';
import './Navbar.css';

/* Page title map */
const PAGE_TITLES = {
  '/dashboard':            'Dashboard',
  '/services':             'Services',
  '/studies-abroad':       'Studies Abroad',
  '/exams':                'Exams',
  '/banners':              'Banners',
  '/inbox':                'Inbox',
  '/student-applications': 'Student Applications',
  '/enquiries':            'Enquiries',
};

export default function Navbar() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const [search,       setSearch]       = useState('');

  // Unread counts
  const [inboxCount,       setInboxCount]       = useState(0);
  const [enquiryCount,     setEnquiryCount]     = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);

  // Dropdown state (which panel is open: 'inbox' | 'enquiry' | 'application' | null)
  const [openPanel,    setOpenPanel]    = useState(null);
  const [recentMsgs,   setRecentMsgs]   = useState([]);
  const [recentEnqs,   setRecentEnqs]   = useState([]);
  const [recentApps,   setRecentApps]   = useState([]);
  const [loadingPanel, setLoadingPanel] = useState(false);

  const dropRef = useRef(null);
  const token   = localStorage.getItem('adminToken');
  const authHeaders = { Authorization: `Bearer ${token}` };

  /* ── Poll unread counts every 30s ── */
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [inboxRes, enquiryRes, appRes] = await Promise.allSettled([
          axios.get(`${API}/inbox/unread-count`,               { headers: authHeaders }),
          axios.get(`${API}/enquiries/unread-count`,           { headers: authHeaders }),
          axios.get(`${API}/student-applications/unread-count`,{ headers: authHeaders }),
        ]);
        if (inboxRes.status   === 'fulfilled') setInboxCount(inboxRes.value.data.unreadCount || 0);
        if (enquiryRes.status === 'fulfilled') setEnquiryCount(enquiryRes.value.data.unreadCount || 0);
        if (appRes.status     === 'fulfilled') setApplicationCount(appRes.value.data.unreadCount || 0);
      } catch { /* silent */ }
    };
    fetchCounts();
    const iv = setInterval(fetchCounts, 30000);
    return () => clearInterval(iv);
  }, []);

  /* ── Fetch panel data ── */
  const fetchPanelData = async (panel) => {
    setLoadingPanel(true);
    try {
      if (panel === 'inbox') {
        const { data } = await axios.get(`${API}/inbox`, { headers: authHeaders });
        setRecentMsgs((data.messages || []).slice(0, 5));
      } else if (panel === 'enquiry') {
        const { data } = await axios.get(`${API}/enquiries`, { headers: authHeaders });
        setRecentEnqs((data.enquiries || []).slice(0, 5));
      } else if (panel === 'application') {
        const { data } = await axios.get(`${API}/student-applications`, { headers: authHeaders });
        setRecentApps((data.applications || []).slice(0, 5));
      }
    } catch { /* silent */ }
    finally { setLoadingPanel(false); }
  };

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpenPanel(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const togglePanel = (panel) => {
    if (openPanel === panel) { setOpenPanel(null); return; }
    setOpenPanel(panel);
    fetchPanelData(panel);
  };

  const goTo = (path) => { setOpenPanel(null); navigate(path); };

  /* Current page title */
  const pageTitle = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] || 'Admin';
  const adminName = localStorage.getItem('adminName') || 'Admin';
  const adminInitial = adminName.charAt(0).toUpperCase();

  const totalUnread = inboxCount + enquiryCount + applicationCount;

  return (
    <header className="aura-navbar">

      {/* ── LEFT: Page title + Search ── */}
      <div className="aura-nav-left">
        <div className="aura-nav-page-title">{pageTitle}</div>
        <div className="aura-nav-search">
          <RiSearchLine className="aura-nav-search-icon" />
          <input
            type="search"
            className="aura-nav-search-input"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── RIGHT: 3 notification icons + Admin chip ── */}
      <div className="aura-nav-right" ref={dropRef}>

        {/* ── ENQUIRY ICON ── */}
        <div className="aura-notif-wrap">
          <button
            type="button"
            className={`aura-bell-btn${openPanel === 'enquiry' ? ' active' : ''}`}
            onClick={() => togglePanel('enquiry')}
            title="Enquiries"
          >
            <RiQuestionAnswerLine className="aura-bell-icon" />
            {enquiryCount > 0 && (
              <span className="aura-bell-badge">{enquiryCount > 99 ? '99+' : enquiryCount}</span>
            )}
          </button>

          {openPanel === 'enquiry' && (
            <div className="aura-notif-drop">
              <div className="aura-notif-drop-head">
                <RiQuestionAnswerLine />
                <span>Enquiries</span>
                {enquiryCount > 0 && <span className="aura-notif-unread-chip">{enquiryCount} unread</span>}
                <button type="button" className="aura-notif-close" onClick={() => setOpenPanel(null)}>
                  <RiCloseLine />
                </button>
              </div>
              <div className="aura-notif-list">
                {loadingPanel ? (
                  <div className="aura-notif-empty">Loading…</div>
                ) : recentEnqs.length === 0 ? (
                  <div className="aura-notif-empty">
                    <RiQuestionAnswerLine size={28} />
                    <p>No enquiries yet</p>
                  </div>
                ) : (
                  recentEnqs.map(enq => (
                    <div
                      key={enq.id}
                      className={`aura-notif-item${!enq.isRead ? ' unread' : ''}`}
                      onClick={() => goTo('/enquiries')}
                    >
                      <div className="aura-notif-avatar">{enq.fullName?.charAt(0).toUpperCase() || 'E'}</div>
                      <div className="aura-notif-info">
                        <span className="aura-notif-name">
                          {enq.fullName}
                          {!enq.isRead && <span className="aura-notif-dot" />}
                        </span>
                        <span className="aura-notif-meta"><RiMailLine size={11} /> {enq.email}</span>
                        <span className="aura-notif-preview">{enq.note || 'General enquiry'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="aura-notif-footer" onClick={() => goTo('/enquiries')}>
                View all enquiries →
              </div>
            </div>
          )}
        </div>

        {/* ── INBOX ICON ── */}
        <div className="aura-notif-wrap">
          <button
            type="button"
            className={`aura-bell-btn${openPanel === 'inbox' ? ' active' : ''}`}
            onClick={() => togglePanel('inbox')}
            title="Inbox Messages"
          >
            <RiInboxLine className="aura-bell-icon" />
            {inboxCount > 0 && (
              <span className="aura-bell-badge">{inboxCount > 99 ? '99+' : inboxCount}</span>
            )}
          </button>

          {openPanel === 'inbox' && (
            <div className="aura-notif-drop">
              <div className="aura-notif-drop-head">
                <RiInboxLine />
                <span>Inbox Messages</span>
                {inboxCount > 0 && <span className="aura-notif-unread-chip">{inboxCount} unread</span>}
                <button type="button" className="aura-notif-close" onClick={() => setOpenPanel(null)}>
                  <RiCloseLine />
                </button>
              </div>
              <div className="aura-notif-list">
                {loadingPanel ? (
                  <div className="aura-notif-empty">Loading…</div>
                ) : recentMsgs.length === 0 ? (
                  <div className="aura-notif-empty">
                    <RiInboxLine size={28} />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  recentMsgs.map(msg => (
                    <div
                      key={msg.id}
                      className={`aura-notif-item${!msg.isRead ? ' unread' : ''}`}
                      onClick={() => goTo('/inbox')}
                    >
                      <div className="aura-notif-avatar">{msg.fullName?.charAt(0).toUpperCase() || 'U'}</div>
                      <div className="aura-notif-info">
                        <span className="aura-notif-name">
                          {msg.fullName}
                          {!msg.isRead && <span className="aura-notif-dot" />}
                        </span>
                        <span className="aura-notif-meta"><RiMailLine size={11} /> {msg.email}</span>
                        <span className="aura-notif-preview">{msg.message}</span>
                      </div>
                      {msg.country && <span className="aura-notif-country">{msg.country}</span>}
                    </div>
                  ))
                )}
              </div>
              <div className="aura-notif-footer" onClick={() => goTo('/inbox')}>
                View all messages →
              </div>
            </div>
          )}
        </div>

        {/* ── STUDENT APPLICATION ICON ── */}
        <div className="aura-notif-wrap">
          <button
            type="button"
            className={`aura-bell-btn${openPanel === 'application' ? ' active' : ''}`}
            onClick={() => togglePanel('application')}
            title="Student Applications"
          >
            <RiFileList3Line className="aura-bell-icon" />
            {applicationCount > 0 && (
              <span className="aura-bell-badge">{applicationCount > 99 ? '99+' : applicationCount}</span>
            )}
          </button>

          {openPanel === 'application' && (
            <div className="aura-notif-drop aura-notif-drop--right">
              <div className="aura-notif-drop-head">
                <RiFileList3Line />
                <span>Student Applications</span>
                {applicationCount > 0 && <span className="aura-notif-unread-chip">{applicationCount} unread</span>}
                <button type="button" className="aura-notif-close" onClick={() => setOpenPanel(null)}>
                  <RiCloseLine />
                </button>
              </div>
              <div className="aura-notif-list">
                {loadingPanel ? (
                  <div className="aura-notif-empty">Loading…</div>
                ) : recentApps.length === 0 ? (
                  <div className="aura-notif-empty">
                    <RiFileList3Line size={28} />
                    <p>No applications yet</p>
                  </div>
                ) : (
                  recentApps.map(app => (
                    <div
                      key={app.id}
                      className={`aura-notif-item${!app.isRead ? ' unread' : ''}`}
                      onClick={() => goTo('/student-applications')}
                    >
                      <div className="aura-notif-avatar">{app.fullName?.charAt(0).toUpperCase() || 'S'}</div>
                      <div className="aura-notif-info">
                        <span className="aura-notif-name">
                          {app.fullName}
                          {!app.isRead && <span className="aura-notif-dot" />}
                        </span>
                        <span className="aura-notif-meta"><RiMailLine size={11} /> {app.email}</span>
                        <span className="aura-notif-preview">{app.country?.countryName || 'Study Abroad Application'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="aura-notif-footer" onClick={() => goTo('/student-applications')}>
                View all applications →
              </div>
            </div>
          )}
        </div>

        {/* ── Master alert bell (combined) ── */}
        <div className="aura-notif-wrap">
          <button
            type="button"
            className="aura-bell-btn"
            onClick={() => {}}
            title="Total Notifications"
            style={{ pointerEvents: 'none' }}
          >
            <RiNotification3Line className="aura-bell-icon" />
            {totalUnread > 0 && (
              <span className="aura-bell-badge aura-bell-badge--total">{totalUnread > 99 ? '99+' : totalUnread}</span>
            )}
          </button>
        </div>

        {/* Admin chip */}
        <div className="aura-admin-chip">
          <div className="aura-admin-avatar">{adminInitial}</div>
          <span>Admin User</span>
        </div>

      </div>
    </header>
  );
}
