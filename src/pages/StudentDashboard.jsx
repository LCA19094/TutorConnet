import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Star, AlertCircle, Loader, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    completedSessions: 0,
    totalSpent: 0,
    avgTutorRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh cada 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Obtener sesiones
      let sessionsData = [];
      try {
        const sessionsRes = await api.get('/sessions');
        sessionsData = sessionsRes.data?.data || [];
      } catch (sessionsErr) {
        console.warn('Error fetching sessions:', sessionsErr?.response?.data || sessionsErr.message);
        sessionsData = [];
      }
      setSessions(sessionsData);

      // Obtener notificaciones
      try {
        const notificationsRes = await api.get('/notifications?limit=5');
        setNotifications(notificationsRes.data?.data || []);
      } catch (nErr) {
        console.warn('Warning: notifications fetch failed', nErr?.response?.data || nErr.message);
        setNotifications([]);
      }

      // Calcular estadísticas
      const upcoming = sessionsData.filter(s => s.status === 'confirmed' || s.status === 'pending').length || 0;
      const completed = sessionsData.filter(s => s.status === 'completed').length || 0;
      const totalSpent = sessionsData.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0) || 0;

      setStats({
        upcomingSessions: upcoming,
        completedSessions: completed,
        totalSpent: totalSpent.toFixed(2),
        avgTutorRating: 4.8
      });
      
      setError('');
    } catch (err) {
      console.error('Error cargando dashboard:', err.response?.data || err.message || err);
      console.warn('Dashboard loaded with partial data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTutors = () => {
    navigate('/tutors/search');
  };

  const handleViewSessions = () => {
    navigate('/student/sessions');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bienvenido, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600">Aquí está tu resumen de sesiones y actividad</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-600 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Próximas sesiones */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Próximas Sesiones</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingSessions}</p>
              </div>
              <Clock className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          {/* Sesiones completadas */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Completadas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedSessions}</p>
              </div>
              <BookOpen className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          {/* Total gastado */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Gastado</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalSpent}</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          {/* Rating promedio de tutores */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Rating Tutores</p>
                <p className="text-3xl font-bold text-gray-900 mt-2 flex items-center">
                  {stats.avgTutorRating}
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 ml-1" />
                </p>
              </div>
              <Star className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sesiones Próximas */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Próximas Sesiones</h2>
            
            {sessions.filter(s => s.status === 'confirmed' || s.status === 'pending').length > 0 ? (
              <div className="space-y-4">
                {sessions.filter(s => s.status === 'confirmed' || s.status === 'pending').slice(0, 3).map(session => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{session.Subject?.name || 'Materia desconocida'}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          📅 {new Date(session.scheduledStart).toLocaleDateString('es-ES', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-gray-600">👨‍🏫 {session.Tutor?.User?.firstName || 'Tutor'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        session.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No hay sesiones próximas</p>
                <button
                  onClick={handleSearchTutors}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Buscar Tutor
                </button>
              </div>
            )}
          </div>

          {/* Notificaciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notificaciones</h2>
            
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-3 rounded-lg text-sm border-l-4 ${
                    notif.isRead 
                      ? 'bg-gray-50 border-gray-300' 
                      : 'bg-blue-50 border-blue-400'
                  }`}>
                    <p className="font-semibold text-gray-900">{notif.title}</p>
                    <p className="text-gray-600 text-xs mt-1">{notif.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay notificaciones</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleSearchTutors}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
          >
            🔍 Buscar Tutor
          </button>
          <button
            onClick={handleViewSessions}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
          >
            📋 Mis Sesiones
          </button>
          <button
            onClick={() => navigate('/student/profile')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
          >
            👤 Mi Perfil
          </button>
        </div>
      </div>
    </div>
  );
}
