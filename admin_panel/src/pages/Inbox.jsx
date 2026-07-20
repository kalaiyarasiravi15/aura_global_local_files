// src/pages/Inbox.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  RiArrowLeftSLine, RiArrowRightSLine, RiCheckDoubleLine, RiCloseLine,
  RiDeleteBinLine, RiEyeLine, RiInboxLine, RiMailLine, RiPhoneLine,
  RiUserLine, RiMapPin2Line,
} from 'react-icons/ri';
import { API } from '../config';
import { toastConfirm } from '../components/toastConfirm';
import './Inbox.css';

const ITEMS_PER_PAGE = 10;

const Inbox = () => {
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [preview, setPreview]         = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const token       = localStorage.getItem('adminToken');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/inbox`, { headers: authHeaders });
      setMessages(data.messages || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, []);

  const markRead = async (id) => {
    try {
      await axios.patch(`${API}/inbox/${id}/read`, {}, { headers: authHeaders });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
      if (preview?.id === id) setPreview((p) => ({ ...p, isRead: true }));
      toast.success('Marked as read.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update.');
    }
  };

  const deleteMessage = async (id) => {
    toastConfirm('Delete this message?', async () => {
      try {
        await axios.delete(`${API}/inbox/${id}`, { headers: authHeaders });
        toast.success('Message deleted.');
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (preview?.id === id) setPreview(null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not delete.');
      }
    });
  };

  const openPreview = async (msg) => {
    setPreview(msg);
    if (!msg.isRead) await markRead(msg.id);
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  /* ── Pagination ── */
  const indexOfLast  = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentMsgs  = messages.slice(indexOfFirst, indexOfLast);
  const totalPages   = Math.ceil(messages.length / ITEMS_PER_PAGE);

  return (
    <>
      <section className="inbox-main">
        <header className="inbox-header">
          <div>
            <p>Aura Global Education</p>
            <h1>Inbox</h1>
          </div>
          {unreadCount > 0 && (
            <div className="inbox-badge">{unreadCount} unread</div>
          )}
        </header>

        <section className="inbox-content">
          {/* Stats bar */}
          <div className="inbox-stats">
            <div className="stat-card">
              <RiInboxLine />
              <div>
                <span>Total</span>
                <strong>{messages.length.toString().padStart(2, '0')}</strong>
              </div>
            </div>
            <div className="stat-card">
              <RiMailLine />
              <div>
                <span>Unread</span>
                <strong>{unreadCount.toString().padStart(2, '0')}</strong>
              </div>
            </div>
            <div className="stat-card">
              <RiCheckDoubleLine />
              <div>
                <span>Read</span>
                <strong>{(messages.length - unreadCount).toString().padStart(2, '0')}</strong>
              </div>
            </div>
          </div>

          {/* Message list */}
          <div className="inbox-list">
            <div className="list-head">
              <div>
                <p>Messages</p>
                <h2>{messages.length.toString().padStart(2, '0')}</h2>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">Loading messages…</div>
            ) : messages.length === 0 ? (
              <div className="empty-state">No messages yet.</div>
            ) : (
              <>
                <div className="message-table">
                  {currentMsgs.map((msg) => (
                    <article
                      className={`message-row${msg.isRead ? '' : ' unread'}`}
                      key={msg.id}
                    >
                      <div className="msg-avatar"><RiUserLine /></div>

                      <div className="msg-info">
                        <h3>
                          {msg.fullName}
                          {!msg.isRead && <span className="dot" />}
                        </h3>
                        <p className="msg-contact">
                          <RiMailLine />{msg.email}
                          <RiPhoneLine />{msg.phone}
                          {msg.country && <><RiMapPin2Line />{msg.country}</>}
                        </p>
                        <p className="msg-preview">{msg.message}</p>
                      </div>

                      <div className="msg-meta">
                        <span className="msg-date">
                          {new Date(msg.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </span>
                        <div className="row-actions">
                          <button type="button" title="View" onClick={() => openPreview(msg)}>
                            <RiEyeLine />
                          </button>
                          {!msg.isRead && (
                            <button type="button" title="Mark read" onClick={() => markRead(msg.id)}>
                              <RiCheckDoubleLine />
                            </button>
                          )}
                          <button type="button" title="Delete" className="danger" onClick={() => deleteMessage(msg.id)}>
                            <RiDeleteBinLine />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {totalPages >= 1 && (
                  <footer className="inbox-pagination-footer">
                    <span className="inbox-pagination-text">
                      Showing {indexOfFirst + 1} to {Math.min(indexOfLast, messages.length)} of {messages.length} messages
                    </span>
                    <div className="inbox-pagination-controls">
                      <button type="button" className="inbox-page-arrow" disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
                        <RiArrowLeftSLine />
                      </button>
                      <div className="inbox-page-numbers">
                        {Array.from({ length: totalPages }, (_, idx) => (
                          <button key={idx + 1} type="button"
                            className={`inbox-page-num ${currentPage === idx + 1 ? 'active' : ''}`}
                            onClick={() => setCurrentPage(idx + 1)}>
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                      <button type="button" className="inbox-page-arrow" disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>
                        <RiArrowRightSLine />
                      </button>
                    </div>
                  </footer>
                )}
              </>
            )}
          </div>
        </section>
      </section>

      {/* Preview Modal */}
      {preview ? (
        <div className="preview-backdrop" role="presentation" onClick={() => setPreview(null)}>
          <article className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setPreview(null)}>
              <RiCloseLine />
            </button>

            <div className="modal-avatar"><RiUserLine /></div>
            <p className="modal-label">Message from</p>
            <h2>{preview.fullName}</h2>

            <div className="modal-contacts">
              <span><RiMailLine />{preview.email}</span>
              <span><RiPhoneLine />{preview.phone}</span>
              {preview.country && <span><RiMapPin2Line />{preview.country}</span>}
            </div>

            <div className="modal-message">
              <p className="modal-label">Message</p>
              <span>{preview.message}</span>
            </div>

            <div className="modal-footer">
              <span className="modal-date">
                {new Date(preview.createdAt).toLocaleString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
              <button type="button" className="danger-btn" onClick={() => deleteMessage(preview.id)}>
                <RiDeleteBinLine /> Delete
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
};

export default Inbox;