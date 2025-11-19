import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Menu, X, LogOut } from 'lucide-react';
import NotificationBellComponent from './NotificationBellComponent';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, token } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            📚 TutorConnect
          </Link>

          <div className="hidden md:flex gap-8 items-center">
            {token && user && (
              <>
                <Link to={user.userType === 'tutor' ? '/tutor/requests' : '/tutors/search'} className="text-gray-700 hover:text-blue-600 transition font-medium">
                  {user.userType === 'tutor' ? 'Solicitudes' : 'Buscar Tutores'}
                </Link>
                <Link to={user.userType === 'tutor' ? '/tutor-dashboard' : '/student-dashboard'} className="text-gray-700 hover:text-blue-600 transition font-medium">
                  Dashboard
                </Link>
                <Link to={user.userType === 'tutor' ? '/tutor/sessions' : '/student/sessions'} className="text-gray-700 hover:text-blue-600 transition font-medium">
                  Mis Sesiones
                </Link>
              </>
            )}
            {token && user ? (
              <>
                <NotificationBellComponent />
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600">
                    Hola, <span className="font-semibold">{user.firstName}</span>
                  </span>
                  <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-medium flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition font-medium">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-medium">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 border-t">
            {token && user && (
              <>
                <Link to={user.userType === 'tutor' ? '/tutor/requests' : '/tutors/search'} className="block py-2 text-gray-700 hover:text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
                  {user.userType === 'tutor' ? 'Solicitudes' : 'Buscar Tutores'}
                </Link>
                <Link to={user.userType === 'tutor' ? '/tutor-dashboard' : '/student-dashboard'} className="block py-2 text-gray-700 hover:text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <Link to={user.userType === 'tutor' ? '/tutor/sessions' : '/student/sessions'} className="block py-2 text-gray-700 hover:text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
                  Mis Sesiones
                </Link>
                <div className="py-2 border-t border-gray-200 mt-2">
                  <p className="text-sm text-gray-600 mb-2">Hola, {user.firstName}</p>
                  <button onClick={handleLogout} className="w-full text-left text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Salir
                  </button>
                </div>
              </>
            )}
            {!token && (
              <>
                <Link to="/login" className="block py-2 text-gray-700 hover:text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="block py-2 text-gray-700 hover:text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
