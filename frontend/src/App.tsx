
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingControls from './components/FloatingControls';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Work from './pages/public/Work';
import Projects from './pages/public/Projects';
import Skills from './pages/public/Skills';
import Education from './pages/public/Education';
import Certifications from './pages/public/Certifications';
import Testimonials from './pages/public/Testimonials';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';

import { ContactModalProvider } from './context/ContactModalContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <Router>
      <ToastProvider>
        <ThemeProvider>
          <ContactModalProvider>
            <div className="bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<><Navbar /><FloatingControls /><Home /><Footer /></>} />
                <Route path="/about" element={<><Navbar /><FloatingControls /><About /><Footer /></>} />
                <Route path="/work" element={<><Navbar /><FloatingControls /><Work /><Footer /></>} />
                <Route path="/projects" element={<><Navbar /><FloatingControls /><Projects /><Footer /></>} />
                <Route path="/skills" element={<><Navbar /><FloatingControls /><Skills /><Footer /></>} />
                <Route path="/education" element={<><Navbar /><FloatingControls /><Education /><Footer /></>} />
                <Route path="/certifications" element={<><Navbar /><FloatingControls /><Certifications /><Footer /></>} />
                <Route path="/testimonials" element={<><Navbar /><FloatingControls /><Testimonials /><Footer /></>} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<Login />} />
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </ContactModalProvider>
        </ThemeProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
