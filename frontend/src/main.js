import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { useAuth } from './store/auth';

const { initialize } = useAuth();

await initialize();

createApp(App)
  .use(router)
  .mount('#app');
