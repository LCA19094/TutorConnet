import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Calendar, Download, ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'react-toastify';

export default function TutorEarningsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    completedSessions: 0,
    averageSessionPrice: 0,
    pendingSessions: 0
  });

  useEffect(() => {
    fetchEarningsData();
  }, [filterMonth]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get all sessions
      const sessionsRes = await api.get('/sessions');
      const allSessions = sessionsRes.data.data || [];

      // Filter and calculate
      const completedSessions = allSessions.filter(s => s.status === 'completed');
      const confirmedSessions = allSessions.filter(s => s.status === 'confirmed');
      
      const selectedMonth = new Date(filterMonth + '-01');
      const monthSessions = completedSessions.filter(s => {
        const sessionDate = new Date(s.scheduledStart);
        return sessionDate.getMonth() === selectedMonth.getMonth() &&
               sessionDate.getFullYear() === selectedMonth.getFullYear();
      });

      const totalEarnings = completedSessions.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
      const monthlyEarnings = monthSessions.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
      const avgPrice = completedSessions.length > 0 ? totalEarnings / completedSessions.length : 0;

      setStats({
        totalEarnings: totalEarnings.toFixed(2),
        monthlyEarnings: monthlyEarnings.toFixed(2),
        completedSessions: completedSessions.length,
        averageSessionPrice: avgPrice.toFixed(2),
        pendingSessions: confirmedSessions.length
      });

      setSessions(monthSessions.sort((a, b) => new Date(b.scheduledStart) - new Date(a.scheduledStart)));
    } catch (err) {
      console.error('Error fetching earnings:', err);
      setError('Error cargando datos de ingresos');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    try {
      // Create CSV content
      let csv = 'Reporte de Ingresos - TutorConnect\n';
      csv += `Período: ${filterMonth}\n`;
      csv += `Generado: ${new Date().toLocaleDateString('es-ES')}\n\n`;
      csv += 'Fecha,Estudiante,Duración (min),Precio,Estado\n';

      sessions.forEach(session => {
        const date = new Date(session.scheduledStart).toLocaleDateString('es-ES');
        const student = `${session.Student?.User?.firstName} ${session.Student?.User?.lastName}`;
        const duration = session.durationMinutes || 60;
        const price = Number(session.price) || 0;
        csv += `${date},"${student}",${duration},${price.toFixed(2)},${session.status}\n`;
      });

      csv += `\nTotal de Sesiones,${sessions.length}\n`;
      csv += `Total Ingresos,${stats.monthlyEarnings}\n`;

      // Download
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
      element.setAttribute('download', `ingresos_${filterMonth}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success('✅ Reporte descargado');
    } catch (err) {
      console.error('Error downloading report:', err);
      toast.error('Error descargando reporte');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando ingresos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tutor-dashboard')}
            className="text-green-600 hover:text-green-700 font-medium mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="text-green-600" size={40} />
            Mis Ingresos
          </h1>
          <p className="text-gray-600 mt-2">Gestiona y visualiza tus ganancias</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm font-medium">Total de Ingresos</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalEarnings}</p>
            <p className="text-xs text-gray-600 mt-2">Todas las sesiones completadas</p>
          </div>

          {/* Monthly Earnings */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm font-medium">Este Mes</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">${stats.monthlyEarnings}</p>
            <p className="text-xs text-gray-600 mt-2">{filterMonth}</p>
          </div>

          {/* Completed Sessions */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm font-medium">Sesiones Completadas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedSessions}</p>
            <p className="text-xs text-gray-600 mt-2">Total histórico</p>
          </div>

          {/* Average Price */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-gray-500 text-sm font-medium">Precio Promedio</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">${stats.averageSessionPrice}</p>
            <p className="text-xs text-gray-600 mt-2">Por sesión</p>
          </div>
        </div>

        {/* Filters and Export */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Calendar className="text-gray-400 flex-shrink-0" size={20} />
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition w-full md:w-auto justify-center"
            >
              <Download size={18} />
              Descargar Reporte
            </button>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Sesiones - {filterMonth}
            </h2>
            <p className="text-gray-600 text-sm mt-1">Total: {sessions.length} sesiones</p>
          </div>

          {sessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estudiante</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duración</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Precio</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sessions.map(session => (
                    <tr key={session.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(session.scheduledStart).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {session.Student?.User?.firstName} {session.Student?.User?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {session.durationMinutes || 60} min
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ${Number(session.price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          session.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : session.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.status === 'completed' ? '✓ Completada' : 
                           session.status === 'confirmed' ? '⏳ Confirmada' : 
                           session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No hay sesiones completadas en este período</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">💡 Información sobre Ingresos</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Los ingresos se registran cuando las sesiones se marcan como completadas</li>
            <li>• Puedes descargar un reporte CSV para auditoría</li>
            <li>• El precio promedio ayuda a establecer tarifas competitivas</li>
            <li>• Los ingresos se actualizan en tiempo real</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
