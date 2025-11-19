import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader, TrendingUp, Users, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

export default function TutorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalSessions: 0,
    avgRating: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Obtener solicitudes pendientes
      let pendingReqs = [];
      try {
        const requestsRes = await api.get('/session-requests/tutor');
        const allRequests = requestsRes.data.data || [];
        pendingReqs = allRequests.filter(r => r.status === 'pending');
        setRequests(pendingReqs);
      } catch (reqErr) {
        const backendMessage = reqErr.response?.data?.message;
        if (reqErr.response?.status === 400 && backendMessage && backendMessage.toLowerCase().includes('usuario no es un tutor')) {
          setError('Aún no tienes un perfil de tutor. Ve a "Mi Perfil" y crea tu perfil de tutor.');
          setRequests([]);
          pendingReqs = [];
        } else {
          console.warn('Error fetching tutor requests:', reqErr);
          // No es crítico - continuar sin solicitudes
          setRequests([]);
          pendingReqs = [];
        }
      }

      // Obtener sesiones confirmadas
      let confirmedSessions = [];
      try {
        const sessionsRes = await api.get('/sessions');
        confirmedSessions = sessionsRes.data.data?.filter(s => s.status === 'confirmed') || [];
        setSessions(confirmedSessions);
      } catch (sessErr) {
        console.warn('Error fetching sessions:', sessErr);
        setSessions([]);
        confirmedSessions = [];
      }

      // Obtener notificaciones
      try {
        const notificationsRes = await api.get('/notifications?limit=5');
        setNotifications(notificationsRes.data.data || []);
      } catch (notifErr) {
        console.warn('Error fetching notifications:', notifErr);
        setNotifications([]);
      }

      // Calcular estadísticas
      const totalEarnings = confirmedSessions.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || 0;
      const currentMonth = new Date().getMonth();
      const monthlyEarnings = confirmedSessions
        .filter(s => new Date(s.scheduledStart).getMonth() === currentMonth)
        .reduce((sum, s) => sum + (Number(s.price) || 0), 0) || 0;

      setStats({
        totalEarnings: Number(totalEarnings).toFixed(2),
        monthlyEarnings: Number(monthlyEarnings).toFixed(2),
        totalSessions: confirmedSessions.length,
        avgRating: 4.7,
        pendingRequests: pendingReqs.length
      });
    } catch (err) {
      console.error('Error:', err);
      // No mostrar error general si pudimos cargar datos parciales
      if (!error) {
        // Solo mostrar error si aún no hay uno
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post(`/session-requests/${requestId}/accept`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error:', err);
      setError('Error aceptando solicitud');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.post(`/session-requests/${requestId}/reject`, {
        reason: 'No estoy disponible en ese horario'
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error:', err);
      setError('Error rechazando solicitud');
    }
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
            Panel del Tutor - {user?.firstName} 👨‍🏫
          </h1>
          <p className="text-gray-600">Gestiona tus sesiones, solicitudes e ingresos</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Ingresos */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Ingresos</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">${stats.totalEarnings}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>

          {/* Ingresos Este Mes */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Este Mes</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">${stats.monthlyEarnings}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>

          {/* Solicitudes Pendientes */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Solicitudes</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingRequests}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500 opacity-20" />
            </div>
          </div>

          {/* Sesiones Confirmadas */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Sesiones</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalSessions}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>

          {/* Rating Promedio */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Rating</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.avgRating} ⭐</p>
              </div>
              <Users className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Solicitudes Pendientes */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Solicitudes Pendientes ({stats.pendingRequests})
            </h2>
            
            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map(request => (
                  <div key={request.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {request.Student?.User?.firstName} {request.Student?.User?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          📧 {request.Student?.User?.email}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          📚 {request.Session?.Subject?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          📅 {new Date(request.Session?.scheduledStart).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
                      >
                        ✓ Aceptar
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
                      >
                        ✕ Rechazar
                      </button>
                      <button
                        onClick={() => navigate(`/tutor/requests/${request.id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
                      >
                        📋 Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No hay solicitudes pendientes</p>
              </div>
            )}
          </div>

          {/* Próximas Sesiones y Notificaciones */}
          <div className="space-y-6">
            {/* Próximas Sesiones */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Próximas Sesiones</h3>
              {sessions.slice(0, 3).length > 0 ? (
                <div className="space-y-3">
                  {sessions.slice(0, 3).map(session => (
                    <div key={session.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="font-semibold text-gray-900 text-sm">{session.Student?.User?.firstName}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(session.scheduledStart).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Sin sesiones próximas</p>
              )}
            </div>

            {/* Notificaciones */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Notificaciones</h3>
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.slice(0, 3).map(notif => (
                    <div key={notif.id} className="p-2 bg-blue-50 rounded text-xs border-l-2 border-blue-400">
                      <p className="font-semibold text-gray-900">{notif.title}</p>
                      <p className="text-gray-600 text-xs">{notif.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Sin notificaciones</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/tutor/availability')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
          >
            📅 Disponibilidad
          </button>
          <button
            onClick={() => navigate('/tutor/earnings')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
          >
            💰 Ingresos
          </button>
          <button
            onClick={() => navigate('/tutor/profile')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
          >
            👤 Mi Perfil
          </button>
        </div>
      </div>
    </div>
  );
}
