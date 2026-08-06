import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, refreshToken, logout as logoutApi, getCurrentUser } from '@/api/auth'
import type { LoginRequest, UserInfo } from '@/api/auth'
import router from '@/router'

const ACCESS_TOKEN_KEY = 'access_token'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY))
  const userInfo = ref<UserInfo | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setToken(access: string) {
    accessToken.value = access
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
  }

  function clearTokens() {
    accessToken.value = null
    userInfo.value = null
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }

  function clearAndRedirect() {
    clearTokens()
    router.push('/login')
  }

  async function login(data: LoginRequest) {
    const res = await loginApi(data)
    if (!res || !res.accessToken) {
      throw new Error('登录返回数据异常')
    }
    setToken(res.accessToken)
    userInfo.value = res.userInfo ?? null
    return res
  }

  async function doRefresh() {
    const res = await refreshToken()
    setToken(res.accessToken)
    return res
  }

  async function fetchUserInfo() {
    try {
      userInfo.value = await getCurrentUser()
    } catch {
      throw new Error('获取用户信息失败')
    }
  }

  async function logout() {
    try {
      await logoutApi()
    } finally {
      clearAndRedirect()
    }
  }

  return {
    accessToken,
    userInfo,
    isAuthenticated,
    login,
    doRefresh,
    fetchUserInfo,
    logout,
    clearAndRedirect,
  }
})
