import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

function MySessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSessions();
    // Auto-refresh cada 5 segundos
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      console.log(`\n📋 MySessionsPage: Obteniendo sesiones...`);
      
      const response = await sessionAPI.list();
      console.log('📋 Respuesta completa:', response.data);
      
      const data = response.data?.data || [];
      console.log(`✅ ${data.length} sesiones cargadas`);
      
      if (data.length > 0) {
        console.log('Primera sesión:', JSON.stringify(data[0], null, 2));
      }
      
      setSessions(data);
    } catch (error) {
      console.error('❌ Error al cargar sesiones:', error);
      toast.error('Error al cargar sesiones');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || 'pending';
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[statusLower] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      in_progress: 'En curso',
      completed: 'Completada',
      rejected: 'Rechazada',
      cancelled: 'Cancelada'
    };
    return labels[status?.toLowerCase()] || status || 'Sin estado';
  };

  const filterSessions = () => {
    if (filter === 'all') return sessions;
    return sessions.filter(s => s.status?.toLowerCase() === filter.toLowerCase());
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Mis Sesiones</h1>

      {/* Filter Buttons */}
      <div className="flex gap-4 mb-8 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'all' ? 'Todas' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando sesiones...</p>
        </div>
      ) : filterSessions().length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No hay sesiones en esta categoría</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filterSessions().map((session) => {
            // Determinar si tengo datos de Tutor o Student
            const hasTutor = session.Tutor && session.Tutor.User;
            const hasStudent = session.Student && session.Student.User;
            
            let otherUserName = 'N/A';
            let otherRole = 'Otro';

            if (hasTutor) {
              otherUserName = `${session.Tutor.User.firstName || ''} ${session.Tutor.User.lastName || ''}`.trim();
              otherRole = 'Tutor';
            } else if (hasStudent) {
              otherUserName = `${session.Student.User.firstName || ''} ${session.Student.User.lastName || ''}`.trim();
              otherRole = 'Estudiante';
            }

            const sessionDate = session.scheduledStart 
              ? new Date(session.scheduledStart)
              : null;

            return (
              <div key={session.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{session.subject || 'Sesión'}</h3>
                    <p className="text-gray-600 mt-1">
                      {otherRole}: {otherUserName}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(session.status)}`}>
                    {getStatusLabel(session.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Fecha</p>
                      <p className="font-semibold">
                        {sessionDate
                          ? sessionDate.toLocaleDateString('es-ES')
                          : 'No especificada'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Hora</p>
                      <p className="font-semibold">
                        {sessionDate
                          ? sessionDate.toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'No especificada'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Duración</p>
                      <p className="font-semibold">{session.durationMinutes || 'N/A'} min</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Tipo</p>
                      <p className="font-semibold">{session.sessionType || 'online'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {session.status?.toLowerCase() === 'confirmed' && session.meetingLink && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition font-semibold"
                    >
                      Unirse a Sesión
                    </a>
                  )}
                  {session.status?.toLowerCase() === 'completed' && (
                    <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold">
                      Calificar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MySessionsPage;
