import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import NewsView from '@/views/NewsView.vue'

const LoginView = () => import('@/views/LoginView.vue')
const StudentProfileView = () => import('@/views/StudentProfileView.vue')
const StudentEditView = () => import('@/views/StudentEditView.vue')
const EnterpriseProfileView = () => import('@/views/EnterpriseProfileView.vue')

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/news', name: 'news', component: NewsView },
  { path: '/login', name: 'login', component: LoginView },
  {
    path: '/talento/:uuid',
    name: 'student-profile',
    component: StudentProfileView,
    props: true,
  },
  {
    path: '/talento/:uuid/editar',
    name: 'student-edit',
    component: StudentEditView,
    props: true,
  },
  {
    path: '/empresa/:uuid',
    name: 'enterprise-profile',
    component: EnterpriseProfileView,
    props: true,
  },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
