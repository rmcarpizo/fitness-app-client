<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api.js'

const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)

const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const passwordValid = computed(() => password.value.length >= 8)
const confirmValid = computed(() => confirmPassword.value === password.value && confirmPassword.value !== '')
const formValid = computed(() => emailValid.value && passwordValid.value && confirmValid.value)

const btnLabel = computed(() => {
  if (loading.value) return 'Creating account...'
  if (!emailValid.value) return 'Enter a valid email'
  if (!passwordValid.value) return 'Password too short'
  if (!confirmValid.value) return "Passwords don't match"
  return 'Create Account'
})

async function register() {
  errorMsg.value = ''
  successMsg.value = ''
  loading.value = true
  try {
    await api.post('/users/register', { email: email.value, password: password.value })
    successMsg.value = '🎉 Account created! Redirecting to login...'
    setTimeout(() => router.push('/login'), 2000)
  } catch (err) {
    errorMsg.value = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.'
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
          Start tracking your fitness journey
        </p>
      </div>

      <!-- Alerts -->
      <div v-if="errorMsg" class="ff-alert-danger mb-3">
        <i class="bi bi-exclamation-circle me-2"></i>{{ errorMsg }}
      </div>
      <div v-if="successMsg" class="ff-alert-success mb-3">
        {{ successMsg }}
      </div>

      <!-- Form -->
      <form @submit.prevent="register">
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
        <div class="mb-3">
          <label class="ff-label">Password</label>
          <input
            v-model="password"
            type="password"
            class="ff-input"
            :class="{ 'is-invalid': password && !passwordValid, 'is-valid': password && passwordValid }"
            placeholder="Min. 8 characters"
          />
          <div v-if="password && !passwordValid" class="ff-invalid-feedback">
            <i class="bi bi-x-circle me-1"></i>{{ password.length }}/8 characters minimum
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="mb-4">
          <label class="ff-label">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="ff-input"
            :class="{ 'is-invalid': confirmPassword && !confirmValid, 'is-valid': confirmPassword && confirmValid }"
            placeholder="Repeat your password"
          />
          <div v-if="confirmPassword && !confirmValid" class="ff-invalid-feedback">
            <i class="bi bi-x-circle me-1"></i>Passwords do not match
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" class="ff-btn" :disabled="!formValid || loading">
          <span v-if="loading" class="ff-spinner"></span>
          {{ btnLabel }}
        </button>
      </form>

      <!-- Divider -->
      <hr style="border-color: var(--ff-border); margin: 1.5rem 0;" />

      <p style="text-align: center; color: var(--ff-muted); font-size: 0.875rem; margin: 0;">
        Already have an account?
        <RouterLink to="/login" class="ff-link ms-1">Log in</RouterLink>
      </p>
    </div>
  </div>
</template>
