import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Save, ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import { api, availabilityAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function TutorAvailabilityPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState({});

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayLabels = {
    Monday: 'Lunes',
    Tuesday: 'Martes',
    Wednesday: 'Miércoles',
    Thursday: 'Jueves',
    Friday: 'Viernes',
    Saturday: 'Sábado',
    Sunday: 'Domingo'
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get current tutor's availability
      const response = await api.get('/profile');
      const tutorId = response.data.data?.tutor?.id;
      
      if (!tutorId) {
        setError('No se encontró tu perfil de tutor');
        return;
      }

      const availRes = await availabilityAPI.getAvailability(tutorId);
      const availData = availRes.data.data || [];
      
      // Organize by day of week
      const organized = {};
      daysOfWeek.forEach(day => {
        const dayData = availData.find(a => a.dayOfWeek === day);
        organized[day] = {
          dayOfWeek: day,
          startTime: dayData?.startTime || '09:00',
          endTime: dayData?.endTime || '17:00',
          isAvailable: dayData?.isAvailable !== false,
          notes: dayData?.notes || ''
        };
      });
      
      setAvailability(organized);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Error cargando disponibilidad');
      
      // Set defaults
      const defaults = {};
      daysOfWeek.forEach(day => {
        defaults[day] = {
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
          notes: ''
        };
      });
      setAvailability(defaults);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      // Validar horarios
      for (const day of Object.values(availability)) {
        if (day.isAvailable) {
          if (!day.startTime || !day.endTime) {
            setError(`Por favor completa los horarios para ${dayLabels[day.dayOfWeek]}`);
            return;
          }
          if (day.startTime >= day.endTime) {
            setError(`La hora de inicio debe ser menor que la de fin en ${dayLabels[day.dayOfWeek]}`);
            return;
          }
        }
      }

      // Save each day
      const savePromises = Object.values(availability).map(day =>
        availabilityAPI.updateDay(day.dayOfWeek, day)
      );

      await Promise.all(savePromises);
      toast.success('✅ Disponibilidad actualizada correctamente');
      
    } catch (err) {
      console.error('Error saving availability:', err);
      setError(err.response?.data?.message || 'Error guardando disponibilidad');
      toast.error('Error al guardar disponibilidad');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando disponibilidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tutor-dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="text-blue-600" size={40} />
            Mi Disponibilidad
          </h1>
          <p className="text-gray-600 mt-2">Gestiona tus horarios de disponibilidad</p>
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

        {/* Availability Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            {daysOfWeek.map(day => (
              <div key={day} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{dayLabels[day]}</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availability[day]?.isAvailable || false}
                      onChange={(e) => handleDayChange(day, 'isAvailable', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-600">Disponible</span>
                  </label>
                </div>

                {availability[day]?.isAvailable && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de Inicio
                      </label>
                      <input
                        type="time"
                        value={availability[day]?.startTime || '09:00'}
                        onChange={(e) => handleDayChange(day, 'startTime', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de Fin
                      </label>
                      <input
                        type="time"
                        value={availability[day]?.endTime || '17:00'}
                        onChange={(e) => handleDayChange(day, 'endTime', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Descanso de 13:00 a 14:00"
                    value={availability[day]?.notes || ''}
                    onChange={(e) => handleDayChange(day, 'notes', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Disponibilidad
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/tutor-dashboard')}
              className="px-6 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">📌 Consejos</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Actualiza tu disponibilidad regularmente</li>
            <li>• Los estudiantes solo podrán agendar en tus horarios disponibles</li>
            <li>• Puedes usar las notas para indicar descansos o restricciones especiales</li>
            <li>• Los cambios se guardan inmediatamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
