import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import NewsView from '@/views/NewsView.vue'

const LoginView = () => import('@/views/LoginView.vue')
const StudentProfileView = () => import('@/views/StudentProfileView.vue')
const StudentEditView = () => import('@/views/StudentEditView.vue')
const EnterpriseProfileView = () => import('@/views/EnterpriseProfileView.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
  {
    path: '/news',
    name: 'news',
    component: NewsView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/talent/:uuid',
    name: 'student-profile',
    component: StudentProfileView,
    props: true,
  },
  {
    path: '/talent/:uuid/editar',
    name: 'student-edit',
    component: StudentEditView,
    props: true,
  },
  {
    path: '/enterprise/:uuid',
    name: 'enterprise-profile',
    component: EnterpriseProfileView,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
