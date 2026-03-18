import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API请求失败:', error)
    return Promise.reject(error)
  }
)

// 活动相关API
export const activityApi = {
  // 获取活动列表
  getList: (params) => request.get('/activities', { params }),

  // 获取活动详情
  getDetail: (id) => request.get(`/activities/${id}`),

  // 创建活动
  create: (data) => request.post('/activities', data),

  // 更新活动
  update: (id, data) => request.put(`/activities/${id}`, data),

  // 手动切换主链接
  // data: { operator: string, target_slot: 'backup_link_1' | 'backup_link_2' | 'backup_link_3' }
  switchLinks: (id, data) => request.post(`/activities/${id}/switch`, data)
}

// 切换日志相关API
export const switchLogApi = {
  // 获取日志列表
  getList: (params) => request.get('/switch-logs', { params }),

  // 获取日志详情
  getDetail: (id) => request.get(`/switch-logs/${id}`)
}

export default request
