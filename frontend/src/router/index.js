import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../store/auth';

import LoginView from '../../views/LoginView.vue';
import RegisterView from '../../views/RegisterView.vue';
import DashboardView from '../../views/DashboardView.vue';

const routes = [
  { path: '/', component: LoginView },
  { path: '/register', component: RegisterView },
  {
    path: '/dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth();

  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/');
  } else {
    next();
  }
});

export default router;