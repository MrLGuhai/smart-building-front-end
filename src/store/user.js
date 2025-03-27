// 用户信息管理
const userInfo = {
  token: uni.getStorageSync('token') || '',
  username: uni.getStorageSync('username') || '',
  userId: parseInt(uni.getStorageSync('userId')) || null
}

// 设置用户信息
export const setUserInfo = (data) => {
  userInfo.token = data.token
  userInfo.username = data.username
  userInfo.userId = parseInt(data.userId)
  
  // 存储到本地
  uni.setStorageSync('token', data.token)
  uni.setStorageSync('username', data.username)
  uni.setStorageSync('userId', data.userId)
  
  console.log('用户信息已更新：', userInfo) // 打印更新后的用户信息
}

// 清除用户信息
export const clearUserInfo = () => {
  userInfo.token = ''
  userInfo.username = ''
  userInfo.userId = null
  
  // 清除本地存储
  uni.removeStorageSync('token')
  uni.removeStorageSync('username')
  uni.removeStorageSync('userId')
}

// 获取用户信息
export const getUserInfo = () => {
  return {
    token: userInfo.token,
    username: userInfo.username,
    userId: userInfo.userId
  }
}

// 导出用户信息对象（只读）
export const user = {
  get token() { return userInfo.token },
  get username() { return userInfo.username },
  get userId() { return userInfo.userId }
} 