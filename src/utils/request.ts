import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const request = axios.create({
  baseURL: '',
  timeout: 15000,
  withCredentials: true,
})

// 是否正在刷新token
let isRefreshing = false
// 等待刷新期间暂存的请求队列
let pendingRequests: Array<{ resolve: (token: string) => void; reject: (err: Error) => void }> = []

function addPendingRequest(resolve: (token: string) => void, reject: (err: Error) => void) {
  pendingRequests.push({ resolve, reject })
}

function flushPendingRequests(token: string) {
  pendingRequests.forEach(({ resolve }) => resolve(token))
  pendingRequests = []
}

function rejectPendingRequests(err: Error) {
  pendingRequests.forEach(({ reject }) => reject(err))
  pendingRequests = []
}

// 请求拦截器：添加 Authorization header
request.interceptors.request.use(
  config => {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器：自动解包 Result<T> 格式 & 401 自动刷新
request.interceptors.response.use(
  response => {
    // 后端统一返回 Result<T> 格式: { code, message, data }
    // 成功(code=200)时自动提取 data，失败时 reject 让调用方 catch
    const body = response.data
    if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
      if (body.code === 200) {
        response.data = body.data
      } else {
        return Promise.reject({ response: { data: body } })
      }
    }
    return response
  },
  async error => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    // 如果是 401 且不是刷新请求本身，且不是重试过的请求
    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // 已有刷新在进行中，将请求加入队列等待
        return new Promise<string>((resolve, reject) => {
          addPendingRequest(
            (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              originalRequest._retry = true
              resolve(request(originalRequest))
            },
            reject
          )
        })
      }

      // 开始刷新
      isRefreshing = true
      originalRequest._retry = true

      try {
        await authStore.doRefresh()
        flushPendingRequests(authStore.accessToken!)
        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
        return request(originalRequest)
      } catch (refreshError) {
        rejectPendingRequests(refreshError as Error)
        authStore.clearAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default request
