<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { register as registerApi, resetPassword as resetPasswordApi, sendCode as sendCodeApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

type AuthMode = 'login' | 'register' | 'reset'
const mode = ref<AuthMode>(route.query.mode === 'register' || route.query.mode === 'reset' ? route.query.mode : 'login')
const formRef = ref()
const loading = ref(false)
const sendingCode = ref(false)
const codeCountdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

watch(() => route.query.mode, (val) => {
  mode.value = val === 'register' || val === 'reset' ? val : 'login'
})

const loginForm = reactive({
  username: '',
  password: '',
})

const registerForm = reactive({
  username: '',
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
})

const resetForm = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: '',
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 32, message: '用户名长度 3-32 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

const validateResetConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== resetForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const resetRules = {
  email: [
    { required: true, message: '请输入注册邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateResetConfirmPassword, trigger: 'blur' },
  ],
}

function switchMode(nextMode: AuthMode) {
  router.push({ query: nextMode === 'login' ? {} : { mode: nextMode } })
}

async function sendCode(email: string) {
  if (!email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }
  sendingCode.value = true
  try {
    await sendCodeApi(email)
    ElMessage.success('验证码已发送')
    codeCountdown.value = 60
    if (countdownTimer) clearInterval(countdownTimer)
    countdownTimer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) {
        clearInterval(countdownTimer!)
        countdownTimer = null
      }
    }, 1000)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '发送失败')
  } finally {
    sendingCode.value = false
  }
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await authStore.login(loginForm)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '登录失败')
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await registerApi({
      username: registerForm.username,
      email: registerForm.email,
      code: registerForm.code,
      password: registerForm.password,
    })
    ElMessage.success('注册成功，请登录')
    router.push({ query: {} })
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '注册失败')
  } finally {
    loading.value = false
  }
}

async function handleResetPassword() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await resetPasswordApi({
      email: resetForm.email,
      code: resetForm.code,
      newPassword: resetForm.newPassword,
    })
    loginForm.username = ''
    loginForm.password = ''
    ElMessage.success('密码已重置，请重新登录')
    switchMode('login')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '重置密码失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <!-- 背景装饰 -->
    <div class="bg-layer">
      <div class="bg-orb bg-orb--1"></div>
      <div class="bg-orb bg-orb--2"></div>
      <div class="bg-orb bg-orb--3"></div>
      <div class="bg-grid"></div>
    </div>

    <!-- 主体卡片 -->
    <div class="auth-card">
      <!-- 品牌区 -->
      <div class="card-brand">
        <div class="brand-icon">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="url(#icon-grad)" />
            <path d="M10 12h16v3H10zM10 18h10v3H10zM10 24h14v3H10z" fill="#fff" opacity="0.95" />
            <circle cx="27" cy="18" r="5" fill="#fff" opacity="0.2" />
            <circle cx="27" cy="18" r="2.5" fill="#fff" opacity="0.45" />
            <defs>
              <linearGradient id="icon-grad" x1="0" y1="0" x2="36" y2="36">
                <stop stop-color="#6366f1" />
                <stop offset="1" stop-color="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="brand-text">
          <h1>Enterprise RAG Hub</h1>
          <p>企业可信知识检索平台</p>
        </div>
      </div>

      <!-- 模式切换 -->
      <div class="mode-switch">
        <button
          :class="['mode-btn', { active: mode === 'login' || mode === 'reset' }]"
          @click="switchMode('login')"
        >
          登录
        </button>
        <button
          :class="['mode-btn', { active: mode === 'register' }]"
          @click="switchMode('register')"
        >
          注册
        </button>
      </div>

      <!-- 表单区 -->
      <div class="card-body">
        <Transition name="slide" mode="out-in">
          <!-- 登录表单 -->
          <div v-if="mode === 'login'" key="login">
            <el-form
              ref="formRef"
              :model="loginForm"
              :rules="loginRules"
              label-position="top"
              hide-required-asterisk
              @submit.prevent="handleLogin"
            >
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  show-password
                />
              </el-form-item>
              <div class="form-link-row">
                <el-button link type="primary" @click="switchMode('reset')">忘记密码</el-button>
              </div>
              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  :loading="loading"
                  class="submit-btn"
                  native-type="submit"
                >
                  {{ loading ? '登录中...' : '登 录' }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 注册表单 -->
          <div v-else-if="mode === 'register'" key="register">
            <el-form
              ref="formRef"
              :model="registerForm"
              :rules="registerRules"
              label-position="top"
              hide-required-asterisk
              @submit.prevent="handleRegister"
            >
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="registerForm.username"
                  placeholder="请输入用户名"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="registerForm.email"
                  placeholder="请输入邮箱地址"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="验证码" prop="code">
                <div class="code-row">
                  <el-input
                    v-model="registerForm.code"
                    placeholder="请输入邮箱验证码"
                    size="large"
                  />
                  <el-button
                    size="large"
                    :loading="sendingCode"
                    :disabled="codeCountdown > 0"
                    class="code-btn"
                    @click="sendCode(registerForm.email)"
                  >
                    {{ codeCountdown > 0 ? `${codeCountdown}s 后重发` : '获取验证码' }}
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="至少 6 位密码"
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  :loading="loading"
                  class="submit-btn"
                  native-type="submit"
                >
                  {{ loading ? '注册中...' : '注 册' }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 重置密码表单 -->
          <div v-else key="reset">
            <el-form
              ref="formRef"
              :model="resetForm"
              :rules="resetRules"
              label-position="top"
              hide-required-asterisk
              @submit.prevent="handleResetPassword"
            >
              <el-form-item label="注册邮箱" prop="email">
                <el-input v-model="resetForm.email" placeholder="请输入注册邮箱" size="large" />
              </el-form-item>
              <el-form-item label="验证码" prop="code">
                <div class="code-row">
                  <el-input v-model="resetForm.code" placeholder="请输入邮箱验证码" size="large" />
                  <el-button
                    size="large"
                    :loading="sendingCode"
                    :disabled="codeCountdown > 0"
                    class="code-btn"
                    @click="sendCode(resetForm.email)"
                  >
                    {{ codeCountdown > 0 ? `${codeCountdown}s 后重发` : '获取验证码' }}
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="resetForm.newPassword"
                  type="password"
                  placeholder="至少 6 位密码"
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input
                  v-model="resetForm.confirmPassword"
                  type="password"
                  placeholder="再次输入新密码"
                  size="large"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  :loading="loading"
                  class="submit-btn"
                  native-type="submit"
                >
                  {{ loading ? '提交中...' : '重置密码' }}
                </el-button>
              </el-form-item>
              <div class="form-link-row form-link-row--center">
                <el-button link @click="switchMode('login')">返回登录</el-button>
              </div>
            </el-form>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== 全局 ========== */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* ========== 背景装饰层 ========== */
.bg-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 70%);
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.bg-orb--1 {
  width: 500px;
  height: 500px;
  background: #818cf8;
  top: -200px;
  right: -100px;
  animation: float-1 20s ease-in-out infinite;
}

.bg-orb--2 {
  width: 400px;
  height: 400px;
  background: #a78bfa;
  bottom: -150px;
  left: -100px;
  animation: float-2 24s ease-in-out infinite;
}

.bg-orb--3 {
  width: 300px;
  height: 300px;
  background: #c4b5fd;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float-3 18s ease-in-out infinite;
}

@keyframes float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

@keyframes float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-30px, -20px) scale(1.08); }
  66% { transform: translate(20px, 30px) scale(0.92); }
}

@keyframes float-3 {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.15); }
}

/* ========== 卡片 ========== */
.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 20px;
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.03),
    0 2px 4px rgba(0,0,0,0.02),
    0 12px 24px rgba(0,0,0,0.04),
    0 32px 64px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* ========== 品牌区 ========== */
.card-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 36px 36px 0;
}

.brand-icon {
  flex-shrink: 0;
}

.brand-text h1 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 2px;
  letter-spacing: -0.3px;
}

.brand-text p {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

/* ========== 模式切换 ========== */
.mode-switch {
  display: flex;
  margin: 28px 36px 0;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 4px;
}

.mode-btn {
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
}

.mode-btn.active {
  background: #fff;
  color: #111827;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
}

.mode-btn:hover:not(.active) {
  color: #374151;
}

/* ========== 表单区 ========== */
.card-body {
  padding: 28px 36px 36px;
}

/* 表单项间距 */
:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  padding-bottom: 6px;
  line-height: 1;
}

.form-link-row {
  display: flex;
  justify-content: flex-end;
  margin: -10px 0 12px;
}

.form-link-row--center {
  justify-content: center;
  margin: -8px 0 0;
}

/* 输入框 */
:deep(.el-input--large) {
  font-size: 14px;
}

:deep(.el-input--large .el-input__wrapper) {
  border-radius: 10px;
  padding: 0 14px;
  background: #f9fafb;
  box-shadow: 0 0 0 1px #e5e7eb inset;
  transition: all 0.2s ease;
}

:deep(.el-input--large .el-input__wrapper:hover) {
  background: #fff;
  box-shadow: 0 0 0 1px #d1d5db inset;
}

:deep(.el-input--large.is-focus .el-input__wrapper) {
  background: #fff;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1), 0 0 0 1px #6366f1 inset;
}

:deep(.el-input--large .el-input__inner) {
  --el-input-inner-height: 44px;
  line-height: 44px;
}

/* 密码可见切换按钮 */
:deep(.el-input__suffix) {
  color: #9ca3af;
}

:deep(.el-input__suffix:hover) {
  color: #6b7280;
}

/* 验证码 + 发送按钮行 */
.code-row {
  display: flex;
  gap: 10px;
}

.code-row > .el-input {
  flex: 1;
}

.code-btn {
  flex-shrink: 0;
  height: 44px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #6366f1;
  background: #eef2ff;
  border: 1px solid transparent;
  padding: 0 16px;
  white-space: nowrap;
}

.code-btn:hover:not(:disabled) {
  background: #e0e7ff;
  color: #4f46e5;
}

.code-btn.is-disabled,
.code-btn:disabled {
  color: #9ca3af;
  background: #f3f4f6;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  margin-top: 6px;
  border-radius: 10px;
  height: 46px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
  background: #18181b;
  border: none;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: #27272a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.submit-btn:active {
  transform: translateY(0);
}

/* loading 态 */
:deep(.el-button--primary.is-loading) {
  background: #18181b;
}

:deep(.el-button--primary.is-loading::before) {
  display: none;
}

/* ========== 表单切换动画 ========== */
.slide-enter-active {
  transition: all 0.3s ease-out;
}

.slide-leave-active {
  transition: all 0.2s ease-in;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ========== 响应式 ========== */
@media (max-width: 480px) {
  .auth-page {
    padding: 16px;
    align-items: flex-start;
    padding-top: 40px;
  }

  .auth-card {
    border-radius: 16px;
  }

  .card-brand {
    padding: 28px 24px 0;
  }

  .mode-switch {
    margin: 24px 24px 0;
  }

  .card-body {
    padding: 24px;
  }

  .brand-text h1 {
    font-size: 18px;
  }
}
</style>
