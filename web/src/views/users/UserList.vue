<template>
  <div>
    <div style="margin-bottom: 16px">
      <a-button type="primary" @click="showCreateModal">
        创建用户
      </a-button>
    </div>

    <a-table
      :dataSource="users"
      :columns="columns"
      :loading="loading"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <a-space>
            <a-button size="small" @click="handlePermissions(record)">
              <template #icon><UserOutlined /></template>
              权限
            </a-button>

            <a-button
              v-if="isCurrentUser(record)"
              size="small"
              type="primary"
              @click="showPasswordModal"
            >
              <template #icon><KeyOutlined /></template>
              修改密码
            </a-button>

            <template v-if="isAdmin && !isCurrentUser(record)">
              <a-button
                size="small"
                style="background: #fa8c16; border-color: #fa8c16; color: white"
                @click="handleResetPassword(record)"
              >
                <template #icon><KeyOutlined /></template>
                重置密码
              </a-button>

              <a-button
                size="small"
                style="background: #722ed1; border-color: #722ed1; color: white"
                @click="handleChangeRole(record)"
              >
                <template #icon><EditOutlined /></template>
                修改角色
              </a-button>

              <a-popconfirm
                v-if="record.role !== 'admin'"
                title="确定要删除这个用户吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
                <a-button size="small" danger>
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </template>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 创建用户模态框 -->
    <a-modal
      v-model:open="createModalVisible"
      title="创建用户"
      @ok="handleCreateSubmit"
      :confirm-loading="submitting"
    >
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="用户名" required>
          <a-input v-model:value="createForm.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="密码" required>
          <a-input-password v-model:value="createForm.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item label="角色" required>
          <a-select v-model:value="createForm.role" placeholder="请选择角色">
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改密码模态框（当前用户） -->
    <a-modal
      v-model:open="passwordModalVisible"
      title="修改密码"
      @ok="handlePasswordSubmit"
      :confirm-loading="submitting"
    >
      <a-form :model="passwordForm" layout="vertical">
        <a-form-item label="当前密码" required>
          <a-input-password v-model:value="passwordForm.old_password" placeholder="请输入当前密码" />
        </a-form-item>
        <a-form-item label="新密码" required>
          <a-input-password v-model:value="passwordForm.new_password" placeholder="请输入新密码（至少6个字符）" />
        </a-form-item>
        <a-form-item label="确认新密码" required>
          <a-input-password v-model:value="passwordForm.confirm_password" placeholder="请再次输入新密码" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 重置密码模态框（管理员） -->
    <a-modal
      v-model:open="resetPasswordModalVisible"
      :title="`重置密码 - ${selectedUser?.username}`"
      @ok="handleResetPasswordSubmit"
      :confirm-loading="submitting"
    >
      <a-form :model="resetPasswordForm" layout="vertical">
        <a-form-item label="新密码" required>
          <a-input-password v-model:value="resetPasswordForm.new_password" placeholder="请输入新密码（至少6个字符）" />
        </a-form-item>
        <a-form-item label="确认新密码" required>
          <a-input-password v-model:value="resetPasswordForm.confirm_password" placeholder="请再次输入新密码" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改角色模态框 -->
    <a-modal
      v-model:open="roleModalVisible"
      :title="`修改角色 - ${selectedUser?.username}`"
      @ok="handleRoleSubmit"
      :confirm-loading="submitting"
    >
      <a-form :model="roleForm" layout="vertical">
        <a-form-item label="角色" required>
          <a-select v-model:value="roleForm.role" placeholder="请选择角色">
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限管理模态框 -->
    <a-modal
      v-model:open="permissionsModalVisible"
      :title="`权限管理 - ${selectedUser?.username}`"
      @ok="handlePermissionsSubmit"
      :confirm-loading="submitting"
    >
      <div style="margin-bottom: 8px">选择用户可以访问的集群：</div>
      <a-checkbox-group v-model:value="selectedClusterIds" style="display: flex; flex-direction: column; gap: 8px">
        <a-checkbox v-for="cluster in clusters" :key="cluster.id" :value="cluster.id">
          {{ cluster.name }}
        </a-checkbox>
      </a-checkbox-group>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  KeyOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { useUserStore, useClusterStore, useAuthStore } from '@/stores'
import type { User, CreateUserDto, UserRole } from '@/types'

const userStore = useUserStore()
const clusterStore = useClusterStore()
const authStore = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const createModalVisible = ref(false)
const passwordModalVisible = ref(false)
const resetPasswordModalVisible = ref(false)
const roleModalVisible = ref(false)
const permissionsModalVisible = ref(false)

const selectedUser = ref<User | null>(null)
const selectedClusterIds = ref<number[]>([])

const createForm = ref<CreateUserDto>({
  username: '',
  password: '',
  role: 'user' as UserRole
})

const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const resetPasswordForm = ref({
  new_password: '',
  confirm_password: ''
})

const roleForm = ref({
  role: 'user' as UserRole
})

const users = computed(() => userStore.users)
const clusters = computed(() => clusterStore.clusters)
const isAdmin = computed(() => authStore.isAdmin)
const currentUser = computed(() => authStore.currentUser)

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '操作', key: 'actions' }
]

const isCurrentUser = (user: User) => {
  return currentUser.value?.username === user.username
}

onMounted(async () => {
  await fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    await userStore.fetchUsers()
    await clusterStore.fetchClusters()
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

const showCreateModal = () => {
  createForm.value = {
    username: '',
    password: '',
    role: 'user'
  }
  createModalVisible.value = true
}

const handleCreateSubmit = async () => {
  if (!createForm.value.username || !createForm.value.password) {
    message.error('请填写必填字段')
    return
  }

  if (createForm.value.password.length < 6) {
    message.error('密码至少需要6个字符')
    return
  }

  submitting.value = true
  try {
    await userStore.createUser(createForm.value)
    message.success('用户创建成功')
    createModalVisible.value = false
  } catch (error) {
    console.error('Failed to create user:', error)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await userStore.deleteUser(id)
    message.success('用户删除成功')
  } catch (error) {
    console.error('Failed to delete user:', error)
  }
}

const showPasswordModal = () => {
  passwordForm.value = {
    old_password: '',
    new_password: '',
    confirm_password: ''
  }
  passwordModalVisible.value = true
}

const handlePasswordSubmit = async () => {
  if (!passwordForm.value.old_password || !passwordForm.value.new_password) {
    message.error('请填写所有字段')
    return
  }

  if (passwordForm.value.new_password.length < 6) {
    message.error('新密码至少需要6个字符')
    return
  }

  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    message.error('两次输入的密码不一致')
    return
  }

  submitting.value = true
  try {
    await authStore.updatePassword(passwordForm.value.old_password, passwordForm.value.new_password)
    message.success('密码修改成功')
    passwordModalVisible.value = false
  } catch (error) {
    console.error('Failed to update password:', error)
  } finally {
    submitting.value = false
  }
}

const handleResetPassword = (user: User) => {
  selectedUser.value = user
  resetPasswordForm.value = {
    new_password: '',
    confirm_password: ''
  }
  resetPasswordModalVisible.value = true
}

const handleResetPasswordSubmit = async () => {
  if (!selectedUser.value || !resetPasswordForm.value.new_password) {
    message.error('请填写所有字段')
    return
  }

  if (resetPasswordForm.value.new_password.length < 6) {
    message.error('新密码至少需要6个字符')
    return
  }

  if (resetPasswordForm.value.new_password !== resetPasswordForm.value.confirm_password) {
    message.error('两次输入的密码不一致')
    return
  }

  submitting.value = true
  try {
    await userStore.resetPassword(selectedUser.value.id, resetPasswordForm.value.new_password)
    message.success('密码重置成功')
    resetPasswordModalVisible.value = false
  } catch (error) {
    console.error('Failed to reset password:', error)
  } finally {
    submitting.value = false
  }
}

const handleChangeRole = (user: User) => {
  selectedUser.value = user
  roleForm.value.role = user.role
  roleModalVisible.value = true
}

const handleRoleSubmit = async () => {
  if (!selectedUser.value) return

  submitting.value = true
  try {
    await userStore.updateUserRole(selectedUser.value.id, roleForm.value.role)
    message.success('角色修改成功')
    roleModalVisible.value = false
  } catch (error) {
    console.error('Failed to update role:', error)
  } finally {
    submitting.value = false
  }
}

const handlePermissions = async (user: User) => {
  selectedUser.value = user
  try {
    selectedClusterIds.value = await userStore.fetchUserPermissions(user.id)
    permissionsModalVisible.value = true
  } catch (error) {
    console.error('Failed to fetch permissions:', error)
  }
}

const handlePermissionsSubmit = async () => {
  if (!selectedUser.value) return

  submitting.value = true
  try {
    await userStore.updateUserPermissions(selectedUser.value.id, selectedClusterIds.value)
    message.success('权限更新成功')
    permissionsModalVisible.value = false
  } catch (error) {
    console.error('Failed to update permissions:', error)
  } finally {
    submitting.value = false
  }
}
</script>
