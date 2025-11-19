import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, DollarSign, Loader, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { sessionsAPI, availabilityAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

export default function BookingModal({ tutor, onClose }) {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tutorAvailability, setTutorAvailability] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);
  const [isDefaultAvailability, setIsDefaultAvailability] = useState(false);
  const [isDefaultSlots, setIsDefaultSlots] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 60,
    sessionType: 'online',
    studentNotes: ''
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);

  useEffect(() => {
    fetchTutorAvailability();
  }, []);

  useEffect(() => {
    const price = (tutor.hourlyRate * formData.duration) / 60;
    setCalculatedPrice(price);
  }, [formData.duration, tutor.hourlyRate]);

  const fetchTutorAvailability = async () => {
    try {
      const response = await availabilityAPI.getAvailability(tutor.id);
      const data = response.data.data || [];
      
      // Si es un array, usarlo; si es un objeto, convertir a array
      const availabilityData = Array.isArray(data) ? data : Object.values(data);
      
      setTutorAvailability(availabilityData);
      calculateAvailableDates(availabilityData);
    } catch (err) {
      console.error('Error fetching availability:', err);
      // Si hay error, usar default (lunes-viernes)
      calculateAvailableDates([]);
    }
  };

  const calculateAvailableDates = (availability) => {
    const available = [];
    const today = new Date();
    const nextTwoMonths = new Date();
    nextTwoMonths.setMonth(nextTwoMonths.getMonth() + 2);

    // Si no hay disponibilidad configurada, usar lunes-viernes como default
    const isDefault = !Array.isArray(availability) || availability.length === 0;
    setIsDefaultAvailability(isDefault);

    const days = isDefault ? [
      { dayOfWeek: 'monday', isAvailable: true },
      { dayOfWeek: 'tuesday', isAvailable: true },
      { dayOfWeek: 'wednesday', isAvailable: true },
      { dayOfWeek: 'thursday', isAvailable: true },
      { dayOfWeek: 'friday', isAvailable: true }
    ] : availability;

    const dayMap = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };

    // Iterate through each day in the next 60 days
    for (let d = new Date(today); d <= nextTwoMonths; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dayName = dayMap[dayOfWeek];
      
      // Check if tutor is available on this day of week
      const dayAvailability = days.find(day => 
        day.dayOfWeek.toLowerCase() === dayName.toLowerCase()
      );
      
      if (dayAvailability && dayAvailability.isAvailable) {
        available.push(new Date(d));
      }
    }
    setAvailableDates(available);
  };

  const fetchAllSubjects = async () => {
    try {
      const response = await subjectsAPI.list(1, 50);
      const subjectsData = response.data.subjects || response.data.data || [];
      console.log('📚 Materias cargadas:', subjectsData);
      setSubjects(subjectsData);
    } catch (err) {
      console.error('❌ Error fetching subjects:', err);
      // Usar materias por defecto si no se cargan
      const defaultSubjects = [
        { id: 1, name: 'Matemática' },
        { id: 2, name: 'Español' },
        { id: 3, name: 'Inglés' },
        { id: 4, name: 'Física' },
        { id: 5, name: 'Química' }
      ];
      setSubjects(defaultSubjects);
    }
  };

  const fetchTutorSubjects = async () => {
    try {
      const response = await tutorsAPI.getProfile(tutor.id);
      const tutorData = response.data.data || response.data;
      
      // Las materias pueden estar en Subjects o TutorSubjects
      const subjectsData = tutorData.Subjects || tutorData.subjects || [];
      setTutorSubjects(subjectsData);
    } catch (err) {
      console.error('Error fetching tutor subjects:', err);
      // Si no podemos cargar las materias del tutor, mostrar todas
      setTutorSubjects([]);
    }
  };

  const fetchSlots = async () => {
    if (!formData.date) {
      setError('Por favor selecciona una fecha');
      return;
    }

    setLoading(true);
    setError('');
    setIsDefaultSlots(false);
    
    try {
      const response = await availabilityAPI.getSlots(
        tutor.id,
        formData.date,
        formData.duration
      );
      
      let slotsData = response.data.slots || [];
      
      // Si no hay horarios, generar horarios por defecto (09:00 a 17:00)
      if (!slotsData || slotsData.length === 0) {
        slotsData = generateDefaultSlots('09:00', '17:00', formData.duration);
        setIsDefaultSlots(true);
      }
      
      setSlots(slotsData);
      
      if (!slotsData || slotsData.length === 0) {
        setError('No hay horarios disponibles para esta fecha. Intenta otra fecha.');
      }
    } catch (err) {
      console.error('Error al cargar horarios:', err);
      // Si hay error en la API, generar horarios por defecto
      const defaultSlots = generateDefaultSlots('09:00', '17:00', formData.duration);
      setSlots(defaultSlots);
      setIsDefaultSlots(true);
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultSlots = (startTime, endTime, duration) => {
    const slots = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const start = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      const endCurrentHour = currentHour + Math.floor((currentMin + duration) / 60);
      const endCurrentMin = (currentMin + duration) % 60;
      
      if (endCurrentHour < endHour || (endCurrentHour === endHour && endCurrentMin <= endMin)) {
        slots.push({ start });
      }
      
      currentMin += 30; // Incrementar 30 minutos
      if (currentMin >= 60) {
        currentMin -= 60;
        currentHour += 1;
      }
    }
    
    return slots;
  };

  const handleDateChange = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setFormData({ ...formData, date: dateStr, time: '' });
    setSlots([]);
    setError('');
  };

  const isDateAvailable = (date) => {
    return availableDates.some(d => 
      d.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );
  };

  const handleTimeSelect = (slot) => {
    setFormData({ ...formData, time: slot.start });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time) {
      setError('Por favor selecciona fecha y hora');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const [year, month, day] = formData.date.split('-');
      const [hour, minute] = formData.time.split(':');
      
      const scheduledStart = new Date(year, month - 1, day, hour, minute);
      const scheduledEnd = new Date(scheduledStart.getTime() + formData.duration * 60000);

      const sessionData = {
        tutorId: tutor.id,
        // El backend obtendrá el studentId del JWT token
        scheduledStart: scheduledStart.toISOString(),
        scheduledEnd: scheduledEnd.toISOString(),
        sessionType: formData.sessionType,
        durationMinutes: formData.duration,
        studentNotes: formData.studentNotes
      };

      console.log('📤 Enviando datos de sesión:', sessionData);

      const response = await sessionsAPI.create(sessionData);
      
      console.log('📥 Respuesta del servidor:', response.data);

      if (response.data && response.data.success) {
        toast.success('✅ Reserva realizada correctamente');
        onClose();
      } else {
        setError(response.data?.message || 'Error al crear la sesión');
      }
    } catch (err) {
      console.error('❌ Error completo en handleSubmit:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al crear la sesión';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            Reservar sesión con {tutor.User?.firstName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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
            {/* Step 1: Date & Duration Selection with Calendar */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Selecciona fecha y duración
                </h3>

                {/* Calendar */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <h4 className="text-lg font-semibold">
                      {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Days header */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map(day => (
                      <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {(() => {
                      const year = currentMonth.getFullYear();
                      const month = currentMonth.getMonth();
                      const firstDay = new Date(year, month, 1).getDay();
                      const daysInMonth = new Date(year, month + 1, 0).getDate();
                      const days = [];

                      // Empty cells
                      for (let i = 0; i < firstDay; i++) {
                        days.push(<div key={`empty-${i}`} />);
                      }

                      // Days
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day);
                        const dateStr = date.toISOString().split('T')[0];
                        const available = isDateAvailable(date);
                        const today = new Date();
                        const isBeforeToday = date < today && date.toDateString() !== today.toDateString();
                        const isSelected = formData.date === dateStr;

                        days.push(
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              if (available && !isBeforeToday) {
                                handleDateChange(date);
                              }
                            }}
                            disabled={!available || isBeforeToday}
                            className={`p-2 text-center rounded text-sm font-medium transition ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : available && !isBeforeToday
                                ? 'bg-green-100 text-green-900 hover:bg-green-200 cursor-pointer'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            title={available && !isBeforeToday ? 'Disponible' : 'No disponible'}
                          >
                            {day}
                          </button>
                        );
                      }

                      return days;
                    })()}
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                        <span>Disponible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                        <span>No disponible</span>
                      </div>
                    </div>
                    
                    {isDefaultAvailability && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700">
                        <p className="font-semibold mb-1">ℹ️ Disponibilidad por defecto</p>
                        <p>El tutor no ha configurado su disponibilidad. Se muestran lunes a viernes como disponibles.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Precio estimado:</span> ${calculatedPrice.toFixed(2)}
                  </p>
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
                  Ver horarios disponibles
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
                
                <p className="text-sm text-gray-600">
                  Fecha seleccionada: <span className="font-semibold">{formData.date}</span>
                </p>

                {isDefaultSlots && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700">
                    <p className="font-semibold mb-1">ℹ️ Horarios por defecto</p>
                    <p>Se muestran horarios sugeridos de 09:00 a 17:00. El tutor puede configurar sus horarios específicos en su perfil.</p>
                  </div>
                )}

                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : slots.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleTimeSelect(slot)}
                          className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                            formData.time === slot.start
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-blue-400 text-gray-700'
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
                ) : (
                  <>
                    <div className="text-center py-8">
                      <p className="text-gray-600">No hay horarios disponibles para esta fecha</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Seleccionar otra fecha
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Modality & Duration */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Detalles de la sesión
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1 hora 30 minutos</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modalidad *
                  </label>
                  <select
                    value={formData.sessionType}
                    onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="online">🌐 Online</option>
                    <option value="presencial">📍 Presencial</option>
                    <option value="hybrid">🔄 Híbrida</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={formData.studentNotes}
                    onChange={(e) => setFormData({ ...formData, studentNotes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Cuéntale al tutor qué temas necesitas..."
                    rows={3}
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
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
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
                  Confirmar reserva
                </h3>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">Tutor:</span>
                    <span className="font-semibold">{tutor.User?.firstName} {tutor.User?.lastName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">📅 Fecha:</span>
                    <span className="font-semibold">{formData.date}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">🕐 Hora:</span>
                    <span className="font-semibold">{formData.time}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">⏱️ Duración:</span>
                    <span className="font-semibold">{formData.duration} minutos</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">🎓 Modalidad:</span>
                    <span className="font-semibold capitalize">{formData.sessionType}</span>
                  </div>
                  <div className="flex justify-between pt-4 bg-white -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                    <span className="text-lg font-bold text-gray-900">Total a pagar:</span>
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
                      'Confirmar Reserva'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
