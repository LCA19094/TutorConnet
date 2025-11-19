import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tutorAPI, ratingAPI } from '../services/api';
import { Star, MapPin, Clock, Award, Loader, ArrowLeft } from 'lucide-react';
import AvailabilityCalendarComponent from '../components/AvailabilityCalendarComponent';

function TutorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('TutorProfilePage - ID recibido:', id);
    fetchTutorData();
  }, [id]);

  const fetchTutorData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔍 Buscando tutor con ID:', id);
      
      // Obtener perfil del tutor (REQUERIDO)
      let tutorRes;
      try {
        tutorRes = await tutorAPI.getTutorById(id);
        console.log('✅ Respuesta del API:', tutorRes);
      } catch (tutorError) {
        console.error('❌ Error obteniendo tutor:', tutorError);
        console.error('Status:', tutorError.response?.status);
        console.error('Data:', tutorError.response?.data);
        throw new Error(tutorError.response?.data?.message || 'No se pudo cargar el perfil del tutor');
      }

      if (tutorRes.data && tutorRes.data.data) {
        setTutor(tutorRes.data.data);
      } else {
        throw new Error('Datos del tutor inválidos');
      }
      
      // Obtener ratings (OPCIONAL, no detiene si falla)
      try {
        const ratingsRes = await ratingAPI.getTutorRatings(id);
        setRatings(ratingsRes.data?.data || []);
      } catch (ratingsError) {
        console.warn('No se pudieron cargar las reseñas:', ratingsError.message);
        setRatings([]);
      }
    } catch (error) {
      console.error('Error al cargar perfil del tutor:', error);
      setError(error.message || 'Error al cargar perfil del tutor. Intenta nuevamente');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando perfil del tutor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
          <p className="text-gray-600 font-semibold mb-4">Tutor no encontrado</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 font-medium mb-6 flex items-center gap-1"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex gap-8">
                <div className="w-40 h-40 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex-shrink-0 flex items-center justify-center text-white text-6xl shadow-md">
                  {tutor.User?.firstName?.[0] || '👤'}
                </div>

                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {tutor.User?.firstName} {tutor.User?.lastName}
                  </h1>

                  <div className="flex items-center gap-6 text-lg mb-6">
                    <div className="flex items-center gap-2">
                      <Star className="text-yellow-400" size={20} fill="currentColor" />
                      <span className="font-bold text-gray-900">{(tutor.avgRating || 0).toFixed(1)}</span>
                      <span className="text-gray-600">({tutor.totalReviews || 0} reseñas)</span>
                    </div>

                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      <Award size={16} />
                      Tutor Verificado
                    </div>
                  </div>

                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={20} className="text-blue-600" />
                      <span className="font-medium">{tutor.experienceYears || 0} años de experiencia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={20} className="text-blue-600" />
                      <span className="font-medium">Profesional en línea</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Biography */}
            {tutor.bio && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Acerca de mí</h2>
                <p className="text-gray-700 leading-relaxed text-lg">{tutor.bio}</p>
              </div>
            )}

            {/* Teaching Methodology */}
            {tutor.teachingMethodology && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Metodología de Enseñanza</h2>
                <p className="text-gray-700 leading-relaxed text-lg">{tutor.teachingMethodology}</p>
              </div>
            )}

            {/* Languages */}
            {tutor.languages && tutor.languages.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🗣️ Idiomas</h2>
                <div className="flex gap-3 flex-wrap">
                  {Array.isArray(tutor.languages) ? (
                    tutor.languages.map((lang, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full font-semibold text-lg"
                      >
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full font-semibold text-lg">
                      {tutor.languages}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Certifications */}
            {tutor.certifications && tutor.certifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🎓 Certificaciones</h2>
                <div className="space-y-3">
                  {Array.isArray(tutor.certifications) ? (
                    tutor.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Award className="text-blue-600 flex-shrink-0" size={20} />
                        <span className="text-gray-700 font-medium text-lg">{cert}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Award className="text-blue-600 flex-shrink-0" size={20} />
                      <span className="text-gray-700 font-medium text-lg">{tutor.certifications}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reseñas</h2>

              {ratings.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No hay reseñas aún</p>
              ) : (
                <div className="space-y-6">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">Estudiante</div>
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={18}
                                className={i < rating.rating ? 'text-yellow-400' : 'text-gray-300'}
                                fill="currentColor"
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.comment && (
                        <p className="text-gray-700 mt-3">{rating.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Availability Calendar */}
            <AvailabilityCalendarComponent tutorId={id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-8 sticky top-24 space-y-6">
              {/* Price */}
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  ${(tutor.hourlyRate || 0).toFixed(2)}
                </div>
                <p className="text-gray-600 font-medium">por hora</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-md">
                  📅 Reservar Sesión
                </button>
                <button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition">
                  💬 Contactar
                </button>
              </div>

              {/* Stats */}
              <div className="border-t pt-6 space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Sesiones Completadas</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{tutor.totalCompletedSessions || 0}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Calificación Promedio</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">⭐ {(tutor.avgRating || 0).toFixed(1)}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total de Reseñas</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{tutor.totalReviews || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorProfilePage;
