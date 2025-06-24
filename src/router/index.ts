import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import NewsView from '@/views/NewsView.vue'
import SignInView from '@/views/SignInView.vue'
import SignUpView from '@/views/SignUpView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SearchResultsView from '@/views/SearchResultsView.vue'
import EditProfileView from '@/views/EditProfileView.vue'
import UsersView from '@/views/UsersView.vue'

export enum Routes {
  Home = 'home',
  About = 'about',
  News = 'news',
  SignIn = 'signIn',
  StudentSignUp = 'studentSignUp',
  EnterpriseSignUp = 'enterpriseSignUp',
  StudentLoggedProfile = 'studentLoggedProfile',
  StudentProfile = 'studentProfile',
  StudentEditView = 'studentEditView',
  StudentEdit = 'studentEdit',
  SearchResults = 'search',
  EnterpriseLoggedProfile = 'enterpriseLoggedProfile',
  EnterpriseProfile = 'enterpriseProfile',
  EnterpriseEditView = 'enterpriseEditView',
  EnterpriseEdit = 'enterpriseEdit',
  RecommendedUsers = 'recommendedUsers',
  InitiatorUsers = 'initiatorUsers',
  ReceiverUsers = 'receiverUsers',
}

export const RoutePaths = {
  [Routes.Home]: '/',
  [Routes.About]: '/about',
  [Routes.News]: '/news',
  [Routes.SignIn]: '/signIn',
  [Routes.StudentSignUp]: '/signUp/student',
  [Routes.EnterpriseSignUp]: '/signUp/enterprise',
  [Routes.StudentLoggedProfile]: '/talent',
  [Routes.StudentEditView]: '/talent/edit',
  [Routes.StudentProfile]: '/talent/:uuid',
  [Routes.StudentEdit]: '/talent/edit',
  [Routes.SearchResults]: '/search',
  [Routes.EnterpriseLoggedProfile]: '/enterprise',
  [Routes.EnterpriseProfile]: '/enterprise/:uuid',
  [Routes.EnterpriseEditView]: '/enterprise/edit',
  [Routes.EnterpriseEdit]: '/enterprise/edit',
  [Routes.RecommendedUsers]: '/recommended-users',
  [Routes.InitiatorUsers]: '/initiator-users/:uuid',
  [Routes.ReceiverUsers]: '/receiver-users/:uuid',
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
    path: RoutePaths[Routes.SignIn],
    name: Routes.SignIn,
    component: SignInView,
  },
  {
    path: RoutePaths[Routes.StudentSignUp],
    name: Routes.StudentSignUp,
    component: SignUpView,
    props: { role: 'student' },
  },
  {
    path: RoutePaths[Routes.EnterpriseSignUp],
    name: Routes.EnterpriseSignUp,
    component: SignUpView,
    props: { role: 'enterprise' },
  },
  {
    path: RoutePaths[Routes.SearchResults],
    name: Routes.SearchResults,
    component: SearchResultsView,
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
  {
    path: RoutePaths[Routes.RecommendedUsers],
    name: Routes.RecommendedUsers,
    component: UsersView,
    props: {
      type: 'recommended',
    },
  },
  {
    path: RoutePaths[Routes.InitiatorUsers],
    name: Routes.InitiatorUsers,
    component: UsersView,
    props: {
      type: 'initiator',
    },
  },
  {
    path: RoutePaths[Routes.ReceiverUsers],
    name: Routes.ReceiverUsers,
    component: UsersView,
    props: {
      type: 'receiver',
    },
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
