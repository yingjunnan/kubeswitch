<template>
  <AppLayout>
    <ClusterList v-if="selectedMenu === 'clusters'" />
    <UserList v-else-if="selectedMenu === 'users'" />
    <AuditLog v-else-if="selectedMenu === 'audit'" />
    <div v-else>
      <h2>欢迎使用 KubeSwitch</h2>
      <p>这是一个 Kubernetes 集群管理系统</p>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import ClusterList from './clusters/ClusterList.vue'
import UserList from './users/UserList.vue'
import AuditLog from './audit/AuditLog.vue'

const selectedMenu = ref('clusters')

// 提供给 Sidebar 使用
provide('selectedMenu', selectedMenu)
</script>
