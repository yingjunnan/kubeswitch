import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { clustersApi } from '@/api'
import type { Cluster, CreateClusterDto, ImportKubeconfigDto } from '@/types'

export const useClusterStore = defineStore('cluster', () => {
  // State
  const clusters = ref<Cluster[]>([])
  const loading = ref(false)
  const selectedCluster = ref<Cluster | null>(null)

  // Getters
  const getClusters = computed(() => clusters.value)
  const getClusterById = computed(() => (id: number) => {
    return clusters.value.find(c => c.id === id)
  })

  // Actions
  const fetchClusters = async () => {
    loading.value = true
    try {
      clusters.value = await clustersApi.getClusters()
    } finally {
      loading.value = false
    }
  }

  const createCluster = async (data: CreateClusterDto) => {
    const newCluster = await clustersApi.createCluster(data)
    clusters.value.push(newCluster)
    return newCluster
  }

  const deleteCluster = async (id: number) => {
    await clustersApi.deleteCluster(id)
    clusters.value = clusters.value.filter(c => c.id !== id)
  }

  const getKubeconfig = async (id: number): Promise<string> => {
    return await clustersApi.getKubeconfig(id)
  }

  const importKubeconfig = async (id: number, data: ImportKubeconfigDto) => {
    await clustersApi.importKubeconfig(id, data)
  }

  const fetchClusterPermissions = async (id: number): Promise<number[]> => {
    return await clustersApi.getClusterPermissions(id)
  }

  const updateClusterPermissions = async (id: number, userIds: number[]) => {
    await clustersApi.updateClusterPermissions(id, { user_ids: userIds })
  }

  const setSelectedCluster = (cluster: Cluster | null) => {
    selectedCluster.value = cluster
  }

  return {
    // State
    clusters,
    loading,
    selectedCluster,
    // Getters
    getClusters,
    getClusterById,
    // Actions
    fetchClusters,
    createCluster,
    deleteCluster,
    getKubeconfig,
    importKubeconfig,
    fetchClusterPermissions,
    updateClusterPermissions,
    setSelectedCluster
  }
})
