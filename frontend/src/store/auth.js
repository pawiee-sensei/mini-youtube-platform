import { ref } from 'vue';
import api from '../services/api';

const user = ref(null);
const token = ref(localStorage.getItem('token') || null);
const initialized = ref(false);

const initialize = async () => {
  if (!token.value) {
    initialized.value = true;
    return;
  }

  try {
    const res = await api.get('/auth/me');
    user.value = res.data.user;
  } catch (err) {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  } finally {
    initialized.value = true;
  }
};

export const useAuth = () => {
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    token.value = res.data.token;
    user.value = res.data.user;

    localStorage.setItem('token', token.value);
  };

  const register = async (data) => {
    await api.post('/auth/register', data);
  };

  const logout = () => {
    token.value = null;
    user.value = null;

    localStorage.removeItem('token');
  };

  const isAuthenticated = () => !!token.value;

  return {
    user,
    token,
    initialized,
    initialize,
    login,
    register,
    logout,
    isAuthenticated
  };
};
