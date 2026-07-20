import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  RiLockPasswordLine,
  RiLoginCircleLine,
  RiMailLine,
  RiEyeLine,
  RiEyeOffLine,
} from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { API } from '../config';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const storeSession = ({ token, admin }) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminId', admin.id);
    localStorage.setItem('adminName', admin.name || 'Admin');
    localStorage.setItem('adminEmail', admin.email);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      toast.warning('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/admin/login`, {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      storeSession(data);
      toast.success('Login successful. Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message;

      if (status === 404) {
        toast.error('Admin account not found.');
      } else if (status === 401) {
        toast.error('Incorrect password. Please try again.');
      } else if (status === 400) {
        toast.error(serverMsg || 'Email and password are required.');
      } else if (!error.response) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(serverMsg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel" aria-label="Aura Global Education admin access">

        {/* ── LEFT BRAND SIDE ── */}
        <div className="login-brand">
          <div className="login-logo-circle">
            <img src={logo} alt="Aura Global Education" className="login-logo-img" />
          </div>
          <p>Aura Global Education</p>
          <h1>Admin Panel</h1>
          <span>Secure access for managing education enquiries and content.</span>
        </div>

        {/* ── RIGHT FORM SIDE ── */}
        <div className="auth-card">
          <div className="auth-heading">
            <p>Admin Login</p>
            <h2>Sign in to continue</h2>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <label className="input-field">
              <RiMailLine className="icon" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={updateField}
                autoComplete="email"
                required
                disabled={loading}
              />
            </label>

            {/* Password */}
            <label className="input-field">
              <RiLockPasswordLine className="icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={updateField}
                autoComplete="current-password"
                minLength={6}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </label>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              <RiLoginCircleLine />
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>
        </div>

      </section>
    </main>
  );
};

export default Login;