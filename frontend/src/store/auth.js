import { ref } from 'vue';
import api from '../services/api';

// ✅ GLOBAL STATE (outside function = shared)
const user = ref(null);
const token = ref(localStorage.getItem('token') || null);

// ✅ Initialize user if token exists (optional improvement later)

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
    login,
    register,
    logout,
    isAuthenticated
  };
};