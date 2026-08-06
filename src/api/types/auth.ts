// ============================================================
// Auth types — login, user info, token management
// ============================================================

export interface LoginRequest {
  username: string
  password: string
}

export interface UserInfo {
  userId: string
  tenantId: number
  tenantName?: string
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

export interface RegisterRequest {
  username: string
  password: string
  email: string
  code: string
}

export interface ResetPasswordRequest {
  email: string
  code: string
  newPassword: string
}
