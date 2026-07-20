import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  RiDashboardLine,
  RiStackLine,
  RiGlobalLine,
  RiBookOpenLine,
  RiImageLine,
  RiInboxLine,
  RiFileList3Line,
  RiQuestionLine,
  RiLogoutCircleLine,
  RiShieldCheckLine,
  RiShieldKeyholeLine,
} from 'react-icons/ri';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sa-sidebar">

      {/* ── LOGO: round circle + brand name centered ── */}
      <div className="sa-logo-section">
        <div className="sa-logo-circle">
          <img src={logo} alt="Aura Global Education" className="sa-logo-img" />
        </div>
        <p className="sa-brand-name">Aura Global Education</p>
      </div>

      {/* ── SCROLLABLE NAV ── */}
      <div className="sa-nav-scroll">
        <nav className="sa-nav" aria-label="Admin navigation">
          <NavLink to="/dashboard"><RiDashboardLine /><span>Dashboard</span></NavLink>
          <NavLink to="/banners"><RiImageLine /><span>Banners</span></NavLink>
          <NavLink to="/services"><RiStackLine /><span>Services</span></NavLink>
          <NavLink to="/studies-abroad"><RiGlobalLine /><span>Study Abroad</span></NavLink>
          <NavLink to="/exams"><RiBookOpenLine /><span>Exams</span></NavLink>
          {/* <NavLink to="/banners"><RiImageLine /><span>Banners</span></NavLink> */}
          <NavLink to="/inbox"><RiInboxLine /><span>Contact Messages</span></NavLink>
          <NavLink to="/student-applications"><RiFileList3Line /><span> Student Applications</span></NavLink>
          <NavLink to="/enquiries"><RiQuestionLine /><span>Other Country Enquiries</span></NavLink>
          <NavLink to="/security"><RiShieldKeyholeLine /><span>Change Password</span></NavLink>
        </nav>
      </div>

      {/* ── STICKY FOOTER: always visible ── */}
      <div className="sa-sidebar-footer">
        <div className="sa-admin-badge">
          <div className="sa-admin-avatar"><RiShieldCheckLine /></div>
          <div>
            <p className="sa-admin-name">Admin</p>
            <p className="sa-admin-role">Super Administrator</p>
          </div>
        </div>
        <button className="sa-logout" onClick={logout}>
          <RiLogoutCircleLine /><span>Log out</span>
        </button>
      </div>

    </aside>
  );
}