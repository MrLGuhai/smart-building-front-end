<template>
  <view class="login-container">
    <view class="login-card">
      <view class="login-header">
        <text class="login-title">欢迎登录</text>
        <text class="login-subtitle">请输入您的账号信息</text>
      </view>
      
      <view class="login-form">
        <view class="input-group">
          <uni-icons class="input-icon" type="person" size="20" color="#666"></uni-icons>
          <input 
            type="text" 
            v-model="formData.username" 
            placeholder="请输入用户名"
            class="input-field"
          />
        </view>
        
        <view class="input-group">
          <uni-icons class="input-icon" type="locked" size="20" color="#666"></uni-icons>
          <input 
            :type="showPassword ? 'text' : 'password'" 
            v-model="formData.password" 
            placeholder="请输入密码"
            class="input-field"
          />
        </view>
        
        <view class="form-footer">
          <label class="remember-me">
            <checkbox v-model="rememberPassword" color="#6c8bef" style="transform:scale(0.7)" />
            <text>记住我</text>
          </label>
          <text class="forgot-password" @click="handleForgotPassword">忘记密码？</text>
        </view>
        
        <button 
          class="login-button" 
          :class="{'login-button-disabled': !isFormValid || isLoading}"
          :disabled="!isFormValid || isLoading"
          @click="handleLogin"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
        
        <view class="register-link">
          <text>还没有账号？</text>
          <text class="link" @click="handleRegister">立即注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { authAPI } from '@/api'
import { setUserInfo } from '@/store/user'
import { getPublicKey, rsaEncrypt } from '@/utils/rsa'


const formData = reactive({
  username: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const isLoading = ref(false)
const rememberPassword = ref(false)

const isFormValid = computed(() => {
  return formData.username.trim() && formData.password.trim()
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  // 表单验证
  if (!formData.username.trim()) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    })
    return
  }
  
  if (!formData.password.trim()) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }

  // 设置加载状态
  isLoading.value = true
  
  try {
    // 获取RSA公钥
    const hasPublicKey = await getPublicKey()
    if (!hasPublicKey) {
      uni.showToast({
        title: '获取加密密钥失败',
        icon: 'none'
      })
      return
    }

    // RSA加密用户名和密码
    const encryptedUsername = rsaEncrypt(formData.username)
    const encryptedPassword = rsaEncrypt(formData.password)

    // 调用登录接口
    const res = await authAPI.login(encryptedUsername, encryptedPassword)

    if (res.code === 200) {
      // 保存用户信息
      setUserInfo({
        token: res.data.token,
        username: res.data.username,
        userId: parseInt(res.data.id)
      })
      
      // 如果选择记住密码，保存到本地存储
      if (rememberPassword.value) {
        uni.setStorageSync('rememberedUser', {
          username: formData.username,
          password: formData.password
        })
      } else {
        uni.removeStorageSync('rememberedUser')
      }

      uni.showToast({
        title: res.data.message || '登录成功',
        icon: 'none'
      })

      // 跳转到主页
      uni.redirectTo({
        url: '/pages/main/index'
      })
    } else {
      uni.showToast({
        title: res.data.message || '登录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({
      title: '登录失败，请稍后重试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = () => {
  // TODO: 实现忘记密码逻辑
  uni.showToast({
    title: '忘记密码功能开发中',
    icon: 'none'
  })
}

const handleRegister = () => {
  uni.navigateTo({
    url: '/pages/register/index'
  })
}

// 检查是否有记住的密码
const checkRememberedUser = () => {
  const rememberedUser = uni.getStorageSync('rememberedUser')
  if (rememberedUser) {
    formData.username = rememberedUser.username
    formData.password = rememberedUser.password
    rememberPassword.value = true
  }
}

// 页面加载时检查记住的密码
checkRememberedUser()
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7f7fd5, #86a8e7, #91eae4);
  padding: 20px;
  overflow: hidden;
}

.login-card {
  width: 85%;
  max-width: 340px;
  min-height: 480px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: center;
  margin-bottom: 50px;
  
  .login-title {
    font-size: 26px;
    font-weight: bold;
    color: #333;
    margin-bottom: 12px;
    display: block;
  }
  
  .login-subtitle {
    font-size: 14px;
    color: #666;
    display: block;
  }
}

.login-form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.input-group {
  position: relative;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 8px 0;
  
  .input-icon {
    margin-right: 12px;
  }
  
  .input-field {
    flex: 1;
    border: none;
    outline: none;
    font-size: 16px;
    color: #333;
    padding: 4px 0;
    background: transparent;
    
    &::placeholder {
      color: #999;
    }
  }
  
  .password-toggle {
    padding: 5px;
  }
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: auto 0 30px;
  
  .remember-me {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #666;
  }
  
  .forgot-password {
    font-size: 14px;
    color: #6c8bef;
  }
}

.login-button {
  width: 100%;
  height: 45px;
  background: linear-gradient(135deg, #6c8bef, #4a6fee);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
  
  &:active {
    opacity: 0.9;
  }
  
  &.login-button-disabled {
    background: #ccc;
    cursor: not-allowed;
    
    &:active {
      opacity: 1;
    }
  }
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-top: auto;
  
  .link {
    color: #6c8bef;
    margin-left: 5px;
  }
}
</style> 