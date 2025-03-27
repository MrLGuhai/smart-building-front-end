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
  }
}

// 设备控制相关接口
export const deviceAPI = {
  // 获取设备状态
  getStatus: () => {
    return request('/devices/status', {
      method: 'GET'
    })
  },
  
  // 获取设备控制状态
  getControlStatus: () => {
    return request('/devices/control', {
      method: 'GET'
    })
  },
  
  // 更新设备控制状态
  updateControl: (controlData) => {
    return request('/devices/control', {
      method: 'POST',
      data: controlData
    })
  },
  
  // 获取设备控制记录
  getControlRecords: (deviceType) => {
    return request('/devices/control/records', {
      method: 'GET',
      data: { deviceType }
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
  }
} 