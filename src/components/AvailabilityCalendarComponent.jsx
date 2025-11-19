import React, { useState, useEffect } from 'react';
import { availabilityAPI, sessionsAPI } from '../services/api';
import { Calendar, Clock, X, Loader, AlertCircle } from 'lucide-react';
import { format, parse, getDaysInMonth, getDay, addDays } from 'date-fns';

export default function AvailabilityCalendarComponent({ tutorId }) {
  const [availability, setAvailability] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [bookedDates, setBookedDates] = useState(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchAvailability();
    fetchBookedDates();
  }, [tutorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const response = await availabilityAPI.getAvailability(tutorId);
      const availData = {};
      response.data.availabilities?.forEach((av) => {
        availData[av.dayOfWeek] = {
          startTime: av.startTime,
          endTime: av.endTime,
          isAvailable: av.isAvailable
        };
      });
      setAvailability(availData);
    } catch (err) {
      console.error('Error al cargar disponibilidad:', err);
      setError('Error al cargar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedDates = async () => {
    try {
      const response = await sessionsAPI.getTutorSessions(tutorId, { status: 'confirmed' });
      const booked = new Set();
      
      if (response.data?.data) {
        response.data.data.forEach((session) => {
          if (session.startTime) {
            const dateStr = format(new Date(session.startTime), 'yyyy-MM-dd');
            booked.add(dateStr);
          }
        });
      }
      
      setBookedDates(booked);
    } catch (err) {
      console.warn('No se pudieron cargar las reservas:', err);
    }
  };

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await availabilityAPI.getSlots(tutorId, dateStr, 60);
      setSlots(response.data.slots || []);
    } catch (err) {
      console.error('Error al cargar slots:', err);
      setError('Error al cargar horarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const getDayOfWeek = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const isDateBooked = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookedDates.has(dateStr);
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(new Date(year, month));
    const firstDay = getDay(new Date(year, month, 1));
    
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const dayName = getDayOfWeek(selectedDate);
  const dayAvailability = availability[dayName];
  const isAvailable = dayAvailability?.isAvailable !== false;
  const calendarDays = generateCalendarDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <Calendar className="w-6 h-6 text-blue-600" />
        Disponibilidad del Tutor
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Calendar View */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition"
                >
                  Siguiente →
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square"></div>;
                }

                const isBooked = isDateBooked(date);
                const isPast = date < today;
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const dayOfWeek = getDayOfWeek(date);
                const dayAvail = availability[dayOfWeek];
                const isAvailableDay = dayAvail?.isAvailable !== false && !isPast;

                return (
                  <button
                    key={format(date, 'yyyy-MM-dd')}
                    onClick={() => !isPast && !isBooked && setSelectedDate(date)}
                    disabled={isPast || isBooked}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-sm font-semibold transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : isBooked
                        ? 'border-red-300 bg-red-100 text-red-600 cursor-not-allowed'
                        : isPast
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isAvailableDay
                        ? 'border-green-300 bg-green-50 text-green-700 hover:border-green-600'
                        : 'border-orange-200 bg-orange-50 text-orange-600'
                    }`}
                    title={isBooked ? 'Reservado' : isPast ? 'Fecha pasada' : isAvailableDay ? 'Disponible' : 'No disponible'}
                  >
                    <span>{date.getDate()}</span>
                    {isBooked && <span className="text-xs">📅</span>}
                    {isAvailableDay && !isBooked && <span className="text-xs">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
                <span className="text-xs text-gray-700">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
                <span className="text-xs text-gray-700">Reservado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-100 border-2 border-orange-200"></div>
                <span className="text-xs text-gray-700">No disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-200"></div>
                <span className="text-xs text-gray-700">Pasado</span>
              </div>
            </div>
          </div>

          {/* Selected Date Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Selecciona una fecha
              </label>
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(parse(e.target.value, 'yyyy-MM-dd', new Date()))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                min={format(today, 'yyyy-MM-dd')}
              />
              <p className="text-sm text-gray-600 mt-2">
                {format(selectedDate, 'EEEE, d MMMM yyyy')}
              </p>
            </div>

            {/* Availability Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Estado de Disponibilidad
              </label>
              <div className={`p-4 rounded-lg border-2 ${
                isDateBooked(selectedDate)
                  ? 'bg-red-50 border-red-200'
                  : isAvailable
                  ? 'bg-green-50 border-green-200'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                {isDateBooked(selectedDate) ? (
                  <>
                    <p className="font-semibold text-red-900">Reservado</p>
                    <p className="text-sm text-red-700 mt-1">Este día ya tiene una sesión confirmada</p>
                  </>
                ) : isAvailable ? (
                  <>
                    <p className="font-semibold text-green-900">Disponible</p>
                    {dayAvailability && (
                      <p className="text-sm text-green-700 mt-1">
                        Horario: {dayAvailability.startTime} - {dayAvailability.endTime}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-orange-900">No disponible</p>
                    <p className="text-sm text-orange-700 mt-1">El tutor no tiene horario este día</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Time Slots */}
          {isAvailable && !isDateBooked(selectedDate) && slots.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-blue-600" />
                Horarios Disponibles
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-lg border-2 transition font-semibold ${
                      selectedSlot === slot
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700'
                    }`}
                  >
                    {slot.start}
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-blue-900">Horario Seleccionado</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {selectedSlot.start} - {selectedSlot.end}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Weekly Schedule Overview */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Horarios Semanales Regulares</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(availability).length === 0 ? (
                <p className="text-gray-600 text-sm col-span-full">No hay horarios configurados</p>
              ) : (
                Object.entries(availability).map(([day, info]) => (
                  <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-700 min-w-24">{day}</span>
                    {info?.isAvailable ? (
                      <span className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded">
                        {info.startTime} - {info.endTime}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-500">Cerrado</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
