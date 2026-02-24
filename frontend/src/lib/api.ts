import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // 10s instead of 30s — fail fast on slow networks
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('lifelink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('lifelink_refresh');
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          localStorage.setItem('lifelink_token', data.data.accessToken);
          localStorage.setItem('lifelink_refresh', data.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('lifelink_token');
        localStorage.removeItem('lifelink_refresh');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// === Auth API ===
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  verify2FA: (data: any) => api.post('/auth/verify-2fa', data),
  setup2FA: () => api.post('/auth/setup-2fa'),
  enable2FA: (data: any) => api.post('/auth/enable-2fa', data),
  refreshToken: (data: any) => api.post('/auth/refresh', data),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/auth/profile'),
  changePassword: (data: any) => api.post('/auth/change-password', data),
};

// === Appointments ===
export const appointmentAPI = {
  create: (data: any) => api.post('/appointments', data),
  list: (params?: any) => api.get('/appointments', { params }),
  getById: (id: string) => api.get(`/appointments/${id}`),
  confirm: (id: string) => api.patch(`/appointments/${id}/confirm`),
  cancel: (id: string, data: any) => api.patch(`/appointments/${id}/cancel`, data),
  reschedule: (id: string, data: any) => api.patch(`/appointments/${id}/reschedule`, data),
  getSlots: (params: any) => api.get('/appointments/available-slots', { params }),
};

// === Patients ===
export const patientAPI = {
  list: (params?: any) => api.get('/patients', { params }),
  getById: (id: string) => api.get(`/patients/${id}`),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data),
  createRecord: (id: string, data: any) => api.post(`/patients/${id}/records`, data),
  createNote: (id: string, data: any) => api.post(`/patients/${id}/notes`, data),
  assessRisk: (id: string) => api.post(`/patients/${id}/risk-assessment`),
  getProgress: (id: string) => api.get(`/patients/${id}/progress`),
};

// === Chat ===
export const chatAPI = {
  send: (data: any) => api.post('/chat/message', data),
  getConversation: (id: string) => api.get(`/chat/conversation/${id}`),
  submitIntake: (data: any) => api.post('/chat/intake', data),
};

// === Payments ===
export const paymentAPI = {
  initiateMpesa: (data: any) => api.post('/payments/mpesa/initiate', data),
  checkStatus: (id: string) => api.get(`/payments/status/${id}`),
  list: (params?: any) => api.get('/payments', { params }),
  getInvoices: (params?: any) => api.get('/payments/invoices', { params }),
};

// === Dashboard ===
export const dashboardAPI = {
  analytics: () => api.get('/dashboard/analytics'),
  revenueChart: (params?: any) => api.get('/dashboard/revenue-chart', { params }),
  geoDistribution: () => api.get('/dashboard/geo-distribution'),
  corporateAnalytics: () => api.get('/dashboard/corporate-analytics'),
  growthForecast: () => api.get('/dashboard/growth-forecast'),
  systemHealth: () => api.get('/dashboard/system-health'),
  auditLogs: (params?: any) => api.get('/dashboard/audit-logs', { params }),
  riskAlerts: (params?: any) => api.get('/dashboard/risk-alerts', { params }),
  resolveAlert: (id: string, data?: any) => api.patch(`/dashboard/risk-alerts/${id}/resolve`, data),
  recentActivity: () => api.get('/dashboard/recent-activity'),
  // Doctor management (admin)
  createDoctor: (data: any) => api.post('/dashboard/doctors', data),
  listDoctors: () => api.get('/dashboard/doctors'),
  getDoctorDetail: (id: string) => api.get(`/dashboard/doctors/${id}`),
  updateDoctor: (id: string, data: any) => api.put(`/dashboard/doctors/${id}`, data),
  // Patient management (admin)
  listPatients: (params?: any) => api.get('/dashboard/patients', { params }),
  getPatientDetail: (id: string) => api.get(`/dashboard/patients/${id}`),
  assignPatient: (data: any) => api.post('/dashboard/patients/assign', data),
  // User management
  toggleUserActive: (id: string) => api.patch(`/dashboard/users/${id}/toggle-active`),
  resetUserPassword: (id: string) => api.post(`/dashboard/users/${id}/reset-password`),
  // Telehealth admin
  telehealthSessions: () => api.get('/dashboard/telehealth-sessions'),
  // Webinar management
  listWebinars: () => api.get('/dashboard/webinars'),
  createWebinar: (data: any) => api.post('/dashboard/webinars', data),
  updateWebinar: (id: string, data: any) => api.put(`/dashboard/webinars/${id}`, data),
  // Invoice management
  createInvoice: (data: any) => api.post('/dashboard/invoices', data),
  listInvoices: (params?: any) => api.get('/dashboard/invoices', { params }),
  // Doctor dashboard
  doctorDashboard: () => api.get('/dashboard/doctor'),
  doctorPatients: () => api.get('/dashboard/doctor/patients'),
  // Patient dashboard
  patientDashboard: () => api.get('/dashboard/patient'),
  recordWellness: (data: any) => api.post('/dashboard/patient/wellness', data),
  // Corporate dashboard
  corporateDashboard: () => api.get('/dashboard/corporate'),
};

// === Corporate ===
export const corporateAPI = {
  create: (data: any) => api.post('/corporate', data),
  list: (params?: any) => api.get('/corporate', { params }),
  getById: (id: string) => api.get(`/corporate/${id}`),
  update: (id: string, data: any) => api.put(`/corporate/${id}`, data),
  onboardEmployees: (id: string, data: any) => api.post(`/corporate/${id}/employees`, data),
  getUsageReport: (id: string) => api.get(`/corporate/${id}/usage`),
  getHRDashboard: (id: string) => api.get(`/corporate/${id}/hr-dashboard`),
};

// === Webinars ===
export const webinarAPI = {
  create: (data: any) => api.post('/webinars', data),
  list: (params?: any) => api.get('/webinars', { params }),
  getById: (id: string) => api.get(`/webinars/${id}`),
  register: (id: string) => api.post(`/webinars/${id}/register`),
};

// === Telehealth ===
export const telehealthAPI = {
  join: (sessionId: string) => api.post(`/telehealth/${sessionId}/join`),
  start: (sessionId: string) => api.post(`/telehealth/${sessionId}/start`),
  end: (sessionId: string) => api.post(`/telehealth/${sessionId}/end`),
};

// === Public ===
export const publicAPI = {
  services: () => api.get('/services'),
  serviceBySlug: (slug: string) => api.get(`/services/${slug}`),
  blogPosts: (params?: any) => api.get('/blog', { params }),
  blogBySlug: (slug: string) => api.get(`/blog/${slug}`),
  corporateJoin: (data: any) => api.post('/corporate/join', data),
  doctors: () => api.get('/doctors'),
};

// === Notifications ===
export const notificationAPI = {
  list: (params?: any) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// === Content Management (Admin) ===
export const contentAPI = {
  listBlog: (params?: any) => api.get('/content/blog', { params }),
  createBlog: (data: FormData) => api.post('/content/blog', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateBlog: (id: string, data: FormData) => api.put(`/content/blog/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteBlog: (id: string) => api.delete(`/content/blog/${id}`),
  uploadMedia: (data: FormData) => api.post('/content/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  generateContent: (data: any) => api.post('/content/generate', data),
};
