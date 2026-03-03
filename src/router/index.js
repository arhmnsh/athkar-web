import { createRouter, createWebHistory } from 'vue-router';

import AthkarListView from '../views/AthkarListView.vue';
import AthkarDetailsView from '../views/AthkarDetailsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'athkar-list',
      component: AthkarListView,
    },
    {
      path: '/athkar/:id',
      name: 'athkar-details',
      component: AthkarDetailsView,
      props: true,
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
