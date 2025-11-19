import React, { useState } from 'react';
import { X, Star, MapPin, Clock, Award, Languages, BookOpen, Send, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-toastify';

export default function TutorProfileModal({ tutor, onClose }) {
  const navigate = useNavigate();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!tutor) return null;

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) {
      toast.warning('Por favor escribe un mensaje');
      return;
    }

    try {
      setSending(true);
      // Crear una solicitud de sesión con el mensaje
      const response = await api.post('/booking/reserve', {
        tutorId: tutor.id,
        message: contactMessage
      });

      if (response.data.success) {
        toast.success('✅ Mensaje enviado. El tutor pronto se pondrá en contacto');
        setContactMessage('');
        setShowContactForm(false);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error(err.response?.data?.message || 'Error enviando mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleBookSession = () => {
    // Navegar a la página del tutor con scroll a booking
    navigate(`/tutor/${tutor.id}?scrollTo=booking`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Perfil del Tutor</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-500 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-4xl">
              {tutor.User?.firstName?.[0] || '👤'}
            </div>

            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-900">
                {tutor.User?.firstName} {tutor.User?.lastName}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`${
                        i < Math.round(Number(tutor.avgRating) || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  {Number(tutor.avgRating)?.toFixed(1) || 'N/A'} 
                </span>
                <span className="text-gray-600">
                  ({tutor.totalReviews || 0} reseñas)
                </span>
              </div>

              {/* Price and Location */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-600">Tarifa por hora</p>
                  <p className="text-2xl font-bold text-blue-600">${tutor.hourlyRate}/h</p>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={20} className="text-blue-600" />
                  <span>{tutor.User?.city || 'Ubicación no especificada'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Bio */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Sobre mí</h4>
            <p className="text-gray-700 leading-relaxed">
              {tutor.User?.bio || 'Sin descripción disponible'}
            </p>
          </div>

          {/* Experience */}
          {tutor.experienceYears && (
            <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
              <Clock size={24} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Experiencia</p>
                <p className="text-gray-700">{tutor.experienceYears} años de experiencia</p>
              </div>
            </div>
          )}

          {/* Languages */}
          {tutor.languages && (
            <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
              <Languages size={24} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Idiomas</p>
                <p className="text-gray-700">{tutor.languages}</p>
              </div>
            </div>
          )}

          {/* Certifications */}
          {tutor.certifications && (
            <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
              <Award size={24} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Certificaciones</p>
                <p className="text-gray-700">{tutor.certifications}</p>
              </div>
            </div>
          )}

          {/* Teaching Methodology */}
          {tutor.teachingMethodology && (
            <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
              <BookOpen size={24} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Metodología de Enseñanza</p>
                <p className="text-gray-700">{tutor.teachingMethodology}</p>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Contact Form */}
          {showContactForm ? (
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-gray-900">Contactar a {tutor.User?.firstName}</h4>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí... Por ejemplo: 'Hola, me interesa una clase de álgebra esta semana'"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSendMessage}
                  disabled={sending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2"
                >
                  {sending ? '⏳ Enviando...' : <>
                    <Send size={16} />
                    Enviar Mensaje
                  </>}
                </button>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : null}

          {/* Divider */}
          {!showContactForm && <div className="border-t border-gray-200"></div>}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/tutor/${tutor.id}`}
              onClick={onClose}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center font-semibold"
            >
              Ver Perfil Completo
            </Link>
            <button
              onClick={handleBookSession}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <Calendar size={18} />
              Reservar Sesión
            </button>
            {!showContactForm && (
              <button
                onClick={() => setShowContactForm(true)}
                className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg transition font-semibold flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Contactar
              </button>
            )}
            {!showContactForm && (
              <button
                onClick={onClose}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
