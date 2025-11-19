import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { useAutoSave } from '../hooks/useAutoSave';
import { AlertCircle, CheckCircle, Loader, Save, X } from 'lucide-react';

export default function TutorProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Si no hay usuario autenticado, redirigir a login
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    bio: '',
    experienceYears: 0,
    hourlyRate: 0,
    certifications: '',
    languages: '',
    teachingMethodology: '',
    phoneNumber: '',
    location: ''
  });

  const [profileStats, setProfileStats] = useState({
    totalSessions: 0,
    avgRating: 0,
    totalReviews: 0,
    totalEarnings: 0
  });

  // Hook de auto-guardado
  const { isSaving, lastSaved, saveError, autoSave } = useAutoSave(
    async (data) => {
      const dataToSend = {
        bio: data.bio,
        experienceYears: data.experienceYears,
        hourlyRate: data.hourlyRate,
        certifications: data.certifications
          .split(',')
          .map(c => c.trim())
          .filter(c => c),
        languages: data.languages
          .split(',')
          .map(l => l.trim())
          .filter(l => l),
        teachingMethodology: data.teachingMethodology
      };

      const response = await api.post('/tutors/profile', dataToSend);
      
      // Actualizar formData con los datos guardados del servidor
      if (response.data?.data) {
        const savedData = response.data.data;
        setFormData(prev => ({
          ...prev,
          bio: savedData.bio || prev.bio,
          experienceYears: savedData.experienceYears || prev.experienceYears,
          hourlyRate: savedData.hourlyRate || prev.hourlyRate,
          certifications: Array.isArray(savedData.certifications)
            ? savedData.certifications.join(', ')
            : savedData.certifications || prev.certifications,
          languages: Array.isArray(savedData.languages)
            ? savedData.languages.join(', ')
            : savedData.languages || prev.languages,
          teachingMethodology: savedData.teachingMethodology || prev.teachingMethodology
        }));
      }
      
      setSuccess('Guardado automáticamente');
      setTimeout(() => setSuccess(''), 3000);
      
      // Retornar response para que useAutoSave pueda acceder al tutorId
      return response;
    },
    2000 // Guardar después de 2 segundos sin cambios
  );

  useEffect(() => {
    fetchTutorProfile();
  }, []);

  const fetchTutorProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const profileRes = await api.get('/tutors/profile');
      console.log('📊 Respuesta del perfil:', profileRes.data);
      
      if (profileRes.data?.data) {
        const tutorData = profileRes.data.data;
        console.log('✅ Datos del tutor cargados:', tutorData);
        
        // Actualizar formData con todos los campos disponibles
        setFormData(prev => ({
          email: tutorData.User?.email || prev.email || '',
          firstName: tutorData.User?.firstName || prev.firstName || '',
          bio: tutorData.bio || '',
          experienceYears: tutorData.experienceYears || 0,
          hourlyRate: tutorData.hourlyRate || 0,
          certifications: Array.isArray(tutorData.certifications) 
            ? tutorData.certifications.join(', ') 
            : tutorData.certifications || '',
          languages: Array.isArray(tutorData.languages)
            ? tutorData.languages.join(', ')
            : tutorData.languages || '',
          teachingMethodology: tutorData.teachingMethodology || '',
          phoneNumber: tutorData.User?.phone || prev.phoneNumber || '',
          location: tutorData.User?.city || prev.location || ''
        }));

        setProfileStats({
          totalSessions: tutorData.totalCompletedSessions || 0,
          avgRating: parseFloat(tutorData.avgRating) || 0,
          totalReviews: tutorData.totalReviews || 0,
          totalEarnings: 0
        });
        setIsEditing(false);
      } else {
        console.warn('No se encontraron datos del tutor');
        setError('No se pudo cargar el perfil');
        setIsEditing(true);
      }
    } catch (err) {
      console.error('❌ Error al cargar perfil:', err);
      setError('Error al cargar tu perfil. Por favor intenta de nuevo.');
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = {
      ...formData,
      [name]: name === 'experienceYears' || name === 'hourlyRate' 
        ? parseFloat(value) || 0 
        : value
    };
    setFormData(newData);
    
    // Validar antes de auto-guardar
    if (name === 'hourlyRate' && (!value || parseFloat(value) <= 0)) {
      setError('La tarifa horaria debe ser mayor a 0');
      return;
    }
    
    setError('');
    // Disparar auto-guardado
    autoSave(newData);
  };

  const handleManualSave = async () => {
    try {
      if (!formData.hourlyRate || formData.hourlyRate <= 0) {
        setError('La tarifa horaria debe ser mayor a 0');
        return;
      }

      const dataToSend = {
        bio: formData.bio,
        experienceYears: formData.experienceYears,
        hourlyRate: formData.hourlyRate,
        certifications: formData.certifications
          .split(',')
          .map(c => c.trim())
          .filter(c => c),
        languages: formData.languages
          .split(',')
          .map(l => l.trim())
          .filter(l => l),
        teachingMethodology: formData.teachingMethodology
      };

      await api.post('/tutors/profile', dataToSend);
      setSuccess('✓ Perfil actualizado exitosamente');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
      fetchTutorProfile();
    } catch (err) {
      console.error('Error guardando perfil:', err);
      setError(err.response?.data?.message || 'Error al guardar los cambios');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando perfil...</p>
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
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-1"
          >
            ← Volver al Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Mi Perfil Profesional</h1>
          <p className="text-gray-600 mt-2">Administra tu información como tutor</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        {/* Stats Grid */}
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Sesiones Completadas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{profileStats.totalSessions}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Calificación</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">⭐ {profileStats.avgRating.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Reseñas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{profileStats.totalReviews}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Tarifa</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">${parseFloat(formData.hourlyRate || 0).toFixed(2)}/h</p>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Información Profesional</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                ✏️ Editar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Nombre
              </label>
              <input
                type="text"
                value={formData.firstName}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* Tarifa Horaria */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💰 Tarifa Horaria (USD/hora) *
              </label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg transition ${
                  isEditing ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-gray-50 text-gray-600'
                }`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            {/* Años de Experiencia */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📚 Años de Experiencia
              </label>
              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg transition ${
                  isEditing ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-gray-50 text-gray-600'
                }`}
                placeholder="0"
                min="0"
              />
            </div>

            {/* Idiomas */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🗣️ Idiomas (separados por comas)
              </label>
              <input
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg transition ${
                  isEditing ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-gray-50 text-gray-600'
                }`}
                placeholder="Español, Inglés, Francés"
              />
            </div>

            {/* Certificaciones */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎓 Certificaciones (separadas por comas)
              </label>
              <input
                type="text"
                name="certifications"
                value={formData.certifications}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg transition ${
                  isEditing ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-gray-50 text-gray-600'
                }`}
                placeholder="Ej: Licenciatura en Educación, Certificado TEFL"
              />
            </div>
          </div>

          {/* Biografía */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Biografía / Acerca de mí
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg resize-none transition ${
                isEditing ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-gray-50 text-gray-600'
              }`}
              rows="5"
              placeholder="Cuéntales a los estudiantes sobre ti, tu experiencia, especialidades y por qué deberían elegirti como su tutor..."
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
          </div>

          {/* Metodología de Enseñanza */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎯 Metodología de Enseñanza
            </label>
            <textarea
              name="teachingMethodology"
              value={formData.teachingMethodology}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg resize-none transition ${
                isEditing ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-gray-50 text-gray-600'
              }`}
              rows="4"
              placeholder="Describe cómo enseñas, tu enfoque pedagógico, técnicas, métodos interactivos que usas..."
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
          </div>

          {/* Botones de Acción */}
          {isEditing && (
            <div className="flex gap-4 border-t pt-8">
              <button
                onClick={handleManualSave}
                disabled={isSaving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </>
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 rounded-lg transition"
              >
                <X className="w-5 h-5 inline mr-2" />
                Cancelar
              </button>
            </div>
          )}

          {/* Estado de Auto-guardado */}
          {isEditing && (
            <div className="mt-4 flex items-center justify-between text-sm">
              {isSaving && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Auto-guardando cambios...</span>
                </div>
              )}
              {lastSaved && !isSaving && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Último guardado: hace unos segundos</span>
                </div>
              )}
              {saveError && (
                <div className="text-red-600 text-sm">{saveError}</div>
              )}
            </div>
          )}
          )}
        </div>

        {/* Additional Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/tutor/availability')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
          >
            📅 Mi Disponibilidad
          </button>
          <button
            onClick={() => navigate('/tutor-dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
          >
            🎯 Volver al Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
          >
            🏠 Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
