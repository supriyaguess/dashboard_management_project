import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || { message: 'Network error' })
);

export const leadsApi = {
  getAll: (params) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const reportsApi = {
  getFiltered: (params) => api.get('/reports', { params }),
  exportXlsx: (params) => {
    const query = new URLSearchParams(params).toString();
    window.open(`/api/reports/export/xlsx?${query}`, '_blank');
  },
  exportCsv: (params) => {
    const query = new URLSearchParams(params).toString();
    window.open(`/api/reports/export/csv?${query}`, '_blank');
  },
};

export default api;
