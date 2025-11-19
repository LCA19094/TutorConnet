import axios from 'axios';

// Make the API base flexible: allow VITE_API_URL to be either the server or include /api/v1
const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Ensure the base ends with /api/v1 only once
const API_URL = envUrl.endsWith('/api/v1') ? envUrl : envUrl.replace(/\/$/, '') + '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token en requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me')
};

export const tutorsAPI = {
  list: (page = 1, limit = 10) => api.get(`/tutors?page=${page}&limit=${limit}`),
  search: (query, minRating = 0, page = 1) => api.get(`/tutors/search?search=${query}&minRating=${minRating}&page=${page}`),
  // Backward-compatible helper for older frontend code that passed a filters object
  searchTutors: (filters = {}, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.minRating) params.append('minRating', filters.minRating);
    if (filters.maxRate) params.append('maxRate', filters.maxRate);
    if (filters.minRate) params.append('minRate', filters.minRate);
    if (filters.verifiedOnly !== undefined) params.append('verified', filters.verifiedOnly);
    params.append('page', page);
    params.append('limit', limit);
    return api.get(`/tutors/search?${params.toString()}`);
  },
  featured: () => api.get('/tutors/featured'),
  getProfile: (id) => api.get(`/tutors/${id}`),
  getStats: (id) => api.get(`/tutors/${id}/stats`),
  updateProfile: (id, data) => api.put(`/tutors/${id}`, data)
};

export const sessionsAPI = {
  list: (page = 1, limit = 10) => api.get(`/sessions?page=${page}&limit=${limit}`),
  getMySessions: (filters = {}) => api.get('/sessions', { params: filters }),
  getStudentSessions: (studentId = null, filters = {}) => {
    if (studentId) {
      return api.get(`/sessions/student/${studentId}`, { params: filters });
    }
    // Si no se pasa studentId, obtener las sesiones del usuario autenticado
    return api.get('/sessions', { params: filters });
  },
  getTutorSessions: (tutorId = null, filters = {}) => {
    if (tutorId) {
      return api.get(`/sessions/tutor/${tutorId}`, { params: filters });
    }
    // Si no se pasa tutorId, obtener las sesiones del usuario autenticado
    return api.get('/sessions', { params: filters });
  },
  create: (data) => api.post('/sessions', data),
  getDetail: (id) => api.get(`/sessions/${id}`),
  update: (id, data) => api.put(`/sessions/${id}`, data),
  confirm: (id) => api.post(`/sessions/${id}/confirm`, {}),
  start: (id) => api.post(`/sessions/${id}/start`, {}),
  end: (id, data) => api.post(`/sessions/${id}/end`, data),
  cancel: (id, reason) => api.post(`/sessions/${id}/cancel`, { reason })
};

export const ratingsAPI = {
  create: (data) => api.post('/ratings', data),
  getTutorReviews: (tutorId, page = 1, sortBy = 'recent') => 
    api.get(`/ratings/tutor/${tutorId}?page=${page}&sortBy=${sortBy}`),
  getTutorStats: (tutorId) => api.get(`/ratings/tutor/${tutorId}/stats`),
  getTutorReputation: (tutorId) => api.get(`/ratings/tutor/${tutorId}/reputation`),
  getTopTutors: (limit = 10) => api.get(`/ratings/top-tutors?limit=${limit}`),
  markHelpful: (ratingId) => api.post(`/ratings/${ratingId}/helpful`, {})
};

export const availabilityAPI = {
  setSchedule: (data) => api.post('/availability/schedule', data),
  getAvailability: (tutorId) => api.get(`/availability/${tutorId}`),
  updateDay: (dayOfWeek, data) => api.put(`/availability/day/${dayOfWeek}`, data),
  blockTime: (data) => api.post('/availability/block', data),
  getBlockedTimes: (tutorId) => api.get(`/availability/${tutorId}/blocked`),
  unblock: (blockedTimeId) => api.delete(`/availability/block/${blockedTimeId}`),
  getSlots: (tutorId, date, duration = 60) => 
    api.get(`/availability/${tutorId}/slots?date=${date}&duration=${duration}`),
  searchAvailable: (date, time, duration, subject) => 
    api.get(`/availability/search?date=${date}&time=${time}&duration=${duration}&subject=${subject}`)
};

export const subjectsAPI = {
  list: (page = 1, limit = 10, category = null) => 
    api.get(`/subjects?page=${page}&limit=${limit}${category ? `&category=${category}` : ''}`),
  search: (query) => api.get(`/subjects/search?query=${query}`),
  getCategories: () => api.get('/subjects/categories'),
  getDetail: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
  seed: () => api.post('/subjects/seed', {})
};

// Aliases for backward compatibility
export const sessionAPI = sessionsAPI;
export const tutorAPI = tutorsAPI;
export const ratingAPI = ratingsAPI;

export { api };
export default api;

// Backward-compatibility: older code may call these names
// Provide aliases so existing components keep working
if (typeof tutorAPI.getTutorById === 'undefined') {
  tutorAPI.getTutorById = (id) => tutorAPI.getProfile(id);
}

if (typeof ratingAPI.getTutorRatings === 'undefined') {
  ratingAPI.getTutorRatings = (id, page = 1) => ratingAPI.getTutorReviews(id, page);
}
