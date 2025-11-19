import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { AlertCircle, CheckCircle, Loader, Save, X } from 'lucide-react';

export default function StudentProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    educationLevel: '',
    subjectsInterested: '',
    learningStyle: '',
    location: '',
    bio: ''
  });

  const [profileStats, setProfileStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalSpent: 0,
    avgTutorRating: 0
  });

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const profileRes = await api.get('/students/profile');
      if (profileRes.data?.data) {
        const studentData = profileRes.data.data;
        setFormData(prev => ({
          ...prev,
          educationLevel: studentData.educationLevel || '',
          subjectsInterested: Array.isArray(studentData.subjectsInterested)
            ? studentData.subjectsInterested.join(', ')
            : studentData.subjectsInterested || '',
          learningStyle: studentData.learningStyle || '',
          location: studentData.location || '',
          bio: studentData.bio || ''
        }));

        setProfileStats({
          totalSessions: studentData.totalSessions || 0,
          completedSessions: studentData.completedSessions || 0,
          totalSpent: studentData.totalSpent || 0,
          avgTutorRating: 4.5
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.warn('Perfil de estudiante no completado aún');
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const dataToSend = {
        educationLevel: formData.educationLevel,
        subjectsInterested: formData.subjectsInterested
          .split(',')
          .map(s => s.trim())
          .filter(s => s),
        learningStyle: formData.learningStyle,
        location: formData.location,
        bio: formData.bio
      };

      await api.post('/students/profile', dataToSend);
      setSuccess('✓ Perfil actualizado exitosamente');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
      fetchStudentProfile();
    } catch (err) {
      console.error('Error guardando perfil:', err);
      setError(err.response?.data?.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
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
            onClick={() => navigate('/student-dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-1"
          >
            ← Volver al Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Mi Perfil de Estudiante</h1>
          <p className="text-gray-600 mt-2">Administra tu información y preferencias de aprendizaje</p>
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
              <p className="text-gray-600 text-sm font-medium">Total de Sesiones</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{profileStats.totalSessions}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Completadas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{profileStats.completedSessions}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total Gastado</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${profileStats.totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Rating Promedio</p>
              <p className="text-3xl font-bold text-yellow-500 mt-2">⭐ {profileStats.avgTutorRating.toFixed(1)}</p>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Información Personal</h2>
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

            {/* Nivel Educativo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎓 Nivel Educativo
              </label>
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg transition ${
                  isEditing ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-gray-50 text-gray-600'
                }`}
              >
                <option value="">Selecciona un nivel</option>
                <option value="primaria">Primaria</option>
                <option value="secundaria">Secundaria</option>
                <option value="bachillerato">Bachillerato</option>
                <option value="universidad">Universidad</option>
                <option value="postgrado">Postgrado</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Estilo de Aprendizaje */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🧠 Estilo de Aprendizaje
              </label>
              <select
                name="learningStyle"
                value={formData.learningStyle}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg transition ${
                  isEditing ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-gray-50 text-gray-600'
                }`}
              >
                <option value="">Selecciona tu estilo</option>
                <option value="visual">Visual (imágenes, diagramas)</option>
                <option value="auditivo">Auditivo (explicaciones)</option>
                <option value="kinestesico">Kinestésico (práctico)</option>
                <option value="mixto">Mixto</option>
              </select>
            </div>

            {/* Ubicación */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Ubicación (Ciudad, País)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg transition ${
                  isEditing ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-gray-50 text-gray-600'
                }`}
                placeholder="Bogotá, Colombia"
              />
            </div>

            {/* Materias Interesadas */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📚 Materias Interesadas (separadas por comas)
              </label>
              <input
                type="text"
                name="subjectsInterested"
                value={formData.subjectsInterested}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg transition ${
                  isEditing ? 'bg-white focus:ring-2 focus:ring-blue-500' : 'bg-gray-50 text-gray-600'
                }`}
                placeholder="Matemáticas, Inglés, Física, Historia"
              />
            </div>
          </div>

          {/* Biografía */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Acerca de mí (Objetivos y Motivación)
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
              placeholder="Cuéntale a tus tutores sobre tus objetivos de aprendizaje, áreas donde necesitas ayuda, tus metas académicas..."
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
          </div>

          {/* Botones de Acción */}
          {isEditing && (
            <div className="flex gap-4 border-t pt-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
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
        </div>

        {/* Additional Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/tutors/search')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
          >
            🔍 Buscar Tutores
          </button>
          <button
            onClick={() => navigate('/student-dashboard')}
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
