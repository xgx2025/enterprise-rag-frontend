import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Standalone — no AppLayout
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login.vue'),
      meta: { requiresAuth: false },
    },

    // Authenticated layout group
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      redirect: '/qa',
      children: [
        {
          path: 'qa',
          name: 'QaPage',
          component: () => import('@/views/qa.vue'),
          meta: { title: '企业问答', breadcrumb: ['企业问答'] },
        },
        {
          path: 'documents',
          name: 'DocumentsPage',
          component: () => import('@/views/documents.vue'),
          meta: { title: '知识库', breadcrumb: ['知识库'] },
        },
        {
          path: 'debug',
          name: 'DebugPage',
          component: () => import('@/views/debug.vue'),
          meta: { title: '检索实验室', breadcrumb: ['检索实验室'] },
        },
        {
          path: 'evaluation',
          name: 'EvaluationPage',
          component: () => import('@/views/evaluation.vue'),
          meta: { title: '评测中心', breadcrumb: ['评测中心'] },
        },
      ],
    },

    // 404 catch-all
    {
      path: '/:pathMatch(.*)*',
      redirect: '/qa',
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth === false) {
    // 已登录则跳首页
    if (authStore.isAuthenticated) {
      next('/qa')
    } else {
      next()
    }
    return
  }

  if (!authStore.isAuthenticated) {
    next('/login')
    return
  }

  next()
})

export default router
