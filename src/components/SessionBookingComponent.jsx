import React, { useState, useEffect } from 'react';
import { sessionsAPI, subjectsAPI, availabilityAPI } from '../services/api';
import { Calendar, Clock, BookOpen, DollarSign, Loader, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function SessionBookingComponent({ tutorId, tutorHourlyRate }) {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1); // 1: Date, 2: Time, 3: Subject, 4: Confirm
  const [subjects, setSubjects] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 60,
    subjectId: '',
    sessionType: 'online',
    studentNotes: ''
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    // Calculate price whenever duration changes
    const price = (tutorHourlyRate * formData.duration) / 60;
    setCalculatedPrice(price);
  }, [formData.duration, tutorHourlyRate]);

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.list(1, 50);
      setSubjects(response.data.subjects || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchSlots = async () => {
    if (!formData.date) {
      setError('Por favor selecciona una fecha');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await availabilityAPI.getSlots(
        tutorId,
        formData.date,
        formData.duration
      );
      setSlots(response.data.slots || []);
      if (!response.data.slots || response.data.slots.length === 0) {
        setError('No hay horarios disponibles para esta fecha');
      }
    } catch (err) {
      setError('Error al cargar horarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, date: e.target.value, time: '' });
    setSlots([]);
  };

  const handleTimeSelect = (slot) => {
    setFormData({ ...formData, time: slot.start });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time || !formData.subjectId) {
      setError('Por favor completa todos los campos');
      return;
    }

    setSubmitting(true);
    try {
      const [year, month, day] = formData.date.split('-');
      const [hour, minute] = formData.time.split(':');
      
      const scheduledStart = new Date(year, month - 1, day, hour, minute);
      const scheduledEnd = new Date(scheduledStart.getTime() + formData.duration * 60000);

      const sessionData = {
        tutorId,
        studentId: user.id,
        subjectId: parseInt(formData.subjectId),
        scheduledStart: scheduledStart.toISOString(),
        scheduledEnd: scheduledEnd.toISOString(),
        sessionType: formData.sessionType,
        durationMinutes: formData.duration,
        studentNotes: formData.studentNotes,
        price: calculatedPrice
      };

      const response = await sessionsAPI.create(sessionData);
      
      if (response.data.session) {
        // Redirect to confirmation or payment
        window.location.href = `/session/${response.data.session.id}/confirm`;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la sesión');
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Reservar Sesión</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`w-12 h-1 ${
                  step > s ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Date Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Selecciona una fecha
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={handleDateChange}
                min={minDate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (minutos)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={30}>30 minutos</option>
                <option value={60}>60 minutos</option>
                <option value={90}>90 minutos</option>
                <option value={120}>120 minutos</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                fetchSlots();
                setStep(2);
              }}
              disabled={!formData.date}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Step 2: Time Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Selecciona un horario
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTimeSelect(slot)}
                      className={`p-3 rounded-lg border-2 transition ${
                        formData.time === slot.start
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {slot.start}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!formData.time}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Subject & Notes */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Detalles de la sesión
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materia
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Selecciona una materia</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Sesión
              </label>
              <select
                value={formData.sessionType}
                onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="online">Online</option>
                <option value="presencial">Presencial</option>
                <option value="hybrid">Híbrida</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={formData.studentNotes}
                onChange={(e) => setFormData({ ...formData, studentNotes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Cuéntale al tutor qué necesitas ayuda..."
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!formData.subjectId}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Revisar
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Confirmar Reserva
            </h3>

            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Fecha:</span>
                <span className="font-medium">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Hora:</span>
                <span className="font-medium">{formData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Duración:</span>
                <span className="font-medium">{formData.duration} minutos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Materia:</span>
                <span className="font-medium">
                  {subjects.find(s => s.id === parseInt(formData.subjectId))?.name}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-3 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Precio:</span>
                <span className="text-2xl font-bold text-blue-600">${calculatedPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar y Pagar'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
