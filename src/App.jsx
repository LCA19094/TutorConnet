import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashboard';
import TutorSearchPage from './pages/TutorSearchPage';
import TutorProfilePage from './pages/TutorProfilePage';
import TutorProfileEditPage from './pages/TutorProfileEditPage';
import StudentProfileEditPage from './pages/StudentProfileEditPage';
import MySessionsPage from './pages/MySessionsPage';
import SessionRequestsPage from './pages/SessionRequestsPage';
import TutorAvailabilityPage from './pages/TutorAvailabilityPage';
import TutorEarningsPage from './pages/TutorEarningsPage';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Store
import { useAuthStore } from './store/authStore';

function App() {
  const { user, token } = useAuthStore();

  useEffect(() => {
    // Token and user are already loaded from localStorage in authStore init
    // No need to do anything here - Zustand handles persistence
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (!token || !user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const AuthRoute = ({ children }) => {
    if (token && user) {
      return <Navigate to={user.userType === 'tutor' ? '/tutor-dashboard' : '/student-dashboard'} replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/login" 
              element={
                <AuthRoute>
                  <LoginPage />
                </AuthRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <AuthRoute>
                  <RegisterPage />
                </AuthRoute>
              } 
            />

            {/* Protected Student Routes */}
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute>
                  {user?.userType === 'student' ? <StudentDashboard /> : <Navigate to="/" />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/profile" 
              element={
                <ProtectedRoute>
                  {user?.userType === 'student' ? <StudentProfileEditPage /> : <Navigate to="/" />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/sessions" 
              element={
                <ProtectedRoute>
                  {user?.userType === 'student' ? <MySessionsPage /> : <Navigate to="/" />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tutor/sessions" 
              element={
                <ProtectedRoute>
                  {user?.userType === 'tutor' ? <MySessionsPage /> : <Navigate to="/" />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tutors/search" 
              element={
                <ProtectedRoute>
                  <TutorSearchPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tutor/:id" 
              element={
                <ProtectedRoute>
                  <TutorProfilePage />
                </ProtectedRoute>
              } 
            />

            {/* Protected Tutor Routes */}
            <Route 
              path="/tutor-dashboard" 
              element={
                <ProtectedRoute>
                  {user?.userType === 'tutor' ? <TutorDashboard /> : <Navigate to="/" />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tutor/requests" 
              element={
                <ProtectedRoute>
                  {user?.userType === 'tutor' ? <SessionRequestsPage /> : <Navigate to="/" />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tutor/profile" 
              element={
                <ProtectedRoute>
                  {user?.userType === 'tutor' ? <TutorProfileEditPage /> : <Navigate to="/" />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tutor/availability" 
              element={
                <ProtectedRoute>
                  {user?.userType === 'tutor' ? <TutorAvailabilityPage /> : <Navigate to="/" />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tutor/earnings" 
              element={
                <ProtectedRoute>
                  {user?.userType === 'tutor' ? <TutorEarningsPage /> : <Navigate to="/" />}
                </ProtectedRoute>
              } 
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
