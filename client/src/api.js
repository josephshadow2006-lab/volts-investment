import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

export function getAuthToken() {
  return localStorage.getItem('volts_token');
}

export function getSessionUser() {
  const raw = localStorage.getItem('volts_user');
  return raw ? JSON.parse(raw) : null;
}

export function saveSession(user, token) {
  localStorage.setItem('volts_user', JSON.stringify(user));
  localStorage.setItem('volts_token', token);
}

export async function authRequest(path, data) {
  const response = await api.post(path, data);
  return response.data;
}

export async function fetchProducts() {
  const response = await api.get('/products');
  return response.data;
}

export async function fetchDashboard(token) {
  const response = await api.get('/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function purchaseProduct(token, productId) {
  const response = await api.post(
    '/products/purchase',
    { productId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

export async function depositFunds(token, amount) {
  const response = await api.post(
    '/transactions/deposit',
    { amount },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

export async function requestWithdrawal(token, amount) {
  const response = await api.post(
    '/transactions/withdraw',
    { amount },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

export async function requestPasswordReset(email) {
  const response = await api.post('/auth/request-password-reset', { email });
  return response.data;
}

export async function resetPassword(token, password) {
  const response = await api.post('/auth/reset-password', { token, password });
  return response.data;
}

export async function verifyEmail(token) {
  const response = await api.get(`/auth/verify-email/${token}`);
  return response.data;
}

export async function fetchAdminOverview(token) {
  const response = await api.get('/admin/overview', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function fetchAdminWithdrawals(token) {
  const response = await api.get('/admin/withdrawals', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function approveWithdrawal(token, id) {
  const response = await api.post(`/admin/withdrawals/${id}/approve`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function rejectWithdrawal(token, id) {
  const response = await api.post(`/admin/withdrawals/${id}/reject`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
