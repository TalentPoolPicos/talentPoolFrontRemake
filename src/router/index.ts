import { createRouter, createWebHistory } from 'vue-router'

// Views principais
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import NewsView from '@/views/NewsView.vue'

// Autenticação e perfis
import SignInView from '@/views/SignInView.vue'
import ProfileView from '@/views/ProfileView.vue'

// Novas telas de registro
import StudentRegister from '@/views/StudentRegister.vue'
import EnterpriseRegister from '@/views/EnterpriseRegister.vue'

/** Nome canônico das rotas (útil p/ navegacao programática) */
export enum Routes {
  Home = 'home',
  About = 'about',
  News = 'news',

  // autenticação
  SignInStudent = 'signInStudent',
  SignInEnterprise = 'signInEnterprise',

  // registro
  RegisterStudent = 'registerStudent',
  RegisterEnterprise = 'registerEnterprise',

  // perfis
  StudentLoggedProfile = 'studentLoggedProfile',
  StudentProfile = 'studentProfile',
  StudentEditView = 'studentEditView',
  StudentEdit = 'studentEdit',
}

/** Caminhos de URL associados a cada rota */
export const RoutePaths: Record<Routes, string> = {
  [Routes.Home]: '/',
  [Routes.About]: '/about',
  [Routes.News]: '/news',

  [Routes.SignInStudent]: '/signInStudent',
  [Routes.SignInEnterprise]: '/signInEnterprise',

  [Routes.RegisterStudent]: '/register/student',
  [Routes.RegisterEnterprise]: '/register/enterprise',

  [Routes.StudentLoggedProfile]: '/talent',
  [Routes.StudentProfile]: '/talent/:uuid',
  [Routes.StudentEditView]: '/talent/edit',
  [Routes.StudentEdit]: '/talent/edit',
}

const routes = [
  // público
  { path: RoutePaths[Routes.Home],  name: Routes.Home,  component: HomeView },
  { path: RoutePaths[Routes.About], name: Routes.About, component: AboutView },
  { path: RoutePaths[Routes.News],  name: Routes.News,  component: NewsView },

  // autenticação
  {
    path: RoutePaths[Routes.SignInStudent],
    name: Routes.SignInStudent,
    component: SignInView,
    props: { role: 'student' },
  },
  {
    path: RoutePaths[Routes.SignInEnterprise],
    name: Routes.SignInEnterprise,
    component: SignInView,
    props: { role: 'enterprise' },
  },

  // registro
  {
    path: RoutePaths[Routes.RegisterStudent],
    name: Routes.RegisterStudent,
    component: StudentRegister,
  },
  {
    path: RoutePaths[Routes.RegisterEnterprise],
    name: Routes.RegisterEnterprise,
    component: EnterpriseRegister,
  },

  // perfis
  {
    path: RoutePaths[Routes.StudentLoggedProfile],
    name: Routes.StudentLoggedProfile,
    component: ProfileView,
  },
  {
    path: RoutePaths[Routes.StudentProfile],
    name: Routes.StudentProfile,
    component: ProfileView,
    props: true, // permite acessar :uuid via props
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
