import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auditApi } from '@/api'
import type { AuditLog } from '@/types'

export const useAuditStore = defineStore('audit', () => {
  // State
  const logs = ref<AuditLog[]>([])
  const loading = ref(false)
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // Getters
  const getLogs = computed(() => logs.value)
  const getPagination = computed(() => pagination.value)

  // Actions
  const fetchAuditLogs = async () => {
    loading.value = true
    try {
      const data = await auditApi.getAuditLogs()
      logs.value = data
      pagination.value.total = data.length
    } finally {
      loading.value = false
    }
  }

  const setPagination = (current: number, pageSize: number) => {
    pagination.value.current = current
    pagination.value.pageSize = pageSize
  }

  return {
    // State
    logs,
    loading,
    pagination,
    // Getters
    getLogs,
    getPagination,
    // Actions
    fetchAuditLogs,
    setPagination
  }
})
