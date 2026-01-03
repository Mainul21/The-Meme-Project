import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/Layout/DashboardLayout';
import CreateMeme from './pages/CreateMeme';
import Gallery from './pages/Gallery';
import UploadTemplate from './pages/UploadTemplate';
import { AuthProvider } from './context/AuthContext';
import { MemeProvider } from './context/MemeContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <MemeProvider>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/upload" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/upload" element={<UploadTemplate />} />
              <Route path="/create" element={<CreateMeme />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="*" element={<div className="text-center text-slate-400 mt-20">Page not found</div>} />
            </Routes>
          </DashboardLayout>
        </MemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
