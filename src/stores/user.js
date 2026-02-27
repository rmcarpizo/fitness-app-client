import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State: the JWT token stored in localStorage
  const token = ref(localStorage.getItem('token') || null)

  // Computed: is the user currently logged in?
  const isLoggedIn = computed(() => !!token.value)

  // Action: save token after login/register
  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // Action: clear token on logout
  function clearToken() {
    token.value = null
    localStorage.removeItem('token')
  }

  return { token, isLoggedIn, setToken, clearToken }
})
