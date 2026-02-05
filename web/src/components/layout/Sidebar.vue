<template>
  <a-layout-sider v-model:collapsed="collapsed" collapsible>
    <div class="logo">
      KubeSwitch
    </div>
    <a-menu
      v-model:selectedKeys="selectedKeys"
      theme="dark"
      mode="inline"
      :items="menuItems"
      @click="handleMenuClick"
    />
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed, h, inject, watch } from 'vue'
import type { Ref } from 'vue'
import {
  ClusterOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'
import { usePermission } from '@/composables'
import type { MenuProps } from 'ant-design-vue'

const { canManageUsers, canViewAudit } = usePermission()

const collapsed = ref(false)
const selectedKeys = ref<string[]>(['clusters'])

// 从 Dashboard 注入的 selectedMenu
const selectedMenu = inject<Ref<string>>('selectedMenu')

// 根据权限动态生成菜单项
const menuItems = computed<MenuProps['items']>(() => {
  const items: MenuProps['items'] = [
    {
      key: 'clusters',
      icon: () => h(ClusterOutlined),
      label: '集群管理',
      title: '集群管理'
    }
  ]

  if (canManageUsers.value) {
    items.push({
      key: 'users',
      icon: () => h(UserOutlined),
      label: '用户管理',
      title: '用户管理'
    })
  }

  if (canViewAudit.value) {
    items.push({
      key: 'audit',
      icon: () => h(FileTextOutlined),
      label: '审计日志',
      title: '审计日志'
    })
  }

  return items
})

const handleMenuClick = ({ key }: { key: string }) => {
  selectedKeys.value = [key]
  if (selectedMenu) {
    selectedMenu.value = key
  }
}

// 监听 selectedMenu 变化更新选中状态
if (selectedMenu) {
  watch(selectedMenu, (newValue) => {
    selectedKeys.value = [newValue]
  }, { immediate: true })
}
</script>

<style scoped>
.logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  border-radius: 6px;
}
</style>
