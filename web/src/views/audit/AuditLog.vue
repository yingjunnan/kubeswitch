<template>
  <div>
    <a-table
      :dataSource="logs"
      :columns="columns"
      :loading="loading"
      :pagination="paginationConfig"
      row-key="id"
      @change="handleTableChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuditStore } from '@/stores'
import dayjs from 'dayjs'
import type { TableProps } from 'ant-design-vue'

const auditStore = useAuditStore()

const loading = ref(false)

const logs = computed(() => auditStore.logs)
const pagination = computed(() => auditStore.pagination)

const columns = [
  {
    title: '时间',
    dataIndex: 'created_at',
    key: 'created_at',
    customRender: ({ text }: { text: string }) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
  },
  {
    title: '用户',
    dataIndex: ['user', 'username'],
    key: 'user'
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action'
  },
  {
    title: '详情',
    dataIndex: 'detail',
    key: 'detail'
  },
  {
    title: 'IP 地址',
    dataIndex: 'ip_address',
    key: 'ip_address'
  }
]

const paginationConfig = computed(() => ({
  current: pagination.value.current,
  pageSize: pagination.value.pageSize,
  total: pagination.value.total,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条记录`
}))

onMounted(async () => {
  await fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    await auditStore.fetchAuditLogs()
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
  } finally {
    loading.value = false
  }
}

const handleTableChange: TableProps['onChange'] = (pag) => {
  if (pag.current && pag.pageSize) {
    auditStore.setPagination(pag.current, pag.pageSize)
  }
}
</script>
