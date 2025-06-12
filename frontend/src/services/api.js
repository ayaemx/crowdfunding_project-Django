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

// Authentication API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data), // This will now handle FormData properly
  getMyProjects: () => api.get('/auth/my-projects/'),
  getMyDonations: () => api.get('/auth/my-donations/'),
};

// Rest of your API endpoints remain the same...
export const projectsAPI = {
  getAll: (params) => api.get('/projects/', { params }),
  create: (projectData) => api.post('/projects/', projectData),
  getDetail: (id) => api.get(`/projects/${id}/`),
  update: (id, data) => api.put(`/projects/${id}/`, data),
  delete: (id) => api.delete(`/projects/${id}/`),
  donate: (id, amount) => api.post(`/projects/${id}/donate/`, { amount }),
  rate: (id, rating) => api.post(`/projects/${id}/rate/`, { rating }),
  getSimilar: (id) => api.get(`/projects/${id}/similar/`),
  getHomepageData: () => api.get('/projects/homepage_data/'),
  search: (query) => api.get(`/projects/?search=${query}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories/'),
  getWithProjects: () => api.get('/categories/with-projects/'),
  getProjects: (slug) => api.get(`/categories/${slug}/projects/`),
};

export const tagsAPI = {
  getAll: () => api.get('/tags/'),
  search: (query) => api.get(`/tags/search/?q=${query}`),
  getPopular: () => api.get('/tags/popular/'),
};

export const commentsAPI = {
  getProjectComments: (projectId) => api.get(`/comments/project/${projectId}/`),
  addComment: (projectId, comment) => api.post(`/comments/project/${projectId}/`, comment),
  reportComment: (commentId) => api.post(`/comments/comment/${commentId}/report/`),
};

export default api;
