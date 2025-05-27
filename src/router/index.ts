import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import NewsView from '@/views/NewsView.vue'
import SignInView from '@/views/SignInView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SearchResultsView from '@/views/SearchResultsView.vue'


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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
