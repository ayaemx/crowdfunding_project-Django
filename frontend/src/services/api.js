import axios from 'axios';

// Use 127.0.0.1 to match your working login
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - fix token retrieval
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    // Remove Content-Type for FormData to let browser set boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    console.log('API Request:', config.url, 'Token:', token ? 'Present' : 'Missing');
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - fix token key consistency
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // Changed from 'authToken' to 'token'
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls - UNCHANGED
export const authAPI = {
  login: (credentials) => {
    console.log('Attempting login with:', credentials);
    return api.post('/auth/login/', credentials);
  },
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  getMyProjects: () => api.get('/auth/my-projects/'),
  getMyDonations: () => api.get('/auth/my-donations/'),
};

// Projects API - ENHANCED with proper reporting
export const projectsAPI = {
  getAll: (params) => api.get('/projects/', { params }),
  create: (projectData) => api.post('/projects/', projectData),
  getDetail: (id) => api.get(`/projects/${id}/`),
  update: (id, data) => api.put(`/projects/${id}/`, data),
  delete: (id) => api.delete(`/projects/${id}/`),

  // Project management (PDF requirements)
  cancelProject: (id, reason) => api.post(`/projects/${id}/cancel/`, { reason }),

  // FIXED: Project reporting endpoint (PDF requirement)
  reportProject: (id, reportData) => {
    console.log('Reporting project:', id, reportData);
    return api.post(`/projects/${id}/report/`, reportData);
  },

  // Donation and rating - UNCHANGED
  donate: (id, amount) => {
    console.log('Donating to project:', id, 'amount:', amount);
    return api.post(`/projects/${id}/donate/`, { amount });
  },
  rate: (id, rating) => {
    console.log('Rating project:', id, 'rating:', rating);
    return api.post(`/projects/${id}/rate/`, { rating });
  },

  // Discovery - UNCHANGED
  getSimilar: (id) => {
    console.log('Getting similar projects for:', id);
    return api.get(`/projects/${id}/similar/`);
  },

  // Homepage data - UNCHANGED
  getHomepageData: () => {
    console.log('Getting homepage data...');
    return api.get('/projects/homepage_data/');
  },

  search: (query) => api.get(`/projects/?search=${query}`),
};

// Categories API - UNCHANGED
export const categoriesAPI = {
  getAll: () => api.get('/categories/').then(response => {
    // Handle paginated response - extract results array
    if (response.data && response.data.results) {
      return { ...response, data: response.data.results };
    }
    return response;
  }),
  getWithProjects: () => api.get('/categories/with-projects/'),
  getProjects: (slug) => api.get(`/categories/${slug}/projects/`),
};

// Helper function - UNCHANGED
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-project.jpg';
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // If it's a relative path, prepend Django media URL
  return `http://127.0.0.1:8000${imagePath}`;
};

// Tags API - UNCHANGED
export const tagsAPI = {
  getAll: () => api.get('/tags/'),
  search: (query) => api.get(`/tags/search/?q=${query}`),
  getPopular: () => api.get('/tags/popular/'),
};

// Comments API - ENHANCED with better error handling
export const commentsAPI = {
  getProjectComments: (projectId) => {
    console.log('Getting comments for project:', projectId);
    return api.get(`/comments/project/${projectId}/`);
  },

  addComment: (projectId, commentData) => {
    console.log('Adding comment to project:', projectId, commentData);
    return api.post(`/comments/project/${projectId}/`, {
      content: commentData.content,
      parent: commentData.parent || null
    });
  },

  // ENHANCED: Comment reporting with better error handling
  reportComment: (commentId, reportData) => {
    console.log('Reporting comment:', commentId, reportData);

    // Validate data before sending
    if (!reportData.report_type) {
      throw new Error('Report type is required');
    }

    if (!reportData.description || reportData.description.trim().length < 10) {
      throw new Error('Description must be at least 10 characters long');
    }

    return api.post(`/comments/comment/${commentId}/report/`, reportData);
  },
};


export default api;
