import { useState, useEffect } from 'react';
import { Bell, X, Check, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';

export default function NotificationBellComponent() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      // Get unread count
      const unreadRes = await api.get('/notifications/unread');
      setUnreadCount(unreadRes.data.data?.unreadCount || 0);

      // Get last 5 notifications
      const notifRes = await api.get('/notifications?limit=5&offset=0');
      setNotifications(notifRes.data.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleAcceptSession = async (sessionId) => {
    try {
      setActionLoading(sessionId);
      const response = await fetch(`http://localhost:5000/api/v1/booking/${sessionId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).state.token : ''}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Sesión aceptada');
        fetchNotifications();
      } else {
        toast.error(data.message || 'Error al aceptar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al aceptar sesión');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSession = async (sessionId) => {
    try {
      setActionLoading(sessionId);
      const response = await fetch(`http://localhost:5000/api/v1/booking/${sessionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).state.token : ''}`
        },
        body: JSON.stringify({ reason: 'No disponible en este momento' })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Sesión rechazada');
        fetchNotifications();
      } else {
        toast.error(data.message || 'Error al rechazar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al rechazar sesión');
    } finally {
      setActionLoading(null);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'session_requested':
        return '📞';
      case 'session_accepted':
        return '✅';
      case 'session_rejected':
        return '❌';
      case 'session_rescheduled':
        return '🔄';
      case 'session_started':
        return '▶️';
      case 'session_completed':
        return '🏁';
      case 'rating_received':
        return '⭐';
      case 'session_public_available':
        return '🎯';
      case 'message':
        return '💬';
      default:
        return '📬';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'session_requested':
        return 'bg-blue-100 border-blue-300';
      case 'session_accepted':
        return 'bg-green-100 border-green-300';
      case 'session_rejected':
        return 'bg-red-100 border-red-300';
      case 'session_rescheduled':
        return 'bg-yellow-100 border-yellow-300';
      case 'session_public_available':
        return 'bg-purple-100 border-purple-300';
      case 'rating_received':
        return 'bg-purple-100 border-purple-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition"
        aria-label="Notificaciones"
      >
        <Bell className="w-6 h-6" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Notificaciones</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Marcar todas como leídas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 transition hover:bg-gray-50 ${
                      notification.isRead ? 'bg-white' : 'bg-blue-50'
                    } border-l-4 ${
                      notification.isRead ? 'border-gray-300' : 'border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>


                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No hay notificaciones</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
              className="w-full text-center text-blue-600 hover:text-blue-700 font-semibold text-sm py-2"
            >
              Ver todas las notificaciones →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
