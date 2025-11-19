import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Refrescar cada 10 segundos
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      const token = authData.state?.token;

      const response = await fetch('http://localhost:5000/api/v1/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (notification) => {
    try {
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      const token = authData.state?.token;
      const sessionId = notification.data?.sessionId;

      const response = await fetch(`http://localhost:5000/api/v1/booking/${sessionId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Sesión aceptada');
        await fetchNotifications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al aceptar sesión');
    }
  };

  const handleReject = async (notification) => {
    try {
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      const token = authData.state?.token;
      const sessionId = notification.data?.sessionId;

      const response = await fetch(`http://localhost:5000/api/v1/booking/${sessionId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'No disponible' })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Sesión rechazada');
        await fetchNotifications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al rechazar sesión');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const sessionRequests = notifications.filter(n => n.type === 'session_requested');

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-600">Cargando...</div>
          ) : sessionRequests.length === 0 ? (
            <div className="p-4 text-center text-gray-600">No hay solicitudes pendientes</div>
          ) : (
            <div className="divide-y">
              {sessionRequests.map((notification) => (
                <div key={notification.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.data?.studentName} ({notification.data?.studentEmail})
                    </p>
                  </div>


                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationsPanel;
