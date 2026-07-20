// src/App.jsx  (updated – add Inbox route)
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Banner    from './pages/Banner';
import Services  from './pages/Services';
import StudiesAbroad from './pages/StudiesAbroad';
import Exams from './pages/Exams';
import Inbox     from './pages/Inbox';
import StudentApplications from './pages/StudentApplications';
import Enquiries from './pages/Enquiries';
import SecuritySettings from './pages/SecuritySettings';
import ProtectedRoute from './ProductedRoutes';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/services" element={<Services />} />
        <Route path="/studies-abroad" element={<StudiesAbroad />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/banners" element={<Banner />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/student-applications" element={<StudentApplications />} />
        <Route path="/enquiries" element={<Enquiries />} />
        <Route path="/security" element={<SecuritySettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
