import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import NewsView from '@/views/NewsView.vue'
import SignInView from '@/views/SignInView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SearchResultsView from '@/views/SearchResultsView.vue'
import EditProfileView from '@/views/EditProfileView.vue'

export enum Routes {
  Home = 'home',
  About = 'about',
  News = 'news',
  SignInStudent = 'signInStudent',
  SignInEnterprise = 'signInEnterprise',
  StudentLoggedProfile = 'studentLoggedProfile',
  StudentProfile = 'studentProfile',
  StudentEditView = 'studentEditView',
  StudentEdit = 'studentEdit',
  SearchResults = 'search',
  EnterpriseLoggedProfile = 'enterpriseLoggedProfile',
  EnterpriseProfile = 'enterpriseProfile',
  EnterpriseEditView = 'enterpriseEditView',
  EnterpriseEdit = 'enterpriseEdit',
}

export const RoutePaths = {
  [Routes.Home]: '/',
  [Routes.About]: '/about',
  [Routes.News]: '/news',
  [Routes.SignInStudent]: '/signInStudent',
  [Routes.SignInEnterprise]: '/signInEnterprise',
  [Routes.StudentLoggedProfile]: '/talent',
  [Routes.StudentEditView]: '/talent/edit',
  [Routes.StudentProfile]: '/talent/:uuid',
  [Routes.StudentEdit]: '/talent/edit',
  [Routes.SearchResults]: '/search',
  [Routes.EnterpriseLoggedProfile]: '/enterprise',
  [Routes.EnterpriseProfile]: '/enterprise/:uuid',
  [Routes.EnterpriseEditView]: '/enterprise/edit',
  [Routes.EnterpriseEdit]: '/enterprise/edit',
}

const routes = [
  {
    path: RoutePaths[Routes.Home],
    name: Routes.Home,
    component: HomeView,
  },
  {
    path: RoutePaths[Routes.About],
    name: Routes.About,
    component: AboutView,
  },
  {
    path: RoutePaths[Routes.News],
    name: Routes.News,
    component: NewsView,
  },
  {
    path: RoutePaths[Routes.SignInStudent],
    name: Routes.SignInStudent,
    component: SignInView,
    props: {
      role: 'student',
    },
  },
  {
    path: RoutePaths[Routes.SearchResults],
    name: Routes.SearchResults,
    component: SearchResultsView,
},
  {
    path: RoutePaths[Routes.SignInEnterprise],
    name: Routes.SignInEnterprise,
    component: SignInView,
    props: {
      role: 'enterprise',
    },
  },
  {
    path: RoutePaths[Routes.StudentLoggedProfile],
    name: Routes.StudentLoggedProfile,
    component: ProfileView,
  },
  {
    path: RoutePaths[Routes.StudentProfile],
    name: Routes.StudentProfile,
    component: ProfileView,
    props: true,
  },
  {
    path: RoutePaths[Routes.EnterpriseLoggedProfile],
    name: Routes.EnterpriseLoggedProfile,
    component: ProfileView,
  },
  {
    path: RoutePaths[Routes.EnterpriseProfile],
    name: Routes.EnterpriseProfile,
    component: ProfileView,
    props: true,
  },
  {
    path: RoutePaths[Routes.StudentEditView],
    name: Routes.StudentEditView,
    component: EditProfileView,
    props: {
      role: 'student',
    },
  },
  {
    path: RoutePaths[Routes.StudentEdit],
    name: Routes.StudentEdit,
    component: EditProfileView,
    props: {
      role: 'student',
    },
  },
  {
    path: RoutePaths[Routes.EnterpriseEditView],
    name: Routes.EnterpriseEditView,
    component: EditProfileView,
    props: {
      role: 'enterprise',
    },
  },
  {
    path: RoutePaths[Routes.EnterpriseEdit],
    name: Routes.EnterpriseEdit,
    component: EditProfileView,
    props: {
      role: 'enterprise',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
