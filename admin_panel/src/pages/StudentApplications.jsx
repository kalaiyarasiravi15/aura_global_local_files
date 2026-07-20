import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  RiCheckDoubleLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiFileList3Line,
  RiGlobalLine,
  RiGraduationCapLine,
  RiMailLine,
  RiPhoneLine,
  RiTimeLine,
  RiUserLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from 'react-icons/ri';
import { API } from '../config';
import { toastConfirm } from '../components/toastConfirm';

import './StudentApplications.css';

const ITEMS_PER_PAGE = 10;

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [preview, setPreview]           = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);

  const token       = localStorage.getItem('adminToken');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/student-applications`, { headers: authHeaders });
      setApplications(data.applications || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApplications(); }, []);

  const markRead = async (id) => {
    try {
      const { data } = await axios.patch(`${API}/student-applications/${id}/read`, {}, { headers: authHeaders });
      setApplications((prev) => prev.map((item) => (item.id === id ? data.application : item)));
      if (preview?.id === id) setPreview(data.application);
      toast.success('Application marked as read.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update application.');
    }
  };

  const deleteApplication = async (id) => {
    toastConfirm('Delete this student application?', async () => {
      try {
        await axios.delete(`${API}/student-applications/${id}`, { headers: authHeaders });
        setApplications((prev) => prev.filter((item) => item.id !== id));
        if (preview?.id === id) setPreview(null);
        toast.success('Application deleted.');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not delete application.');
      }
    });
  };

  const openPreview = async (application) => {
    setPreview(application);
    if (!application.isRead) await markRead(application.id);
  };

  const unreadCount = applications.filter((item) => !item.isRead).length;

  /* ── Pagination ── */
  const indexOfLast    = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst   = indexOfLast - ITEMS_PER_PAGE;
  const currentItems   = applications.slice(indexOfFirst, indexOfLast);
  const totalPages     = Math.ceil(applications.length / ITEMS_PER_PAGE);

  return (
    <section className="applications-main">

      {/* Header */}
      <header className="applications-header">
        <div>
          <p>Aura Global Education</p>
          <h1>Student Applications</h1>
        </div>
        {unreadCount > 0 && (
          <div className="applications-badge">{unreadCount} New Records</div>
        )}
      </header>

      {/* Stats */}
      <section className="applications-stats-grid">
        <div className="app-stat-card">
          <RiFileList3Line />
          <div>
            <span>Total Applications</span>
            <strong>{applications.length.toString().padStart(2, '0')}</strong>
          </div>
        </div>
        <div className="app-stat-card unread">
          <RiMailLine />
          <div>
            <span>Unread Actions</span>
            <strong>{unreadCount.toString().padStart(2, '0')}</strong>
          </div>
        </div>
        <div className="app-stat-card viewed">
          <RiCheckDoubleLine />
          <div>
            <span>Reviewed Entries</span>
            <strong>{(applications.length - unreadCount).toString().padStart(2, '0')}</strong>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="table-view-container">
        <div className="table-responsive">
          <table className="ui-services-table">
            <thead>
              <tr>
                <th>Applicant Details</th>
                <th>Contact Info</th>
                <th>Academic Preferences</th>
                <th>Submission Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="table-empty-state">Loading application data...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-empty-state">No student applications configured yet.</td>
                </tr>
              ) : (
                currentItems.map((app) => (
                  <tr key={app.id} className={!app.isRead ? 'row-unread-highlight' : ''}>

                    <td className="td-service-info">
                      <div className="service-icon-wrapper app-avatar-thumb">
                        <RiUserLine className="fallback-table-icon" />
                      </div>
                      <div className="app-name-block">
                        <span className="service-title-text">{app.fullName}</span>
                        {!app.isRead && <span className="status-unread-tag">New</span>}
                      </div>
                    </td>

                    <td className="td-contact-info">
                      <div className="td-contact-info-inner">
                        <div className="contact-item-link"><RiMailLine /> {app.email}</div>
                        <div className="contact-item-link"><RiPhoneLine /> {app.phone}</div>
                      </div>
                    </td>

                    <td className="td-features">
                      <div className="feature-truncate"><RiGlobalLine /> {app.country?.countryName || '—'}</div>
                      <div className="feature-truncate"><RiGraduationCapLine /> {app.education?.name || '—'}</div>
                      <div className="feature-truncate"><RiTimeLine /> {app.test ? `${app.test.startMonth} - ${app.test.endMonth} ${app.test.year}` : '—'}</div>
                    </td>

                    <td className="td-subtitle">
                      {new Date(app.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>

                    <td className="td-actions">
                      <button type="button" className="table-action-icon view" title="Preview" onClick={() => openPreview(app)}>
                        <RiEyeLine />
                      </button>
                      <button
                        type="button"
                        className={`table-action-icon edit ${app.isRead ? 'action-already-read' : ''}`}
                        title={app.isRead ? 'Already Read' : 'Mark as Read'}
                        onClick={() => !app.isRead && markRead(app.id)}
                        style={{ opacity: app.isRead ? 0.35 : 1, cursor: app.isRead ? 'default' : 'pointer' }}
                      >
                        <RiCheckDoubleLine />
                      </button>
                      <button type="button" className="table-action-icon delete" title="Delete" onClick={() => deleteApplication(app.id)}>
                        <RiDeleteBinLine />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer — matches Services & StudiesAbroad */}
        {totalPages >= 1 && (
          <footer className="app-pagination-footer">
            <span className="app-pagination-text">
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, applications.length)} of {applications.length} applications
            </span>

            <div className="app-pagination-controls">
              <button
                type="button"
                className="app-page-arrow"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                <RiArrowLeftSLine />
              </button>

              <div className="app-page-numbers">
                {Array.from({ length: totalPages }, (_, idx) => (
                  <button
                    key={idx + 1}
                    type="button"
                    className={`app-page-num ${currentPage === idx + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="app-page-arrow"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                <RiArrowRightSLine />
              </button>
            </div>
          </footer>
        )}
      </section>

      {/* Preview Modal */}
      {preview ? (
        <div className="preview-backdrop" role="presentation" onClick={() => setPreview(null)}>
          <article className="preview-modal app-detailed-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setPreview(null)}>
              <RiCloseLine />
            </button>

            <div className="modal-profile-header">
              <div className="modal-avatar-wrapper"><RiUserLine /></div>
              <div>
                <p className="modal-top-label">Student Profile Details</p>
                <h2>{preview.fullName}</h2>
              </div>
            </div>

            <div className="modal-contacts-row">
              <span><RiMailLine /> {preview.email}</span>
              <span><RiPhoneLine /> {preview.phone}</span>
            </div>

            <div className="modal-scroll-desc">
              <strong>Application Details</strong>
              <div className="application-detail-grid">
                <div className="detail-metric-card">
                  <span>Target Country</span>
                  <strong>{preview.country?.countryName || '—'}</strong>
                </div>
                <div className="detail-metric-card">
                  <span>Intake / Test Window</span>
                  <strong>{preview.test ? `${preview.test.startMonth} - ${preview.test.endMonth} ${preview.test.year}` : '—'}</strong>
                </div>
                <div className="detail-metric-card">
                  <span>Current Education</span>
                  <strong>{preview.education?.name || '—'}</strong>
                </div>
                <div className="detail-metric-card">
                  <span>Submitted On</span>
                  <strong>{new Date(preview.createdAt).toLocaleString('en-GB')}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer-actions">
              <span className="modal-index-id">Application Reference ID: #{preview.id}</span>
              <button type="button" className="modal-destructive-btn" onClick={() => deleteApplication(preview.id)}>
                <RiDeleteBinLine /> Delete Record
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
};

export default StudentApplications;