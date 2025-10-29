import axios from 'axios'

// 设置基础URL，根据实际环境配置
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:20001/api'

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

/* 响应拦截器：统一把业务错误转成 Promise.reject */
api.interceptors.response.use(
  res => {
    const { success, message } = res.data;
    if (success !==true) {
      return Promise.reject(new Error(message || '业务异常'));
    }
    return res.data;   // 只返回 data
  },
  err => {
    return Promise.reject(new Error(err.message || '网络错误'));
  }
);

// 启动任务接口
export const startTask = (config) => {
    return api.post('/dataPush/start', config)
}

// 停止任务接口
export const stopTask = (taskId) => {
    return api.get(`/dataPush/${taskId}/stop`)
}

// 获取任务监控数据
export const getTaskStats = (taskId) => {
    return api.get(`/dataPush/${taskId}/stats`)
}

// 保存配置
export const saveConfig = (config) => {
    return api.post('/config/save', config)
}

// 获取任务列表
export const getTasks = () => {
    return api.get('/dataPush/tasks')
}

export default api