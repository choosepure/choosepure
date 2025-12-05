import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Waitlist APIs
export const waitlistAPI = {
  join: (data) => api.post('/waitlist', data),
  getCount: () => api.get('/waitlist/count'),
};

// Test Reports APIs
export const reportsAPI = {
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
};

// Voting APIs
export const votingAPI = {
  getUpcomingTests: () => api.get('/voting/upcoming-tests'),
  vote: (data) => api.post('/voting/vote', data),
  createTest: (data) => api.post('/voting/create-test', data),
};

// Forum APIs
export const forumAPI = {
  getPosts: (params) => api.get('/forum/posts', { params }),
  getPost: (id) => api.get(`/forum/posts/${id}`),
  createPost: (data) => api.post('/forum/posts', data),
  likePost: (id, data) => api.post(`/forum/posts/${id}/like`, data),
  replyToPost: (id, data) => api.post(`/forum/posts/${id}/reply`, data),
};

// Blog APIs
export const blogAPI = {
  getPosts: (params) => api.get('/blog/posts', { params }),
  getPost: (id) => api.get(`/blog/posts/${id}`),
  create: (data) => api.post('/blog/posts', data),
};

// Newsletter APIs
export const newsletterAPI = {
  subscribe: (data) => api.post('/newsletter/subscribe', data),
  unsubscribe: (data) => api.post('/newsletter/unsubscribe', data),
};

// Stats APIs
export const statsAPI = {
  getCommunityStats: () => api.get('/stats/community'),
  getUserStats: (userId) => api.get(`/stats/user/${userId}`),
};

export default api;
