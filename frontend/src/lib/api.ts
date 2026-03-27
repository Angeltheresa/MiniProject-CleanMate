import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// JWT token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cleanmate_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cleanmate_token');
      localStorage.removeItem('cleanmate_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ───────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  signup: (data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    role: string;
    phone: string;
    address: string;
  }) => api.post('/auth/signup', data),

  getMe: () => api.get('/auth/me'),

  updateProfile: (data: {
    fullName?: string;
    email?: string;
    username?: string;
    phone?: string;
    address?: string;
    avatar?: string;
  }) => api.put('/auth/profile', data),

  changePassword: (data: { currentPassword?: string; newPassword: string }) =>
    api.put('/auth/change-password', data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  updateRole: (role: string) =>
    api.put('/auth/role', { role }),

  googleLoginUrl: () => `${API_BASE_URL}/auth/google`,
};

// ─── Customer API ───────────────────────────────────────────────────────────
export const customerAPI = {
  getDashboard: () => api.get('/customer/dashboard'),
  getBookings: () => api.get('/customer/bookings'),
  createBooking: (data: {
    serviceType: string;
    variant: string;
    date: string;
    isEmergency?: boolean;
    address?: string;
    estimateAmount?: number;
  }) => api.post('/customer/bookings', data),
  getBookingTracking: (id: string) => api.get(`/customer/bookings/${id}/tracking`),
  getNearbyAgents: (params?: { lat?: number; lng?: number; distance?: number; minRating?: number }) =>
    api.get('/customer/agents/nearby', { params }),
  getAgentProfile: (id: string) => api.get(`/customer/agents/${id}/profile`),
  getBookingReviewStatus: (bookingId: string) => api.get(`/customer/bookings/${bookingId}/review-status`),
  submitReview: (data: {
    bookingId?: string;
    agentId?: string;
    rating: number;
    comment: string;
  }) => api.post('/customer/reviews', data),
  getComplaints: () => api.get('/customer/complaints'),
  submitComplaint: (data: { subject: string; description: string }) =>
    api.post('/customer/complaints', data),
  getEstimate: (area: number, serviceType?: string, variant?: string) =>
    api.get('/customer/estimate', { params: { area, serviceType, variant } }),
  reverseGeocode: (lat: number, lng: number) =>
    api.get('/maps/reverse-geocode', { params: { lat, lng } }),
};

// ─── Agent API ──────────────────────────────────────────────────────────────
export const agentAPI = {
  getDashboard: () => api.get('/agent/dashboard'),
  getRequests: () => api.get('/agent/requests'),
  updateRequest: (id: string, action: 'approved' | 'rejected') =>
    api.put(`/agent/requests/${id}`, { action }),
  getAvailability: () => api.get('/agent/availability'),
  setAvailability: (available: boolean) =>
    api.put('/agent/availability', { available }),
  getAttendance: () => api.get('/agent/attendance'),
  markAttendance: () => api.post('/agent/attendance'),
  getPortfolio: () => api.get('/agent/portfolio'),
  uploadPortfolio: (formData: FormData) =>
    api.post('/agent/portfolio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getDocuments: () => api.get('/agent/documents'),
  uploadDocument: (formData: FormData) =>
    api.post('/agent/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateBookingStatus: (id: string, status: string) =>
    api.put(`/agent/bookings/${id}/status`, { status }),
  getProfile: () => api.get('/agent/profile'),
  updateProfile: (data: { specialization?: string }) =>
    api.put('/agent/profile', data),
};

// ─── Admin API ──────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getAgentsPending: () => api.get('/admin/agents/pending'),
  verifyAgent: (id: string, action: 'verified' | 'rejected') =>
    api.put(`/admin/agents/${id}/verify`, { action }),
  getBookings: () => api.get('/admin/bookings'),
  getComplaints: () => api.get('/admin/complaints'),
  updateComplaintStatus: (id: string, status: string) =>
    api.put(`/admin/complaints/${id}`, { status }),
  getAnalytics: () => api.get('/admin/analytics'),
};

// ─── Maps API ───────────────────────────────────────────────────────────────
export const mapsAPI = {
  geocode: (address: string) => api.post('/maps/geocode', { address }),
  getNearbyAgents: (lat: number, lng: number, distance?: number) =>
    api.get('/maps/nearby-agents', { params: { lat, lng, distance } }),
};

export default api;
