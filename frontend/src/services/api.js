import axios from 'axios';

// CRITICAL: Use localhost for both frontend and backend
const API_BASE_URL = 'http://localhost:8000/api';

// CRITICAL: Set axios defaults for session sharing
axios.defaults.withCredentials = true;

// Enhanced session management
const SessionManager = {
  getSessionId: () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'sessionid') {
        return value;
      }
    }
    return null;
  },
  ensureSession: async () => {
    if (!SessionManager.getSessionId()) {
      try {
        await fetch('http://localhost:8000/api/projects/debug_activity/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('🔧 Session initialized');
      } catch (error) {
        console.log('⚠️ Session initialization failed:', error);
      }
    }
  }
};

// Helper function for image URLs
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '/placeholder-project.jpg';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `http://localhost:8000${imageUrl}`;
};

// Create axios instance with enhanced session handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Enhanced request interceptor
api.interceptors.request.use(
  async (config) => {
    // Ensure session exists before making request
    await SessionManager.ensureSession();
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    // CRITICAL: Force credentials on every request
    config.withCredentials = true;
    const sessionId = SessionManager.getSessionId();
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }

    console.log('🔧 API Request:', config.url, 'Session:', sessionId?.slice(-8));
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const sessionCookie = response.headers['set-cookie']?.find(cookie =>
      cookie.startsWith('sessionid=')
    );
    if (sessionCookie) {
      console.log('🔧 Session cookie received');
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (userData) => api.patch('/auth/profile/', userData),
  logout: () => api.post('/auth/logout/'),
  getMyProjects: () => api.get('/auth/my-projects/'),
  getMyDonations: () => api.get('/auth/my-donations/'),
};

// Enhanced Projects API
export const projectsAPI = {
  getAll: (params) => api.get('/projects/', { params }),
  getProject: (id) => api.get(`/projects/${id}/`),
  getDetail: async (id) => {
    await SessionManager.ensureSession();
    return api.get(`/projects/${id}/`);
  },
  create: (data) => api.post('/projects/', data),
  update: (id, data) => api.patch(`/projects/${id}/`, data),
  updateProject: (id, data) => api.patch(`/projects/${id}/`, data),
  delete: (id) => api.delete(`/projects/${id}/`),

  // Project actions
  donate: (id, amount) => api.post(`/projects/${id}/donate/`, { amount }),
  donateToProject: (id, data) => api.post(`/projects/${id}/donate/`, data),
  rate: (id, rating) => api.post(`/projects/${id}/rate/`, { rating }),
  rateProject: (id, data) => api.post(`/projects/${id}/rate/`, data),

  // Project management
  cancelProject: (id, reason) => api.post(`/projects/${id}/cancel_project/`, { reason }),
  reportProject: (id, reportData) => api.post(`/projects/${id}/report_project/`, reportData),

  // Comments
  getProjectComments: (id) => api.get(`/projects/${id}/comments/`),
  addComment: (id, data) => api.post(`/projects/${id}/comments/`, data),

  // Recommendations and similar projects
  getSimilar: (id) => api.get(`/projects/${id}/similar/`),
  getSimilarProjects: (id) => api.get(`/projects/${id}/similar/`),
  getRecommendations: () => api.get('/projects/get_recommendations/'),

  // Dashboard endpoints
  getPersonalizedDashboard: () => api.get('/projects/personalized_dashboard/'),
  getAnalyticsDashboard: () => api.get('/projects/analytics_dashboard/'),
  getHomepageData: () => api.get('/projects/homepage_data/'),
  getDebugActivity: () => api.get('/projects/debug_activity/'),

  // Categories
  getCategories: () => api.get('/categories/'),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories/'),
  getDetail: (slug) => api.get(`/categories/${slug}/`),
  getWithProjects: () => api.get('/categories/with-projects/'),
  getPopular: () => api.get('/categories/popular/'),
  getProjects: (slug) => api.get(`/categories/${slug}/projects/`),
};

// Tags API
export const tagsAPI = {
  getAll: () => api.get('/tags/'),
  create: (name) => api.post('/tags/', { name }),
  search: (query) => api.get(`/tags/search/?q=${query}`),
  getPopular: () => api.get('/tags/popular/'),
  getProjects: (slug) => api.get(`/tags/${slug}/projects/`),
};

// Comments API
export const commentsAPI = {
  getProjectComments: (projectId) => api.get(`/comments/project/${projectId}/`),
  addComment: (projectId, commentData) => api.post(`/comments/project/${projectId}/`, commentData),
  reportComment: (commentId, reportData) => api.post(`/comments/comment/${commentId}/report/`, reportData),
  updateComment: (commentId, data) => api.patch(`/comments/comment/${commentId}/`, data),
  deleteComment: (commentId) => api.delete(`/comments/comment/${commentId}/`),
  likeComment: (commentId) => api.post(`/comments/comment/${commentId}/like/`),
  unlikeComment: (commentId) => api.delete(`/comments/comment/${commentId}/like/`),
};

// Reports API
export const reportsAPI = {
  reportProject: (projectId, reportData) => api.post(`/projects/${projectId}/report_project/`, reportData),
  reportComment: (commentId, reportData) => api.post(`/comments/comment/${commentId}/report/`, reportData),
  reportUser: (userId, reportData) => api.post(`/users/${userId}/report/`, reportData),
};

export { SessionManager };
export default api;
