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
  updateTest: (id, data) => api.put(`/voting/tests/${id}`, data),
  deleteTest: (id) => api.delete(`/voting/tests/${id}`),
};

// Forum APIs
export const forumAPI = {
  getPosts: (params) => api.get('/forum/posts', { params }),
  getPost: (id) => api.get(`/forum/posts/${id}`),
  createPost: (data) => api.post('/forum/posts', data),
  likePost: (id, data) => api.post(`/forum/posts/${id}/like`, data),
  replyToPost: (id, data) => api.post(`/forum/posts/${id}/reply`, data),
  deletePost: (id) => api.delete(`/forum/posts/${id}`),
};

// Blog APIs
export const blogAPI = {
  getPosts: (params) => api.get('/blog/posts', { params }),
  getPost: (id) => api.get(`/blog/posts/${id}`),
  create: (data) => api.post('/blog/posts', data),
  update: (id, data) => api.put(`/blog/posts/${id}`, data),
  delete: (id) => api.delete(`/blog/posts/${id}`),
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

// Subscription APIs
export const subscriptionAPI = {
  getTiers: () => api.get('/subscriptions/tiers'),
  getTier: (id) => api.get(`/subscriptions/tiers/${id}`),
  createTier: (data) => api.post('/subscriptions/tiers', data),
  updateTier: (id, data) => api.put(`/subscriptions/tiers/${id}`, data),
  deleteTier: (id) => api.delete(`/subscriptions/tiers/${id}`),
  createOrder: (tierId, userId) => api.post(`/subscriptions/create-order?tier_id=${tierId}&user_id=${userId}`),
  verifyPayment: (data) => api.post('/subscriptions/verify-payment', data),
  getUserStatus: (userId) => api.get(`/subscriptions/user/${userId}/status`),
  getUserHistory: (userId) => api.get(`/subscriptions/user/${userId}/history`),
};

// Donation APIs
export const donationAPI = {
  createOrder: (data) => api.post('/donations/create-order', data),
  verifyPayment: (data) => api.post('/donations/verify-payment', data),
  getStats: () => api.get('/donations/stats'),
  getRecent: (limit) => api.get(`/donations/recent?limit=${limit || 10}`),
};

// Password Reset APIs
export const passwordResetAPI = {
  requestReset: (email) => api.post('/password-reset/request-reset', { email }),
  verifyToken: (email, reset_token) => api.post('/password-reset/verify-token', { email, reset_token }),
  resetPassword: (email, reset_token, new_password) => api.post('/password-reset/reset-password', { email, reset_token, new_password }),
};

export default api;
