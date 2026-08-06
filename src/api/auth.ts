import request from '@/utils/request'

export interface LoginRequest {
  username: string
  password: string
}

export interface UserInfo {
  userId: string
  tenantId: number
  username: string
  realName: string
}

export interface LoginResponse {
  accessToken: string
  expiresIn: number
  userInfo: UserInfo
}

export interface TokenPair {
  accessToken: string
  expiresIn: number
}

export function login(data: LoginRequest): Promise<LoginResponse> {
  return request.post('/auth/login', data).then(res => res.data)
}

export function refreshToken(): Promise<TokenPair> {
  return request.post('/auth/refresh').then(res => res.data)
}

export function logout(): Promise<void> {
  return request.post('/auth/logout')
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
  code: string
}

export function register(data: RegisterRequest): Promise<void> {
  return request.post('/auth/register', data).then(res => res.data)
}

export interface ResetPasswordRequest {
  email: string
  code: string
  newPassword: string
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
