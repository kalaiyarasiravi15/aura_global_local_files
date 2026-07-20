import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  RiCheckDoubleLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiMailLine,
  RiPhoneLine,
  RiTimeLine,
  RiUserLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiGraduationCapLine,
  RiQuestionAnswerLine,
  RiGlobalLine,
  RiFileList3Line,
} from 'react-icons/ri';
import { API } from '../config';
import { toastConfirm } from '../components/toastConfirm';
import './Enquiries.css';

const ITEMS_PER_PAGE = 10;

const Enquiries = () => {
  const [enquiries, setEnquiries]     = useState([]);
  const [loading, setLoading]         = useState(false);
  const [preview, setPreview]         = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const token       = localStorage.getItem('adminToken');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/enquiries`, { headers: authHeaders });
      setEnquiries(data.enquiries || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load enquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEnquiries(); }, []);

  const markRead = async (id) => {
    try {
      const { data } = await axios.patch(`${API}/enquiries/${id}/read`, {}, { headers: authHeaders });
      setEnquiries((prev) => prev.map((item) => (item.id === id ? data.enquiry : item)));
      if (preview?.id === id) setPreview(data.enquiry);
      toast.success('Enquiry marked as read.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update enquiry.');
    }
  };

  const deleteEnquiry = async (id) => {
    toastConfirm('Delete this enquiry?', async () => {
      try {
        await axios.delete(`${API}/enquiries/${id}`, { headers: authHeaders });
        setEnquiries((prev) => prev.filter((item) => item.id !== id));
        if (preview?.id === id) setPreview(null);
        toast.success('Enquiry deleted.');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not delete enquiry.');
      }
    });
  };

  const openPreview = async (enquiry) => {
    setPreview(enquiry);
    if (!enquiry.isRead) await markRead(enquiry.id);
  };

  const unreadCount = enquiries.filter((item) => !item.isRead).length;

  /* ── Pagination ── */
  const indexOfLast  = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentItems = enquiries.slice(indexOfFirst, indexOfLast);
  const totalPages   = Math.ceil(enquiries.length / ITEMS_PER_PAGE);

  return (
    <section className="enquiries-main">

      {/* Header */}
      <header className="enquiries-header">
        <div>
          <p>Aura Global Education</p>
          <h1>Other Country Enquiries</h1>
        </div>
        {unreadCount > 0 && (
          <div className="enquiries-badge">{unreadCount} New Records</div>
        )}
      </header>

      {/* Stats */}
      <section className="enquiries-stats-grid">
        <div className="enq-stat-card">
          <RiFileList3Line />
          <div>
            <span>Total Enquiries</span>
            <strong>{enquiries.length.toString().padStart(2, '0')}</strong>
          </div>
        </div>
        <div className="enq-stat-card unread">
          <RiMailLine />
          <div>
            <span>Unread</span>
            <strong>{unreadCount.toString().padStart(2, '0')}</strong>
          </div>
        </div>
        <div className="enq-stat-card viewed">
          <RiCheckDoubleLine />
          <div>
            <span>Reviewed</span>
            <strong>{(enquiries.length - unreadCount).toString().padStart(2, '0')}</strong>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="enq-table-view-container">
        <div className="enq-table-responsive">
          <table className="enq-ui-table">
            <thead>
              <tr>
                <th>Applicant Details</th>
                <th>Contact Info</th>
                <th>Preferences</th>
                <th>Submission Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="enq-table-empty-state">Loading enquiry data...</td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="enq-table-empty-state">No enquiries received yet.</td>
                </tr>
              ) : (
                currentItems.map((enq) => (
                  <tr key={enq.id} className={!enq.isRead ? 'enq-row-unread' : ''}>

                    <td className="enq-td-info">
                      <div className="enq-avatar-thumb">
                        <RiUserLine className="enq-fallback-icon" />
                      </div>
                      <div className="enq-name-block">
                        <span className="enq-name-text">{enq.fullName}</span>
                        {!enq.isRead && <span className="enq-unread-tag">New</span>}
                      </div>
                    </td>

                    <td className="enq-td-contact">
                      <div className="enq-contact-inner">
                        <div className="enq-contact-item"><RiMailLine /> {enq.email}</div>
                        <div className="enq-contact-item"><RiPhoneLine /> {enq.phone}</div>
                      </div>
                    </td>

                    <td className="enq-td-prefs">
                      <div className="enq-pref-item"><RiTimeLine /> {enq.testMode || '—'}</div>
                      <div className="enq-pref-item"><RiGraduationCapLine /> {enq.education || '—'}</div>
                      {enq.note && (
                        <div className="enq-pref-item enq-note-item">
                          <RiQuestionAnswerLine />
                          <span className="enq-note-text">{enq.note}</span>
                        </div>
                      )}
                    </td>

                    <td className="enq-td-date">
                      {new Date(enq.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>

                    <td className="enq-td-actions">
                      <button
                        type="button"
                        className="enq-action-icon view"
                        title="Preview"
                        onClick={() => openPreview(enq)}
                      >
                        <RiEyeLine />
                      </button>
                      <button
                        type="button"
                        className={`enq-action-icon edit ${enq.isRead ? 'already-read' : ''}`}
                        title={enq.isRead ? 'Already Read' : 'Mark as Read'}
                        onClick={() => !enq.isRead && markRead(enq.id)}
                        style={{ opacity: enq.isRead ? 0.35 : 1, cursor: enq.isRead ? 'default' : 'pointer' }}
                      >
                        <RiCheckDoubleLine />
                      </button>
                      <button
                        type="button"
                        className="enq-action-icon delete"
                        title="Delete"
                        onClick={() => deleteEnquiry(enq.id)}
                      >
                        <RiDeleteBinLine />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages >= 1 && (
          <footer className="enq-pagination-footer">
            <span className="enq-pagination-text">
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, enquiries.length)} of {enquiries.length} enquiries
            </span>
            <div className="enq-pagination-controls">
              <button
                type="button"
                className="enq-page-arrow"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                <RiArrowLeftSLine />
              </button>
              <div className="enq-page-numbers">
                {Array.from({ length: totalPages }, (_, idx) => (
                  <button
                    key={idx + 1}
                    type="button"
                    className={`enq-page-num ${currentPage === idx + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="enq-page-arrow"
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
      {preview && (
        <div className="enq-preview-backdrop" role="presentation" onClick={() => setPreview(null)}>
          <article className="enq-preview-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="enq-modal-close" onClick={() => setPreview(null)}>
              <RiCloseLine />
            </button>

            <div className="enq-modal-profile-header">
              <div className="enq-modal-avatar"><RiUserLine /></div>
              <div>
                <p className="enq-modal-top-label">Enquiry Details</p>
                <h2>{preview.fullName}</h2>
              </div>
            </div>

            <div className="enq-modal-contacts-row">
              <span><RiMailLine /> {preview.email}</span>
              <span><RiPhoneLine /> {preview.phone}</span>
            </div>

            <div className="enq-modal-scroll-desc">
              <strong>Enquiry Information</strong>
              <div className="enq-detail-grid">
                <div className="enq-detail-card">
                  <span>Test Mode / Intake</span>
                  <strong>{preview.testMode || '—'}</strong>
                </div>
                <div className="enq-detail-card">
                  <span>Education Level</span>
                  <strong>{preview.education || '—'}</strong>
                </div>
                <div className="enq-detail-card">
                  <span>Enquiry Type</span>
                  <strong>{preview.note || 'Other countries / quick enquiry'}</strong>
                </div>
                <div className="enq-detail-card">
                  <span>Submitted On</span>
                  <strong>{new Date(preview.createdAt).toLocaleString('en-GB')}</strong>
                </div>
              </div>
            </div>

            <div className="enq-modal-footer-actions">
              <span className="enq-modal-ref-id">Enquiry Reference ID: #{preview.id}</span>
              <button
                type="button"
                className="enq-modal-destructive-btn"
                onClick={() => { deleteEnquiry(preview.id); setPreview(null); }}
              >
                <RiDeleteBinLine /> Delete Record
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
};

export default Enquiries;