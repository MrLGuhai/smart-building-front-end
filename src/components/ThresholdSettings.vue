<template>
  <view class="threshold-settings">
    <view class="settings-section">
      <view class="section-title">阈值设置</view>
      <view class="settings-form">
        <view class="form-row">
          <!-- 温度阈值 -->
          <view class="form-item">
            <view class="item-header">
              <uni-icons type="thermometer" size="20" color="#4a6fee"></uni-icons>
              <text class="item-title">温度阈值</text>
            </view>
            <view class="input-wrapper">
              <input 
                type="number" 
                v-model="formData.temperature" 
                class="threshold-input"
                placeholder="请输入温度阈值"
              />
              <text class="unit">°C</text>
            </view>
          </view>

          <!-- 湿度阈值 -->
          <view class="form-item">
            <view class="item-header">
              <uni-icons type="wind" size="20" color="#4a6fee"></uni-icons>
              <text class="item-title">湿度阈值</text>
            </view>
            <view class="input-wrapper">
              <input 
                type="number" 
                v-model="formData.humidity" 
                class="threshold-input"
                placeholder="请输入湿度阈值"
              />
              <text class="unit">%</text>
            </view>
          </view>
        </view>

        <view class="form-row">
          <!-- 光照强度阈值上限 -->
          <view class="form-item">
            <view class="item-header">
              <uni-icons type="sun" size="20" color="#4a6fee"></uni-icons>
              <text class="item-title">光照强度阈值上限</text>
            </view>
            <view class="input-wrapper">
              <input 
                type="number" 
                v-model="formData.lightUpper" 
                class="threshold-input"
                placeholder="请输入光照强度上限"
              />
              <text class="unit">lx</text>
            </view>
          </view>

          <!-- 光照强度阈值下限 -->
          <view class="form-item">
            <view class="item-header">
              <uni-icons type="sun" size="20" color="#4a6fee"></uni-icons>
              <text class="item-title">光照强度阈值下限</text>
            </view>
            <view class="input-wrapper">
              <input 
                type="number" 
                v-model="formData.lightLower" 
                class="threshold-input"
                placeholder="请输入光照强度下限"
              />
              <text class="unit">lx</text>
            </view>
          </view>
        </view>

        <!-- 按钮组 -->
        <view class="button-group">
          <button 
            class="clear-button" 
            @click="handleClear"
          >
            一键清空
          </button>
          <button 
            class="submit-button" 
            :disabled="!isFormValid"
            @click="handleSubmit"
          >
            保存设置
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { thresholdAPI } from '@/api'

const formData = reactive({
  temperature: '',
  humidity: '',
  lightUpper: '',
  lightLower: ''
})

// 获取当前阈值设置
const fetchCurrentThresholds = async () => {
  try {
    const res = await thresholdAPI.getCurrentThresholds()
    formData.temperature = res.data.temperatureMax
    formData.humidity = res.data.humidityMax
    formData.lightUpper = res.data.lightMax
    formData.lightLower = res.data.lightMin
  } catch (error) {
    console.error('获取阈值设置失败：', error)
  }
}

// 表单验证：检查是否有输入值，以及光照强度的上下限关系
const isFormValid = computed(() => {
  const hasInput = formData.temperature || 
                   formData.humidity || 
                   formData.lightUpper || 
                   formData.lightLower

  // 如果设置了光照强度的任一值，则需要验证上下限关系
  if (formData.lightUpper && formData.lightLower) {
    return hasInput && Number(formData.lightUpper) > Number(formData.lightLower)
  }

  return hasInput
})

const handleSubmit = async () => {
  // 如果同时设置了上下限，需要验证大小关系
  if (formData.lightUpper && formData.lightLower) {
    if (Number(formData.lightUpper) <= Number(formData.lightLower)) {
      uni.showToast({
        title: '光照强度上限必须大于下限',
        icon: 'none'
      })
      return
    }
  }

  // 检查是否有任何输入
  if (!isFormValid.value) {
    uni.showToast({
      title: '请至少设置一项阈值',
      icon: 'none'
    })
    return
  }

  try {
    await thresholdAPI.updateThresholds({
      temperatureMax: formData.temperature ? Number(formData.temperature) : undefined,
      humidityMax: formData.humidity ? Number(formData.humidity) : undefined,
      lightMax: formData.lightUpper ? Number(formData.lightUpper) : undefined,
      lightMin: formData.lightLower ? Number(formData.lightLower) : undefined
    })
    
    uni.showToast({
      title: '设置已保存',
      icon: 'success'
    })
  } catch (error) {
    console.error('更新阈值设置失败：', error)
  }
}

const handleClear = () => {
  // 清空所有输入值
  formData.temperature = ''
  formData.humidity = ''
  formData.lightUpper = ''
  formData.lightLower = ''
  
  // 显示提示
  uni.showToast({
    title: '已清空所有输入',
    icon: 'success'
  })
}

// 组件挂载时获取当前阈值设置
onMounted(() => {
  fetchCurrentThresholds()
})
</script>

<style lang="scss" scoped>
.threshold-settings {
  padding: 20px;
}

.settings-section {
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 30px;
    padding-left: 12px;
    border-left: 4px solid #4a6fee;
  }
}

.settings-form {
  max-width: 1200px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  @media screen and (max-width: 768px) {
    flex-direction: column;
  }
}

.form-item {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-2px);
  }

  .item-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .item-title {
      margin-left: 8px;
      font-size: 16px;
      color: #666;
    }
  }
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 0 16px;
  height: 45px;

  .threshold-input {
    flex: 1;
    height: 100%;
    border: none;
    background: transparent;
    font-size: 16px;
    color: #333;

    &::placeholder {
      color: #999;
    }
  }

  .unit {
    margin-left: 8px;
    font-size: 14px;
    color: #666;
  }
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.clear-button {
  width: 200px;
  height: 45px;
  background: #fff;
  border: 1px solid #4a6fee;
  border-radius: 25px;
  color: #4a6fee;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;

  &:active {
    background: #f0f5ff;
  }
}

.submit-button {
  width: 200px;
  height: 45px;
  background: linear-gradient(135deg, #6c8bef, #4a6fee);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  transition: opacity 0.3s;

  &:active {
    opacity: 0.9;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;

    &:active {
      opacity: 1;
    }
  }
}
</style> 