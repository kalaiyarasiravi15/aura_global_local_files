import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

import './AdminLayout.css';

export default function AdminLayout() {
  const { pathname } = useLocation();
  let pageClass = 'sa-page';
  if (pathname.startsWith('/dashboard')) pageClass = 'dashboard-page';
  else if (pathname.startsWith('/services')) pageClass = 'services-page';
  else if (pathname.startsWith('/banners')) pageClass = 'banner-page';
  else if (pathname.startsWith('/inbox')) pageClass = 'inbox-page';
  else if (pathname.startsWith('/student-applications')) pageClass = 'applications-page';
  else if (pathname.startsWith('/exams')) pageClass = 'exams-page';
  else if (pathname.startsWith('/studies-abroad')) pageClass = 'sa-page';

  return (
    <main className={pageClass}>
      <Sidebar />
      <Outlet />
    </main>
  );
}
