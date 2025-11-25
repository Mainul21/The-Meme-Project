import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/Layout/DashboardLayout';
import CreateMeme from './pages/CreateMeme';
import Gallery from './pages/Gallery';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/create" replace />} />
          <Route path="/create" element={<CreateMeme />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="*" element={<div className="text-center text-slate-400 mt-20">Page not found</div>} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;
