import { api } from './api';

const id = value => encodeURIComponent(value);
const query = values => {
  const params = new URLSearchParams(Object.entries(values || {}).filter(([, v]) => v !== undefined && v !== ''));
  return params.size ? `?${params}` : '';
};
const resource = path => ({
  get: key => api(`${path}/${id(key)}`),
  create: body => api(path, 'POST', body),
  update: (key, body) => api(`${path}/${id(key)}`, 'PATCH', body),
});

export const backend = {
  health: () => api('/health'),
  auth: {
    login: body => api('/auth/login', 'POST', body),
    signup: body => api('/auth/signup', 'POST', body),
    google: credential => api('/auth/google', 'POST', { credential }),
    profile: () => api('/auth/profile'),
  },
  pets: {
    ...resource('/pets'),
    list: () => api('/pets'),
    update: (key, body) => api(`/pets/${id(key)}`, 'PUT', body),
    remove: key => api(`/pets/${id(key)}`, 'DELETE'),
  },
  doctors: {
    ...resource('/doctors'),
    list: filters => api('/doctors' + query(filters)),
    admin: filters => api('/doctors/admin' + query(filters)),
    mine: () => api('/doctors/me'),
    status: (key, body) => api(`/doctors/${id(key)}/status`, 'PATCH', body),
    remove: key => api(`/doctors/${id(key)}`, 'DELETE'),
  },
  appointments: {
    get: key => api(`/appointments/${id(key)}`),
    create: body => api('/appointments', 'POST', body),
    list: (scope = 'mine', filters) => api(`/appointments/${id(scope)}` + query(filters)),
    reschedule: (key, body) => api(`/appointments/${id(key)}/reschedule`, 'PATCH', body),
    status: (key, status) => api(`/appointments/${id(key)}/status`, 'PATCH', { status }),
    cancel: (key, reason) => api(`/appointments/${id(key)}/cancel`, 'PATCH', { reason }),
  },
  prescriptions: {
    ...resource('/prescriptions'),
    list: (scope = 'mine', filters) => api(`/prescriptions/${id(scope)}` + query(filters)),
    appointment: key => api(`/prescriptions/appointment/${id(key)}`),
    revoke: (key, reason) => api(`/prescriptions/${id(key)}/revoke`, 'PATCH', { reason }),
  },
  medical: {
    ...resource('/medical-history'),
    list: (scope = 'mine', filters) => api(`/medical-history/${id(scope)}` + query(filters)),
    timeline: key => api(`/medical-history/pet/${id(key)}`),
    revoke: (key, reason) => api(`/medical-history/${id(key)}/revoke`, 'PATCH', { reason }),
  },
  dashboard: role => api(`/dashboard/${id(role)}`),
  models: {
    ...resource('/ai/models'),
    list: filters => api('/ai/models' + query(filters)),
    selected: filters => api('/ai/models/selected' + query(filters)),
    recommendations: filters => api('/ai/models/recommendations' + query(filters)),
    admin: () => api('/ai/models/admin'),
    refresh: provider => api('/ai/models/refresh', 'POST', { provider }),
    refreshHistory: filters => api('/ai/models/refresh-history' + query(filters)),
    setDefault: (key, useCase) => api(`/ai/models/${id(key)}/default`, 'PATCH', { useCase }),
  },
  providerStatus: provider => api(`/ai/providers/${id(provider)}/status`),
  chat: {
    message: body => api('/ai/chat/message', 'POST', body),
    suggestions: body => api('/ai/chat/suggestions', 'POST', body),
    conversations: filters => api('/ai/chat/conversations' + query(filters)),
    conversation: key => api(`/ai/chat/conversations/${id(key)}`),
    archive: key => api(`/ai/chat/conversations/${id(key)}/archive`, 'PATCH'),
  },
};
