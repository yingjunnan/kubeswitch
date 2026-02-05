<template>
  <a-layout-header style="background: #fff; padding: 0 20px; display: flex; justify-content: flex-end; align-items: center">
    <a-space>
      <span v-if="currentUser">{{ currentUser.username }}</span>
      <a-button type="primary" @click="handleLogout">
        <template #icon>
          <LogoutOutlined />
        </template>
        退出登录
      </a-button>
    </a-space>
  </a-layout-header>
</template>

<script setup lang="ts">
import { LogoutOutlined } from '@ant-design/icons-vue'
import { useAuth } from '@/composables'
import { message } from 'ant-design-vue'

const { currentUser, logout } = useAuth()

const handleLogout = async () => {
  try {
    await logout()
    message.success('退出登录成功')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>
