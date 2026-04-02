import { ref } from 'vue';
import api from '../services/api';

const user = ref(null);
const token = ref(localStorage.getItem('token') || null);

export const useAuth = () => {

 const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });

    token.value = res.data.token;
    user.value = res.data.user;

    localStorage.setItem('token', token.value);
  } catch (err) {
    throw err; // IMPORTANT: allow UI to catch
  }
};

const register = async (data) => {
  try {
    await api.post('/auth/register', data);
  } catch (err) {
    throw err;
  }
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
    login,
    register,
    logout,
    isAuthenticated
  };
};