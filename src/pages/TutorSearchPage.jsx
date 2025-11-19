import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tutorAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Star, MapPin } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTutorProfileSync } from '../hooks/useTutorProfileSync';
import BookingModal from '../components/BookingModal';
import TutorProfileModal from '../components/TutorProfileModal';

function TutorSearchPage() {
  const { token } = useAuthStore();
  const [tutors, setTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);
  const [selectedTutorForModal, setSelectedTutorForModal] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    minRating: 0,
    maxPrice: 1000,
    verifiedOnly: false
  });

  useEffect(() => {
    fetchTutors();
  }, [filters]);

  // Refrescar tutores cada vez que la página recibe el foco (vuelve visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchTutors();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [filters]);

  // Sincronizar cuando se actualiza el perfil del tutor
  useTutorProfileSync((updatedData) => {
    const tutorId = updatedData.tutorId;
    
    // Actualizar tutores locales con los nuevos datos
    setTutors(prevTutors =>
      prevTutors.map(tutor => {
        // Solo actualizar el tutor que fue modificado
        if (tutor.id === tutorId) {
          return {
            ...tutor,
            bio: updatedData.bio || tutor.bio,
            experienceYears: updatedData.experienceYears || tutor.experienceYears,
            hourlyRate: updatedData.hourlyRate || tutor.hourlyRate,
            languages: updatedData.languages || tutor.languages,
            certifications: updatedData.certifications || tutor.certifications,
            teachingMethodology: updatedData.teachingMethodology || tutor.teachingMethodology
          };
        }
        return tutor;
      })
    );
  });

  const fetchTutors = async () => {
    try {
      setIsLoading(true);
      const response = await tutorAPI.searchTutors(filters);
      const payload = response.data?.data;
      const tutorsList = payload?.tutors || [];
      setTutors(tutorsList);
    } catch (error) {
      console.error('Error al cargar tutores:', error);
      toast.error('Error al cargar tutores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReserve = (tutor) => {
    setSelectedTutorForBooking(tutor);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6 sticky top-24">
          <h2 className="text-xl font-bold mb-6">Filtros</h2>

          <div className="space-y-6">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Nombre o materia"
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Madrid, Barcelona..."
              />
            </div>

            {/* Max Price */}
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Precio Máximo: ${filters.maxPrice}/hora
              </label>
              <input
                type="range"
                id="maxPrice"
                name="maxPrice"
                min="0"
                max="1000"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full"
              />
            </div>

            {/* Min Rating */}
            <div>
              <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-2">
                Calificación Mínima
              </label>
              <select
                id="minRating"
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value={0}>Todas</option>
                <option value={3}>3+ ⭐</option>
                <option value={4}>4+ ⭐</option>
                <option value={5}>5 ⭐</option>
              </select>
            </div>

            {/* Verified Only */}
            <label className="flex items-center">
              <input
                type="checkbox"
                name="verifiedOnly"
                checked={filters.verifiedOnly}
                onChange={handleFilterChange}
                className="w-4 h-4"
              />
              <span className="ml-2 text-sm text-gray-700">Solo tutores verificados</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tutors List */}
      <div className="lg:col-span-3">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando tutores...</p>
          </div>
        ) : tutors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No se encontraron tutores con esos criterios</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tutors.map((tutor) => (
              <div 
                key={tutor.id} 
                className="relative"
              >
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-3xl">
                      {tutor.User?.firstName?.[0] || '👤'}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">
                            {tutor.User?.firstName} {tutor.User?.lastName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <MapPin size={16} />
                            {tutor.User?.city || 'Ubicación no especificada'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            ${tutor.hourlyRate}/h
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            <span className="font-semibold">
                              {Number(tutor.avgRating)?.toFixed(1) || 'N/A'} 
                            </span>
                            <span className="text-sm text-gray-600">
                              ({tutor.totalReviews || 0})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bio/Description */}
                      <p className="text-gray-600 mt-3 text-sm">
                        {tutor.User?.bio || 'Sin descripción disponible'}
                      </p>

                      {/* Additional Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                        {tutor.experienceYears && (
                          <div className="text-gray-600">
                            <span className="font-semibold">Experiencia:</span> {tutor.experienceYears} años
                          </div>
                        )}
                        {tutor.languages && (
                          <div className="text-gray-600">
                            <span className="font-semibold">Idiomas:</span> {tutor.languages}
                          </div>
                        )}
                        {tutor.certifications && (
                          <div className="text-gray-600 col-span-full">
                            <span className="font-semibold">Certificaciones:</span> {tutor.certifications}
                          </div>
                        )}
                        {tutor.teachingMethodology && (
                          <div className="text-gray-600 col-span-full">
                            <span className="font-semibold">Metodología:</span> {tutor.teachingMethodology}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <button 
                          onClick={() => setSelectedTutorForModal(tutor)}
                          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-center font-semibold text-sm md:text-base"
                        >
                          Ver Perfil
                        </button>
                        <button 
                          onClick={() => handleReserve(tutor)}
                          className="flex-1 border-2 border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 transition font-semibold text-sm md:text-base"
                        >
                          Reservar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedTutorForBooking && (
        <BookingModal 
          tutor={selectedTutorForBooking} 
          onClose={() => setSelectedTutorForBooking(null)}
        />
      )}

      {/* Profile Modal */}
      {selectedTutorForModal && (
        <TutorProfileModal 
          tutor={selectedTutorForModal} 
          onClose={() => setSelectedTutorForModal(null)}
        />
      )}
    </div>
  );
}

export default TutorSearchPage;
