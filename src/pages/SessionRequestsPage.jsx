import React, { useState, useEffect } from 'react';
import { Check, X, User, Mail, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';

function SessionRequestsPage() {
  const { token } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchRequests();
    // Refrescar cada 5 segundos
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/booking/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Error al cargar solicitudes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setActionLoading(requestId);
      console.log(`✅ Aceptando sesión ${requestId}`);
      
      const response = await fetch(`http://localhost:5000/api/v1/booking/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Respuesta accept:', data);
      
      if (data.success) {
        toast.success('✅ Sesión aceptada - Aparecerá en Mis Sesiones');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1s
        await fetchRequests();
      } else {
        toast.error(data.message || 'Error al aceptar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al aceptar solicitud');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActionLoading(requestId);
      const response = await fetch(`http://localhost:5000/api/v1/booking/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'No disponible en este momento' })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Solicitud rechazada');
        await fetchRequests();
      } else {
        toast.error(data.message || 'Error al rechazar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al rechazar solicitud');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Solicitudes de Sesión</h1>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 text-lg">No hay solicitudes pendientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Student Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Estudiante</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      <span className="text-gray-700">
                        {request.Student?.User?.firstName} {request.Student?.User?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <span className="text-gray-600 text-sm">{request.Student?.User?.email}</span>
                    </div>
                    {request.Student?.User?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-500" />
                        <span className="text-gray-600 text-sm">{request.Student?.User?.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Request Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Detalles</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <span className="text-gray-600">Estado:</span> 
                      <span className="ml-2 font-semibold text-yellow-600">Pendiente</span>
                    </p>
                    <p className="text-gray-700">
                      <span className="text-gray-600">Solicitud:</span>
                      <span className="ml-2 text-gray-700">
                        {new Date(request.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </p>
                    {request.message && (
                      <div className="mt-2">
                        <p className="text-gray-600 text-xs">Mensaje:</p>
                        <p className="text-gray-700 text-sm">{request.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Horario Propuesto */}
                {request.proposedStart && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Horario Propuesto</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="text-gray-600">Inicio:</span>
                        <span className="ml-2">
                          {new Date(request.proposedStart).toLocaleString('es-ES')}
                        </span>
                      </p>
                      <p className="text-gray-700">
                        <span className="text-gray-600">Fin:</span>
                        <span className="ml-2">
                          {new Date(request.proposedEnd).toLocaleString('es-ES')}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 justify-end">
                  <button
                    onClick={() => handleAccept(request.id)}
                    disabled={actionLoading === request.id}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50 font-semibold"
                  >
                    <Check size={18} />
                    Aceptar
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={actionLoading === request.id}
                    className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:opacity-50 font-semibold"
                  >
                    <X size={18} />
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SessionRequestsPage;
