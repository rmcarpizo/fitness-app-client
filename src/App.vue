<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/user.js'

const router = useRouter()
const userStore = useUserStore()

function logout() {
  userStore.clearToken()
  router.push('/login')
}
</script>

<template>
  <nav v-if="userStore.isLoggedIn" class="ff-navbar">
    <a class="ff-nav-logo">Fit<span>Forge</span></a>
    <button class="ff-logout-btn" @click="logout">
      <i class="bi bi-box-arrow-right me-1"></i> Logout
    </button>
  </nav>
  <RouterView />
</template>
