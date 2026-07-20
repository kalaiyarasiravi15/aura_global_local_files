import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import axios from 'axios'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.jsx'
import { clearAdminSession } from './config.js'

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      clearAdminSession();
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </BrowserRouter>
  </StrictMode>,
)
