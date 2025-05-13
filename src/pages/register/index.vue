<template>
  <view class="register-container">
    <view class="register-card">
      <view class="register-header">
        <text class="register-title">账号注册</text>
        <text class="register-subtitle">创建一个新的账号</text>
      </view>
      
      <view class="register-form">
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

        <view class="input-group">
          <uni-icons class="input-icon" type="locked" size="20" color="#666"></uni-icons>
          <input 
            :type="showConfirmPassword ? 'text' : 'password'" 
            v-model="formData.confirmPassword" 
            placeholder="请确认密码"
            class="input-field"
          />
        </view>
        
        <button 
          class="register-button" 
          :class="{'register-button-disabled': !canRegister || isLoading}"
          :disabled="!canRegister || isLoading"
          @click="handleRegister"
        >
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
        
        <view class="login-link">
          <text>已有账号？</text>
          <text class="link" @click="handleGoLogin">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { authAPI } from '@/api'
import { getPublicKey, rsaEncrypt } from '@/utils/rsa'

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const canRegister = computed(() => {
  return formData.username && 
         formData.password && 
         formData.confirmPassword
})

const handleRegister = async () => {
  if (!formData.username.trim()) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    })
    return
  }
  
  if (!formData.password || formData.password.length < 6) {
    uni.showToast({
      title: '密码不能少于6位',
      icon: 'none'
    })
    return
  }
  
  if (formData.password !== formData.confirmPassword) {
    uni.showToast({
      title: '两次输入的密码不一致',
      icon: 'none'
    })
    return
  }

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

    // 调用注册接口
    await authAPI.register(encryptedUsername, encryptedPassword)
    
    uni.showToast({
      title: '注册成功',
      icon: 'success',
      duration: 1500
    })
    
    // 等待提示显示完成后跳转
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/login/index'
      })
    }, 1500)
    
  } catch (error) {
    console.error('注册失败：', error)
    uni.showToast({
      title: '注册失败，请稍后重试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

const handleGoLogin = () => {
  uni.redirectTo({
    url: '/pages/login/index'
  })
}
</script>

<style lang="scss" scoped>
.register-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7f7fd5, #86a8e7, #91eae4);
  padding: 20px;
  overflow: hidden;
}

.register-card {
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

.register-header {
  text-align: center;
  margin-bottom: 40px;
  
  .register-title {
    font-size: 26px;
    font-weight: bold;
    color: #333;
    margin-bottom: 12px;
    display: block;
  }
  
  .register-subtitle {
    font-size: 14px;
    color: #666;
    display: block;
  }
}

.register-form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
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

.register-button {
  width: 100%;
  height: 45px;
  background: linear-gradient(135deg, #6c8bef, #4a6fee);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  margin: auto 0 20px;
  
  &:active {
    opacity: 0.9;
  }
  
  &.register-button-disabled {
    background: #ccc;
    cursor: not-allowed;
    
    &:active {
      opacity: 1;
    }
  }
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #666;
  
  .link {
    color: #6c8bef;
    margin-left: 5px;
  }
}
</style> 