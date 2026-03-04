import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { initPosthogAnalytics } from './analytics/posthog';
import './styles/base.css';

initPosthogAnalytics(router);

createApp(App).use(router).mount('#app');
