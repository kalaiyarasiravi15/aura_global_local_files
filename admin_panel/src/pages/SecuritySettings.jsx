import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiSaveLine,
  RiShieldCheckLine,
  RiMailLine,
} from 'react-icons/ri';
import { API } from '../config';
import './SecuritySettings.css';

export default function SecuritySettings() {
  const [form, setForm] = useState({ email: '', newPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('adminToken');
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const email = localStorage.getItem('adminEmail') || '';
    setForm(prev => ({ ...prev, email }));
  }, []);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.newPassword) {
      toast.warning('Please fill in all fields.');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.warning('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${API}/admin/change-password`,
        form,
        { headers: authHeader }
      );
      toast.success(data.message || 'Password updated successfully.');
      setForm(prev => ({ ...prev, newPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ss-page">
      <div className="ss-header">
        <RiShieldCheckLine className="ss-header-icon" />
        <div>
          <h1>Change Password</h1>
          <p>Update your admin login password</p>
        </div>
      </div>

      <div className="ss-form-card">
        <form onSubmit={handleSubmit} className="ss-form">

          <label className="ss-input-field">
            <RiMailLine className="icon" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={updateField}
              disabled={loading}
              autoComplete="email"
            />
          </label>

          <label className="ss-input-field">
            <RiLockPasswordLine className="icon" />
            <input
              type={showPwd ? 'text' : 'password'}
              name="newPassword"
              placeholder="New password (min 6 characters)"
              value={form.newPassword}
              onChange={updateField}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="ss-toggle"
              onClick={() => setShowPwd(v => !v)}
              tabIndex={-1}
            >
              {showPwd ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </label>

          <button type="submit" className="ss-btn" disabled={loading}>
            <RiSaveLine />
            {loading ? 'Saving…' : 'Update Password'}
          </button>

        </form>
      </div>
    </div>
  );
}
