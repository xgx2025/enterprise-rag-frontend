<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      await authStore.fetchUserInfo()
    } catch {
      authStore.clearAndRedirect()
    }
  }
})
</script>

<template>
  <router-view />
</template>
