import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/Layout/DashboardLayout';
import CreateMeme from './pages/CreateMeme';
import Gallery from './pages/Gallery';
import UploadTemplate from './pages/UploadTemplate';
import { MemeProvider } from './context/MemeContext';

function App() {
  return (
    <Router>
      <MemeProvider>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadTemplate />} />
            <Route path="/create" element={<CreateMeme />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="*" element={<div className="text-center text-slate-400 mt-20">Page not found</div>} />
          </Routes>
        </DashboardLayout>
      </MemeProvider>
    </Router>
  );
}

export default App;
