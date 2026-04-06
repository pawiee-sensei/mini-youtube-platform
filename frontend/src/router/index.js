import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../store/auth';

import HomeView from '../../views/HomeView.vue';
import LoginView from '../../views/LoginView.vue';
import RegisterView from '../../views/RegisterView.vue';
import DashboardView from '../../views/DashboardView.vue';
import ProfileView from '../../views/ProfileView.vue';
import WatchView from '../../views/WatchView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/watch/:id', component: WatchView },
  {
    path: '/dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:id',
    component: ProfileView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth();
  const loggedIn = isAuthenticated();

  if (to.meta.requiresAuth && !loggedIn) {
    return next('/login');
  }

  next();
});

export default router;
