// API请求基础配置
const BASE_URL = '/api' // 请求地址

// 创建请求头
const createHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  }
  const token = uni.getStorageSync('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// 请求封装
const request = async (url, options = {}) => {
  try {
    const response = await uni.request({
      url: `${BASE_URL}${url}`,
      ...options,
      header: createHeaders()
    })
    
    const { data } = response
    if (data.code === 200) {
      return data
    } else if (data.code === 401) {
      // 未登录或token过期
      uni.removeStorageSync('token')
      uni.redirectTo({
        url: '/pages/login/index'
      })
      throw new Error(data.message)
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    uni.showToast({
      title: error.message || '请求失败',
      icon: 'none'
    })
    throw error
  }
}

// 用户认证相关接口
export const authAPI = {
  // 登录
  login: (username, password) => {
    return request('/auth/login', {
      method: 'POST',
      data: { username, password }
    })
  },
  
  // 注册
  register: (username, password) => {
    return request('/auth/register', {
      method: 'POST',
      data: { username, password }
    })
  },
  
  // 退出登录
  logout: () => {
    return request('/auth/logout', {
      method: 'POST'
    })
  }
}

// 环境数据相关接口
export const environmentAPI = {
  // 获取当前环境数据
  getCurrentData: () => {
    return request('/environment/current', {
      method: 'GET'
    })
  },
  
  // 获取历史环境数据
  getHistoryData: (params = { limit: 200 }) => {
    return request('/environment/history', {
      method: 'GET',
      data: params
    })
  }
}

// 设备控制相关接口
export const deviceAPI = {
  // 获取设备状态
  getStatus: () => {
    return request('/device/status', {
      method: 'GET'
    })
  },
  
  // 更新设备控制状态
  updateControl: (controlData) => {
    return request('/device/control', {
      method: 'PUT',
      data: controlData
    })
  },
  
  // 获取设备控制记录
  getControlRecords: (params = { limit: 100 }) => {
    return request('/device/control/records', {
      method: 'GET',
      data: params
    })
  }
}

// 阈值设置相关接口
export const thresholdAPI = {
  // 获取当前阈值设置
  getCurrentThresholds: () => {
    return request('/thresholds/current', {
      method: 'GET'
    })
  },
  
  // 更新阈值设置
  updateThresholds: (thresholdData) => {
    return request('/thresholds/update', {
      method: 'POST',
      data: thresholdData
    })
  },
  
  // 获取阈值修改记录
  getThresholdRecords: (params = { limit: 100 }) => {
    return request('/thresholds/records', {
      method: 'GET',
      data: params
    })
  }
}

export const alarmAPI = {
  // 获取历史告警记录
  getAlarmRecords: (params = { limit: 100 }) => {
    return request('/alarm/records', {
      method: 'GET',
      data: params
    })
  }
} 