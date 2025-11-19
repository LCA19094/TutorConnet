import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Save, AlertCircle } from 'lucide-react';
import { availabilityAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function AvailabilitySettingsComponent({ tutorId }) {
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const daysOfWeek = [
    { key: 'monday', label: 'Lunes', order: 0 },
    { key: 'tuesday', label: 'Martes', order: 1 },
    { key: 'wednesday', label: 'Miércoles', order: 2 },
    { key: 'thursday', label: 'Jueves', order: 3 },
    { key: 'friday', label: 'Viernes', order: 4 },
    { key: 'saturday', label: 'Sábado', order: 5 },
    { key: 'sunday', label: 'Domingo', order: 6 }
  ];

  useEffect(() => {
    fetchAvailability();
  }, [tutorId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await availabilityAPI.getAvailability(tutorId);
      const data = response.data.data || [];
      
      // Convertir array a objeto por día de la semana
      const availabilityObj = {};
      daysOfWeek.forEach(day => {
        const dayData = Array.isArray(data) 
          ? data.find(d => d.dayOfWeek.toLowerCase() === day.key.toLowerCase())
          : data[day.key];
        
        availabilityObj[day.key] = {
          isAvailable: dayData?.isAvailable ?? true,
          startTime: dayData?.startTime ?? '09:00',
          endTime: dayData?.endTime ?? '17:00'
        };
      });
      
      setAvailability(availabilityObj);
      setError('');
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Error al cargar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isAvailable: !prev[day].isAvailable
      }
    }));
  };

  const handleTimeChange = (day, field, value) => {
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

      const schedule = daysOfWeek.map(day => ({
        dayOfWeek: day.label,
        isAvailable: availability[day.key].isAvailable,
        startTime: availability[day.key].startTime,
        endTime: availability[day.key].endTime
      }));

      await availabilityAPI.setSchedule(schedule);
      toast.success('✅ Disponibilidad actualizada correctamente');
    } catch (err) {
      console.error('Error saving availability:', err);
      setError(err.response?.data?.message || 'Error al guardar disponibilidad');
      toast.error('❌ Error al guardar disponibilidad');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando disponibilidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Configurar Disponibilidad
      </h2>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <p className="text-gray-600 text-sm mb-6">
        Configura qué días de la semana estás disponible para dar clases. Esta información se mostrará a los estudiantes al momento de reservar.
      </p>

      <div className="space-y-4 mb-6">
        {daysOfWeek.map(day => (
          <div 
            key={day.key}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availability[day.key]?.isAvailable ?? true}
                    onChange={() => handleToggleDay(day.key)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-gray-900 w-24">{day.label}</span>
                </label>
              </div>
            </div>

            {availability[day.key]?.isAvailable && (
              <div className="ml-9 flex gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora inicio
                  </label>
                  <input
                    type="time"
                    value={availability[day.key]?.startTime ?? '09:00'}
                    onChange={(e) => handleTimeChange(day.key, 'startTime', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora fin
                  </label>
                  <input
                    type="time"
                    value={availability[day.key]?.endTime ?? '17:00'}
                    onChange={(e) => handleTimeChange(day.key, 'endTime', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        {saving ? 'Guardando...' : 'Guardar Disponibilidad'}
      </button>
    </div>
  );
}
