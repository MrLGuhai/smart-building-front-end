<template>
  <view class="threshold-settings">
    <!-- 当前阈值显示 -->
    <view class="threshold-section">
      <view class="section-title">当前阈值</view>
      <view class="current-thresholds">
        <view class="threshold-card">
          <view class="card-header">
            <uni-icons type="thermometer" size="24" color="#4a6fee"></uni-icons>
            <text class="card-title">温度阈值</text>
          </view>
          <view class="card-value">
            <text class="value">{{ currentThresholds.temperature || '--' }}</text>
            <text class="unit">°C</text>
          </view>
        </view>

        <view class="threshold-card">
          <view class="card-header">
            <uni-icons type="wind" size="24" color="#4a6fee"></uni-icons>
            <text class="card-title">湿度阈值</text>
          </view>
          <view class="card-value">
            <text class="value">{{ currentThresholds.humidity || '--' }}</text>
            <text class="unit">%</text>
          </view>
        </view>

        <view class="threshold-card">
          <view class="card-header">
            <uni-icons type="sun" size="24" color="#4a6fee"></uni-icons>
            <text class="card-title">光照上限</text>
          </view>
          <view class="card-value">
            <text class="value">{{ currentThresholds.lightUpper || '--' }}</text>
            <text class="unit">lx</text>
          </view>
        </view>

        <view class="threshold-card">
          <view class="card-header">
            <uni-icons type="sun" size="24" color="#4a6fee"></uni-icons>
            <text class="card-title">光照下限</text>
          </view>
          <view class="card-value">
            <text class="value">{{ currentThresholds.lightLower || '--' }}</text>
            <text class="unit">lx</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 阈值设置表单 -->
    <view class="threshold-section">
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
import { ref, computed, onMounted } from 'vue'
import { thresholdAPI } from '@/api'
import { user } from '@/store/user'

// 打印用户信息，检查是否正确获取
console.log('当前用户信息：', user)

// 当前阈值数据
const currentThresholds = ref({
  temperature: null,
  humidity: null,
  lightUpper: null,
  lightLower: null
})

// 加载状态
const isLoading = ref(false)

// 表单数据
const formData = ref({
  temperature: null,
  humidity: null,
  lightUpper: null,
  lightLower: null
})

// 获取当前阈值设置
const fetchCurrentThresholds = async () => {
  try {
    const res = await thresholdAPI.getCurrentThresholds()
    if (res.data) {
      currentThresholds.value = {
        temperature: res.data.temperature,
        humidity: res.data.humidity,
        lightUpper: res.data.lightUpper,
        lightLower: res.data.lightLower
      }
    }
  } catch (error) {
    console.error('获取当前阈值失败：', error)
    uni.showToast({
      title: '获取阈值数据失败',
      icon: 'none'
    })
  }
}

// 表单验证
const isFormValid = computed(() => {
  const hasInput = formData.value.temperature || 
                   formData.value.humidity || 
                   formData.value.lightUpper || 
                   formData.value.lightLower

  // 如果设置了光照强度的任一值，则需要验证上下限关系
  if (formData.value.lightUpper && formData.value.lightLower) {
    return hasInput && Number(formData.value.lightUpper) > Number(formData.value.lightLower)
  }

  return hasInput
})

// 验证表单
const validateForm = computed(() => {
  // 检查是否有任何输入
  const hasInput = Object.values(formData.value).some(value => value !== null && value !== '')
  if (!hasInput) {
    return {
      isValid: false,
      message: '请至少设置一项阈值'
    }
  }

  // 检查光强上下限
  const lightUpper = formData.value.lightUpper
  const lightLower = formData.value.lightLower
  
  // 如果设置了上限，需要与当前下限比较
  if (lightUpper !== null && lightUpper !== '') {
    const upper = Number(lightUpper)
    const currentLower = Number(currentThresholds.value.lightLower)
    if (currentLower && upper <= currentLower) {
      return {
        isValid: false,
        message: '光强上限必须大于当前下限'
      }
    }
  }

  // 如果设置了下限，需要与当前上限比较
  if (lightLower !== null && lightLower !== '') {
    const lower = Number(lightLower)
    const currentUpper = Number(currentThresholds.value.lightUpper)
    if (currentUpper && lower >= currentUpper) {
      return {
        isValid: false,
        message: '光强下限必须小于当前上限'
      }
    }
  }

  // 如果同时设置了上下限，需要验证它们之间的关系
  if (lightUpper !== null && lightUpper !== '' && lightLower !== null && lightLower !== '') {
    const upper = Number(lightUpper)
    const lower = Number(lightLower)
    if (upper <= lower) {
      return {
        isValid: false,
        message: '光强上限必须大于下限'
      }
    }
  }

  return {
    isValid: true,
    message: ''
  }
})

// 提交表单
const handleSubmit = async () => {
  if (isLoading.value) return
  
  const validation = validateForm.value
  if (!validation.isValid) {
    uni.showToast({
      title: validation.message,
      icon: 'none'
    })
    return
  }

  isLoading.value = true
  try {
    // 构造提交数据，只包含非空值
    const submitData = {
      userId: user.userId
    }
    
    // 处理光强阈值
    if (formData.value.lightUpper !== null && formData.value.lightUpper !== '') {
      submitData.lightUpper = Number(formData.value.lightUpper)
    }
    if (formData.value.lightLower !== null && formData.value.lightLower !== '') {
      submitData.lightLower = Number(formData.value.lightLower)
    }
    
    // 处理其他阈值
    if (formData.value.temperature !== null && formData.value.temperature !== '') {
      submitData.temperature = Number(formData.value.temperature)
    }
    if (formData.value.humidity !== null && formData.value.humidity !== '') {
      submitData.humidity = Number(formData.value.humidity)
    }

    await thresholdAPI.updateThresholds(submitData)
    
    // 重置表单
    resetForm()
    
    uni.showToast({
      title: '阈值设置成功',
      icon: 'success'
    })
    // 刷新当前阈值显示
    await fetchCurrentThresholds()
  } catch (error) {
    console.error('设置阈值失败：', error)
    uni.showToast({
      title: error.message || '设置失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.value.temperature = null
  formData.value.humidity = null
  formData.value.lightUpper = null
  formData.value.lightLower = null
}

const handleClear = () => {
  // 清空所有输入值
  formData.value.temperature = null
  formData.value.humidity = null
  formData.value.lightUpper = null
  formData.value.lightLower = null
  
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
  padding: 32px;
  background: transparent;
}

.threshold-section {
  margin-bottom: 36px;
  .section-title {
    font-size: 20px;
    font-weight: 700;
    color: #1ecfff;
    margin-bottom: 24px;
    padding-left: 14px;
    border-left: 4px solid #1ecfff;
    letter-spacing: 2px;
    text-shadow: 0 0 8px #1ecfff55;
  }
}

.current-thresholds {
  display: flex;
  gap: 24px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.threshold-card {
  background: rgba(20,34,56,0.92);
  border-radius: 18px;
  padding: 32px 16px;
  min-width: 150px;
  max-width: 200px;
  flex: 1 1 0;
  box-shadow: 0 4px 24px #1ecfff22;
  border: 1.5px solid #1ecfff33;
  transition: transform 0.3s, box-shadow 0.3s;
  &:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 8px 32px #1ecfff55;
    border-color: #1ecfff;
  }
  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
    .card-title {
      margin-left: 10px;
      font-size: 18px;
      color: #7ad0ff;
      font-weight: 600;
      letter-spacing: 1px;
    }
  }
  .card-value {
    display: flex;
    align-items: baseline;
    .value {
      font-size: 38px;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 0 8px #1ecfff33;
    }
    .unit {
      margin-left: 6px;
      font-size: 18px;
      color: #7ad0ff;
    }
  }
}

.settings-form {
  max-width: 1200px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  @media screen and (max-width: 768px) {
    flex-direction: column;
  }
}

.form-item {
  flex: 1;
  background: rgba(20,34,56,0.92);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px #1ecfff22;
  border: 1.5px solid #1ecfff22;
  transition: box-shadow 0.3s, border-color 0.3s;
  &:hover {
    box-shadow: 0 6px 24px #1ecfff55;
    border-color: #1ecfff;
  }
  .item-header {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
    .item-title {
      margin-left: 10px;
      font-size: 17px;
      color: #7ad0ff;
      font-weight: 600;
    }
  }
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #1a2b3f;
  border-radius: 8px;
  padding: 0 18px;
  height: 48px;
  border: 1.5px solid #1ecfff33;
  transition: border-color 0.2s, box-shadow 0.2s;
  .threshold-input {
    flex: 1;
    height: 100%;
    border: none;
    background: transparent;
    font-size: 18px;
    color: #fff;
    font-weight: 600;
    &::placeholder {
      color: #7ad0ff99;
    }
    &:focus {
      outline: none;
    }
  }
  .unit {
    margin-left: 10px;
    font-size: 16px;
    color: #1ecfff;
    font-weight: 600;
  }
  &:focus-within {
    border-color: #1ecfff;
    box-shadow: 0 0 8px #1ecfff55;
  }
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 32px;
}

.clear-button {
  width: 180px;
  height: 45px;
  background: transparent;
  border: 1.5px solid #1ecfff;
  border-radius: 25px;
  color: #1ecfff;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  &:hover {
    background: #1ecfff22;
    color: #fff;
  }
  &:active {
    background: #1ecfff33;
  }
}

.submit-button {
  width: 180px;
  height: 45px;
  background: linear-gradient(135deg, #6c8bef, #1ecfff);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  transition: opacity 0.3s, background 0.2s;
  box-shadow: 0 2px 12px #1ecfff33;
  &:hover {
    opacity: 0.92;
    background: linear-gradient(135deg, #1ecfff, #6c8bef);
  }
  &:active {
    opacity: 0.85;
  }
  &:disabled {
    background: #2a3a4d;
    color: #999;
    cursor: not-allowed;
    opacity: 1;
  }
}

@media (max-width: 1200px) {
  .current-thresholds {
    gap: 12px;
  }
  .threshold-card {
    min-width: 160px;
    padding: 18px 12px;
  }
  .form-row {
    gap: 12px;
  }
  .form-item {
    padding: 12px 8px;
  }
}
@media (max-width: 900px) {
  .threshold-settings {
    padding: 8px;
  }
  .threshold-card {
    min-width: 120px;
    padding: 10px 4px;
  }
  .form-item {
    padding: 8px 4px;
  }
}
</style> 