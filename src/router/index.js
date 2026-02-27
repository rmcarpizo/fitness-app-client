import { createRouter, createWebHistory } from 'vue-router'
import Register from '../pages/Register.vue'
import Login from '../pages/Login.vue'
import Workouts from '../pages/Workouts.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/register', name: 'Register', component: Register },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/workouts',
    name: 'Workouts',
    component: Workouts,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard: redirect to login if not authenticated
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // Already logged in? Don't let them visit login/register again
  if ((to.path === '/login' || to.path === '/register') && token) {
    return next('/workouts')
  }

  // Protected route but no token? Send to login
  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  next()
})

export default router
