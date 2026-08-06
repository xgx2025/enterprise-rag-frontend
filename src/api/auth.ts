import request from '@/utils/request'
import type { LoginRequest, UserInfo, LoginResponse, TokenPair, RegisterRequest, ResetPasswordRequest } from '@/api/types'

export type { LoginRequest, UserInfo, LoginResponse, TokenPair, RegisterRequest, ResetPasswordRequest }

export function login(data: LoginRequest): Promise<LoginResponse> {
  return request.post('/auth/login', data).then(res => res.data)
}

export function refreshToken(): Promise<TokenPair> {
  return request.post('/auth/refresh').then(res => res.data)
}

export function logout(): Promise<void> {
  return request.post('/auth/logout')
}

export function register(data: RegisterRequest): Promise<void> {
  return request.post('/auth/register', data).then(res => res.data)
}

export function resetPassword(data: ResetPasswordRequest): Promise<void> {
  return request.post('/auth/reset-password', data).then(res => res.data)
}

export function sendCode(email: string): Promise<void> {
  return request.post('/auth/send-code', { email }).then(res => res.data)
}

export function getCurrentUser(): Promise<UserInfo> {
  return request.get('/auth/profile').then(res => res.data)
}
