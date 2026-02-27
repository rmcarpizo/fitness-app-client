<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import api from '../api.js'

const router = useRouter()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const passwordValid = computed(() => password.value.length >= 8)
const formValid = computed(() => emailValid.value && passwordValid.value)

const btnLabel = computed(() => {
  if (loading.value) return 'Logging in...'
  if (!emailValid.value) return 'Enter a valid email'
  if (!passwordValid.value) return 'Password too short'
  return 'Log In'
})

async function login() {
  errorMsg.value = ''
  loading.value = true
  try {
    const response = await api.post('/users/login', { email: email.value, password: password.value })
    userStore.setToken(response.data.access)
    router.push('/workouts')
  } catch (err) {
    const status = err.response?.status
    if (status === 404) errorMsg.value = 'No account found with that email.'
    else if (status === 401) errorMsg.value = 'Incorrect password. Please try again.'
    else errorMsg.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="ff-auth-bg">
    <div class="ff-card">

      <!-- Logo -->
      <div class="text-center mb-4">
        <div class="ff-logo-icon">
          <i class="bi bi-lightning-charge-fill"></i>
        </div>
        <div class="ff-logo">Fit<span>Forge</span></div>
        <p style="color: var(--ff-muted); font-size: 0.875rem; margin-top: 0.4rem;">
          Welcome back, keep pushing
        </p>
      </div>

      <!-- Alert -->
      <div v-if="errorMsg" class="ff-alert-danger mb-3">
        <i class="bi bi-exclamation-circle me-2"></i>{{ errorMsg }}
      </div>

      <!-- Form -->
      <form @submit.prevent="login">
        <!-- Email -->
        <div class="mb-3">
          <label class="ff-label">Email Address</label>
          <input
            v-model="email"
            type="text"
            class="ff-input"
            :class="{ 'is-invalid': email && !emailValid, 'is-valid': email && emailValid }"
            placeholder="you@example.com"
          />
          <div v-if="email && !emailValid" class="ff-invalid-feedback">
            <i class="bi bi-x-circle me-1"></i>Enter a valid email address
          </div>
        </div>

        <!-- Password -->
        <div class="mb-4">
          <label class="ff-label">Password</label>
          <input
            v-model="password"
            type="password"
            class="ff-input"
            :class="{ 'is-invalid': password && !passwordValid, 'is-valid': password && passwordValid }"
            placeholder="Your password"
          />
          <div v-if="password && !passwordValid" class="ff-invalid-feedback">
            <i class="bi bi-x-circle me-1"></i>Password must be at least 8 characters
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" class="ff-btn" :disabled="!formValid || loading">
          <span v-if="loading" class="ff-spinner"></span>
          {{ btnLabel }}
        </button>
      </form>

      <hr style="border-color: var(--ff-border); margin: 1.5rem 0;" />

      <p style="text-align: center; color: var(--ff-muted); font-size: 0.875rem; margin: 0;">
        No account yet?
        <RouterLink to="/register" class="ff-link ms-1">Create one</RouterLink>
      </p>
    </div>
  </div>
</template>
