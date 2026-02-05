/**
 * 表单验证工具函数
 */

export const validators = {
  /**
   * 验证用户名
   * 规则：3-20个字符，只能包含字母、数字、下划线
   */
  username: (value: string): boolean => {
    if (!value) return false
    const regex = /^[a-zA-Z0-9_]{3,20}$/
    return regex.test(value)
  },

  /**
   * 验证密码
   * 规则：至少6个字符
   */
  password: (value: string): boolean => {
    if (!value) return false
    return value.length >= 6
  },

  /**
   * 验证集群名称
   * 规则：1-50个字符，不能为空
   */
  clusterName: (value: string): boolean => {
    if (!value) return false
    return value.trim().length > 0 && value.length <= 50
  },

  /**
   * 验证必填字段
   */
  required: (value: any): boolean => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    return true
  },

  /**
   * 验证 Kubeconfig 内容
   * 简单验证：检查是否包含基本的 Kubernetes 配置关键字
   */
  kubeconfig: (value: string): boolean => {
    if (!value) return false
    const hasApiVersion = value.includes('apiVersion')
    const hasKind = value.includes('kind')
    const hasClusters = value.includes('clusters')
    return hasApiVersion && hasKind && hasClusters
  }
}

/**
 * Ant Design Vue 表单验证规则生成器
 */
export const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
  ],

  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6个字符' }
  ],

  clusterName: [
    { required: true, message: '请输入集群名称' },
    { max: 50, message: '集群名称不能超过50个字符' }
  ],

  kubeconfig: [
    { required: true, message: '请输入 Kubeconfig 内容' },
    {
      validator: (_rule: any, value: string) => {
        if (!value) return Promise.reject('请输入 Kubeconfig 内容')
        if (!validators.kubeconfig(value)) {
          return Promise.reject('Kubeconfig 格式不正确')
        }
        return Promise.resolve()
      }
    }
  ]
}
