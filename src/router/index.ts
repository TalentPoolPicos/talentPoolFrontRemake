import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
<<<<<<< Updated upstream
import AboutView from "../views/AboutView.vue";
=======
import AboutView from '../views/AboutView.vue'
import NewsView from '../views/NewsView.vue'
>>>>>>> Stashed changes

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
<<<<<<< Updated upstream
    }
=======
    },
    {
      path: '/news',
      name: 'news',
      component: NewsView,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
>>>>>>> Stashed changes
  ],
})

export default router
