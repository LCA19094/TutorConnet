import { useState, useEffect } from 'react';
import { AlertCircle, Loader, Calendar, User, MapPin, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../services/api';

export default function SessionRequestsComponent() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending, accepted, rejected, all
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterRequests();
  }, [filter, requests]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/session-requests/tutor');
      setRequests(response.data.data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Error cargando las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;
    if (filter !== 'all') {
      filtered = requests.filter(r => r.status === filter);
    }
    setFilteredRequests(filtered);
  };

  const handleAccept = async (requestId) => {
    try {
      setActionLoading(true);
      setError('');
      const response = await api.post(`/session-requests/${requestId}/accept`);
      
      if (response.data.success) {
        console.log('✅ Solicitud aceptada');
        await fetchRequests();
      } else {
        const errorMsg = response.data.message || 'Error aceptando solicitud';
        setError(errorMsg);
        console.error('Error:', errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error aceptando solicitud';
      setError(errorMsg);
      console.error('❌ Error aceptando:', errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectReason.trim()) {
      setError('Por favor ingresa una razón');
      return;
    }
    try {
      setActionLoading(true);
      setError('');
      const response = await api.post(`/session-requests/${requestId}/reject`, {
        reason: rejectReason
      });
      
      if (response.data.success) {
        console.log('✅ Solicitud rechazada');
        setRejectReason('');
        setShowRejectModal(false);
        setSelectedRequest(null);
        await fetchRequests();
      } else {
        const errorMsg = response.data.message || 'Error rechazando solicitud';
        setError(errorMsg);
        console.error('Error:', errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error rechazando solicitud';
      setError(errorMsg);
      console.error('❌ Error rechazando:', errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async (requestId) => {
    if (!proposedTime) {
      setError('Por favor selecciona una fecha y hora');
      return;
    }
    try {
      setActionLoading(true);
      const [date, time] = proposedTime.split('T');
      await api.post(`/session-requests/${requestId}/reschedule`, {
        proposedStart: new Date(`${date}T${time}:00`).toISOString(),
        proposedEnd: new Date(new Date(`${date}T${time}:00`).getTime() + 60 * 60 * 1000).toISOString()
      });
      setProposedTime('');
      setShowRescheduleModal(false);
      setSelectedRequest(null);
      setError('');
      fetchRequests();
    } catch (err) {
      console.error('Error:', err);
      setError('Error reprogramando la sesión');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">⏳ Pendiente</span>;
      case 'accepted':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">✓ Aceptada</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">✕ Rechazada</span>;
      case 'rescheduled':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">🔄 Reprogramada</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Solicitudes de Sesión</h1>
          <p className="text-gray-600">Gestiona y responde a las solicitudes de tus estudiantes</p>
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

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
          {['pending', 'accepted', 'rejected', 'rescheduled', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
              }`}
            >
              {f === 'pending' && `⏳ Pendientes (${requests.filter(r => r.status === 'pending').length})`}
              {f === 'accepted' && `✓ Aceptadas (${requests.filter(r => r.status === 'accepted').length})`}
              {f === 'rejected' && `✕ Rechazadas (${requests.filter(r => r.status === 'rejected').length})`}
              {f === 'rescheduled' && `🔄 Reprogramadas (${requests.filter(r => r.status === 'rescheduled').length})`}
              {f === 'all' && `📋 Todas (${requests.length})`}
            </button>
          ))}
        </div>

        {/* Requests Grid */}
        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map(request => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-blue-500"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Info */}
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        {request.Student?.User?.firstName} {request.Student?.User?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        📧 {request.Student?.User?.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        📱 {request.Student?.User?.phone || 'No especificado'}
                      </p>
                    </div>

                    {/* Session Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">
                            {new Date(request.Session?.scheduledStart).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">
                            {new Date(request.Session?.scheduledStart).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📚 {request.Session?.Subject?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold">${request.Session?.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-between">
                    {/* Status and Message */}
                    <div>
                      <div className="mb-3">
                        {getStatusBadge(request.status)}
                      </div>
                      
                      {request.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                          <p className="text-xs font-semibold text-red-700 mb-1">Razón del rechazo:</p>
                          <p className="text-sm text-red-600">{request.rejectionReason}</p>
                        </div>
                      )}

                      {request.proposedStart && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <p className="text-xs font-semibold text-blue-700 mb-1">Nueva hora propuesta:</p>
                          <p className="text-sm text-blue-600">
                            {new Date(request.proposedStart).toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {request.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleAccept(request.id)}
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2 px-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aceptar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectModal(true);
                          }}
                          disabled={actionLoading}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2 px-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRescheduleModal(true);
                          }}
                          disabled={actionLoading}
                          className="col-span-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 px-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          Reprogramar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {filter === 'all' ? 'No hay solicitudes' : `No hay solicitudes ${filter}`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Rechazar Solicitud</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">¿Por qué deseas rechazar esta solicitud?</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ingresa una razón (opcional)"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none resize-none"
                rows="4"
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReject(selectedRequest.id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold rounded-lg transition"
              >
                {actionLoading ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Reprogramar Sesión</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">Propón una nueva fecha y hora para la sesión</p>
              <input
                type="datetime-local"
                value={proposedTime}
                onChange={(e) => setProposedTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedRequest(null);
                  setProposedTime('');
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReschedule(selectedRequest.id)}
                disabled={actionLoading || !proposedTime}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition"
              >
                {actionLoading ? 'Reprogramando...' : 'Reprogramar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
