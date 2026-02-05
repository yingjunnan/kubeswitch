<template>
  <div>
    <div style="margin-bottom: 16px">
      <a-button v-if="canManageClusters" type="primary" @click="showCreateModal">
        添加集群
      </a-button>
    </div>

    <a-table
      :dataSource="clusters"
      :columns="columns"
      :loading="loading"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'kubeconfig'">
          <a-space>
            <a-button type="primary" size="small" @click="handleViewKubeconfig(record)">
              <template #icon><EyeOutlined /></template>
              查看
            </a-button>
            <a-button size="small" style="background: #52c41a; border-color: #52c41a; color: white" @click="handleCopyKubeconfig(record)">
              <template #icon><CopyOutlined /></template>
              复制
            </a-button>
            <a-button size="small" style="background: #1890ff; border-color: #1890ff; color: white" @click="handleExportKubeconfig(record)">
              <template #icon><DownloadOutlined /></template>
              导出
            </a-button>
            <a-button v-if="canManageClusters" size="small" style="background: #fa8c16; border-color: #fa8c16; color: white" @click="handleImportKubeconfig(record)">
              <template #icon><UploadOutlined /></template>
              导入
            </a-button>
          </a-space>
        </template>

        <template v-if="column.key === 'admin_action'">
          <a-space>
            <a-button size="small" @click="handlePermissions(record)">权限管理</a-button>
            <a-popconfirm
              title="确定要删除这个集群吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record.id)"
            >
              <a-button size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 创建集群模态框 -->
    <a-modal
      v-model:open="createModalVisible"
      title="添加集群"
      @ok="handleCreateSubmit"
      :confirm-loading="submitting"
      width="600px"
    >
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="集群名称" required>
          <a-input v-model:value="createForm.name" placeholder="请输入集群名称" />
        </a-form-item>
        <a-form-item label="描述">
          <a-input v-model:value="createForm.description" placeholder="请输入描述" />
        </a-form-item>
        <a-form-item label="Kubeconfig 内容" required>
          <a-textarea
            v-model:value="createForm.kubeconfig"
            :rows="8"
            placeholder="粘贴 kubeconfig 内容或使用下方上传文件"
          />
        </a-form-item>
        <a-form-item label="或上传 Kubeconfig 文件">
          <a-upload-dragger
            :before-upload="handleFileUpload"
            :show-upload-list="false"
            accept=".yaml,.yml,.txt"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p class="ant-upload-hint">支持 .yaml, .yml, .txt 格式，文件大小不超过 10MB</p>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看 Kubeconfig 模态框 -->
    <a-modal
      v-model:open="kubeconfigModalVisible"
      :title="`Kubeconfig - ${selectedCluster?.name}`"
      width="800px"
      @ok="kubeconfigModalVisible = false"
    >
      <template #footer>
        <a-button @click="kubeconfigModalVisible = false">关闭</a-button>
        <a-button type="primary" @click="handleCopyFromModal">复制到剪贴板</a-button>
      </template>
      <a-textarea
        :value="kubeconfigContent"
        :rows="20"
        readonly
        style="font-family: monospace; font-size: 12px"
      />
    </a-modal>

    <!-- 导入 Kubeconfig 模态框 -->
    <a-modal
      v-model:open="importModalVisible"
      :title="`导入 Kubeconfig - ${selectedCluster?.name}`"
      @ok="handleImportSubmit"
      :confirm-loading="submitting"
      width="600px"
    >
      <a-form :model="importForm" layout="vertical">
        <a-form-item label="Kubeconfig 内容" required>
          <a-textarea
            v-model:value="importForm.kubeconfig"
            :rows="15"
            placeholder="粘贴 kubeconfig YAML 内容..."
            style="font-family: monospace; font-size: 12px"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限管理模态框 -->
    <a-modal
      v-model:open="permissionsModalVisible"
      :title="`权限管理 - ${selectedCluster?.name}`"
      @ok="handlePermissionsSubmit"
      :confirm-loading="submitting"
    >
      <div style="margin-bottom: 8px">选择可以访问此集群的用户：</div>
      <a-checkbox-group v-model:value="selectedUserIds" style="display: flex; flex-direction: column; gap: 8px">
        <a-checkbox v-for="user in users" :key="user.id" :value="user.id">
          {{ user.username }}
        </a-checkbox>
      </a-checkbox-group>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  EyeOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'
import { useClusterStore, useUserStore } from '@/stores'
import { usePermission } from '@/composables'
import type { Cluster, CreateClusterDto } from '@/types'
import type { UploadProps } from 'ant-design-vue'

const clusterStore = useClusterStore()
const userStore = useUserStore()
const { canManageClusters } = usePermission()

const loading = ref(false)
const submitting = ref(false)
const createModalVisible = ref(false)
const kubeconfigModalVisible = ref(false)
const importModalVisible = ref(false)
const permissionsModalVisible = ref(false)

const selectedCluster = ref<Cluster | null>(null)
const kubeconfigContent = ref('')
const selectedUserIds = ref<number[]>([])

const createForm = ref<CreateClusterDto>({
  name: '',
  description: '',
  kubeconfig: ''
})

const importForm = ref({
  kubeconfig: ''
})

const clusters = computed(() => clusterStore.clusters)
const users = computed(() => userStore.users)

const columns = computed(() => {
  const baseColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: 'Kubeconfig 操作', key: 'kubeconfig' }
  ]

  if (canManageClusters.value) {
    baseColumns.push({ title: '管理操作', key: 'admin_action' })
  }

  return baseColumns
})

onMounted(async () => {
  await fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    await clusterStore.fetchClusters()
    if (canManageClusters.value) {
      await userStore.fetchUsers()
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

const showCreateModal = () => {
  createForm.value = {
    name: '',
    description: '',
    kubeconfig: ''
  }
  createModalVisible.value = true
}

const handleCreateSubmit = async () => {
  if (!createForm.value.name || !createForm.value.kubeconfig) {
    message.error('请填写必填字段')
    return
  }

  submitting.value = true
  try {
    await clusterStore.createCluster(createForm.value)
    message.success('集群创建成功')
    createModalVisible.value = false
    await clusterStore.fetchClusters()
  } catch (error) {
    console.error('Failed to create cluster:', error)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await clusterStore.deleteCluster(id)
    message.success('集群删除成功')
  } catch (error) {
    console.error('Failed to delete cluster:', error)
  }
}

const handleViewKubeconfig = async (cluster: Cluster) => {
  try {
    kubeconfigContent.value = await clusterStore.getKubeconfig(cluster.id)
    selectedCluster.value = cluster
    kubeconfigModalVisible.value = true
  } catch (error) {
    console.error('Failed to fetch kubeconfig:', error)
  }
}

const handleCopyKubeconfig = async (cluster: Cluster) => {
  try {
    const config = await clusterStore.getKubeconfig(cluster.id)
    await navigator.clipboard.writeText(config)
    message.success('Kubeconfig 已复制到剪贴板')
  } catch (error) {
    console.error('Failed to copy kubeconfig:', error)
    message.error('复制失败')
  }
}

const handleCopyFromModal = async () => {
  try {
    await navigator.clipboard.writeText(kubeconfigContent.value)
    message.success('Kubeconfig 已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

const handleExportKubeconfig = async (cluster: Cluster) => {
  try {
    const config = await clusterStore.getKubeconfig(cluster.id)
    const blob = new Blob([config], { type: 'text/yaml' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cluster.name}-kubeconfig.yaml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    message.success('Kubeconfig 导出成功')
  } catch (error) {
    console.error('Failed to export kubeconfig:', error)
  }
}

const handleImportKubeconfig = (cluster: Cluster) => {
  selectedCluster.value = cluster
  importForm.value.kubeconfig = ''
  importModalVisible.value = true
}

const handleImportSubmit = async () => {
  if (!selectedCluster.value || !importForm.value.kubeconfig) {
    message.error('请输入 Kubeconfig 内容')
    return
  }

  submitting.value = true
  try {
    await clusterStore.importKubeconfig(selectedCluster.value.id, {
      kubeconfig: importForm.value.kubeconfig
    })
    message.success('Kubeconfig 导入成功')
    importModalVisible.value = false
  } catch (error) {
    console.error('Failed to import kubeconfig:', error)
  } finally {
    submitting.value = false
  }
}

const handleFileUpload: UploadProps['beforeUpload'] = (file) => {
  const isValidType = file.type === 'text/yaml' || file.type === 'text/plain' ||
    file.name.endsWith('.yaml') || file.name.endsWith('.yml') || file.name.endsWith('.txt')
  
  if (!isValidType) {
    message.error('请上传有效的 kubeconfig 文件 (.yaml, .yml, 或 .txt)')
    return false
  }

  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过 10MB')
    return false
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    createForm.value.kubeconfig = content
    message.success('文件上传成功')
  }
  reader.onerror = () => {
    message.error('文件读取失败')
  }
  reader.readAsText(file)

  return false
}

const handlePermissions = async (cluster: Cluster) => {
  selectedCluster.value = cluster
  try {
    selectedUserIds.value = await clusterStore.fetchClusterPermissions(cluster.id)
    permissionsModalVisible.value = true
  } catch (error) {
    console.error('Failed to fetch permissions:', error)
  }
}

const handlePermissionsSubmit = async () => {
  if (!selectedCluster.value) return

  submitting.value = true
  try {
    await clusterStore.updateClusterPermissions(selectedCluster.value.id, selectedUserIds.value)
    message.success('权限更新成功')
    permissionsModalVisible.value = false
  } catch (error) {
    console.error('Failed to update permissions:', error)
  } finally {
    submitting.value = false
  }
}
</script>
