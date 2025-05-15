<template>
  <view class="manual-control">
    <view class="control-section">
      <view class="section-title">手动控制</view>
      <view class="control-grid">
        <!-- 警示灯控制 -->
        <view class="control-card">
          <view class="device-icon">
            <uni-icons type="notification" size="28" :color="deviceStatus.warningLight ? '#4a6fee' : '#666'"></uni-icons>
          </view>
          <view class="device-info">
            <text class="device-name">警示灯</text>
            <text class="device-status" :class="deviceStatus.warningLight ? 'status-on' : 'status-off'">
              {{ deviceStatus.warningLight ? '开启' : '关闭' }}
            </text>
          </view>
          <view class="control-switch">
            <switch 
              :checked="deviceStatus.warningLight"
              @change="(e) => handleDeviceControl('warningLight', e.detail.value)"
              color="#4a6fee"
            />
          </view>
        </view>

        <!-- 补光灯控制 -->
        <view class="control-card">
          <view class="device-icon">
            <uni-icons type="notification-filled" size="28" :color="deviceStatus.fillLight ? '#4a6fee' : '#666'"></uni-icons>
          </view>
          <view class="device-info">
            <text class="device-name">补光灯</text>
            <text class="device-status" :class="deviceStatus.fillLight ? 'status-on' : 'status-off'">
              {{ deviceStatus.fillLight ? '开启' : '关闭' }}
            </text>
          </view>
          <view class="control-switch">
            <switch 
              :checked="deviceStatus.fillLight"
              @change="(e) => handleDeviceControl('fillLight', e.detail.value)"
              color="#4a6fee"
            />
          </view>
        </view>

        <!-- 排气扇控制 -->
        <view class="control-card">
          <view class="device-icon">
            <uni-icons type="refreshempty" size="28" :color="deviceStatus.exhaustFan ? '#4a6fee' : '#666'"></uni-icons>
          </view>
          <view class="device-info">
            <text class="device-name">排气扇</text>
            <text class="device-status" :class="deviceStatus.exhaustFan ? 'status-on' : 'status-off'">
              {{ deviceStatus.exhaustFan ? '开启' : '关闭' }}
            </text>
          </view>
          <view class="control-switch">
            <switch 
              :checked="deviceStatus.exhaustFan"
              @change="(e) => handleDeviceControl('exhaustFan', e.detail.value)"
              color="#4a6fee"
            />
          </view>
        </view>

        <!-- 警报器控制 -->
        <view class="control-card">
          <view class="device-icon">
            <uni-icons type="sound" size="28" :color="deviceStatus.alarm ? '#4a6fee' : '#666'"></uni-icons>
          </view>
          <view class="device-info">
            <text class="device-name">警报器</text>
            <text class="device-status" :class="deviceStatus.alarm ? 'status-on' : 'status-off'">
              {{ deviceStatus.alarm ? '开启' : '关闭' }}
            </text>
          </view>
          <view class="control-switch">
            <switch 
              :checked="deviceStatus.alarm"
              @change="(e) => handleDeviceControl('alarm', e.detail.value)"
              color="#4a6fee"
            />
          </view>
        </view>

        <!-- 应急逃生门控制 -->
        <view class="control-card">
          <view class="device-icon">
            <uni-icons type="fire" size="28" :color="deviceStatus.emergencyDoor ? '#4a6fee' : '#666'"></uni-icons>
          </view>
          <view class="device-info">
            <text class="device-name">应急逃生门</text>
            <text class="device-status" :class="deviceStatus.emergencyDoor ? 'status-on' : 'status-off'">
              {{ deviceStatus.emergencyDoor ? '开启' : '关闭' }}
            </text>
          </view>
          <view class="control-switch">
            <switch 
              :checked="deviceStatus.emergencyDoor"
              @change="(e) => handleDeviceControl('emergencyDoor', e.detail.value)"
              color="#4a6fee"
            />
          </view>
        </view>
      </view>

      <!-- 按钮组 -->
      <view class="button-group">
        <button 
          class="reset-button" 
          @click="resetStatus"
        >
          重置状态
        </button>
        <button 
          class="submit-button" 
          :disabled="!hasChanges"
          @click="handleSubmit"
        >
          提交更改
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { deviceAPI } from '@/api'
import { user } from '@/store/user'

// 初始状态
const initialStatus = ref({
  warningLight: false,
  fillLight: false,
  exhaustFan: false,
  alarm: false,
  emergencyDoor: false
})

// 当前状态
const deviceStatus = reactive({
  warningLight: false,
  fillLight: false,
  exhaustFan: false,
  alarm: false,
  emergencyDoor: false
})

// 记录修改过的设备
const modifiedDevices = reactive({
  warningLight: false,
  fillLight: false,
  exhaustFan: false,
  alarm: false,
  emergencyDoor: false
})

// 判断是否有更改
const hasChanges = ref(false)
const isLoading = ref(false)

// 检查状态变化
const checkChanges = () => {
  const hasChanged = Object.keys(deviceStatus).some(
    key => deviceStatus[key] !== initialStatus.value[key]
  )
  hasChanges.value = hasChanged
}

// 重置状态
const resetStatus = () => {
  Object.keys(deviceStatus).forEach(key => {
    deviceStatus[key] = initialStatus.value[key]
    modifiedDevices[key] = false // 重置修改记录
  })
  hasChanges.value = false
  uni.showToast({
    title: '已重置状态',
    icon: 'success'
  })
}

// 获取初始状态
const fetchInitialStatus = async () => {
  try {
    const res = await deviceAPI.getStatus()
    // 更新初始状态和当前状态
    // ...是JavaScript对象的扩展运算符，用于将一个对象的属性复制到另一个对象中。
    // 它会创建一个新对象，而不是直接引用源对象。
    initialStatus.value = { ...res.data }
    Object.keys(deviceStatus).forEach(key => {
      deviceStatus[key] = res.data[key]
      modifiedDevices[key] = false // 初始化修改记录
    })
  } catch (error) {
    console.error('获取设备状态失败：', error)
    uni.showToast({
      title: '获取设备状态失败',
      icon: 'none'
    })
  }
}

// 处理设备控制
const handleDeviceControl = (device, status) => {
  deviceStatus[device] = status
  modifiedDevices[device] = true // 标记该设备已被修改
  checkChanges()
}

// 提交更改
const handleSubmit = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    // 构造只包含修改过的设备状态的数据
    const submitData = {
      userId: user.userId  // 添加用户ID
    }
    Object.keys(modifiedDevices).forEach(key => {
      if (modifiedDevices[key]) {
        submitData[key] = deviceStatus[key]
      }
    })

    await deviceAPI.updateControl(submitData)
    
    // 更新初始状态
    initialStatus.value = { ...deviceStatus }
    // 重置修改记录
    Object.keys(modifiedDevices).forEach(key => {
      modifiedDevices[key] = false
    })
    hasChanges.value = false
    
    uni.showToast({
      title: '更改已提交',
      icon: 'success'
    })
  } catch (error) {
    console.error('提交设备控制失败：', error)
    uni.showToast({
      title: error.message || '提交失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时获取初始状态
onMounted(() => {
  fetchInitialStatus()
})
</script>

<style lang="scss" scoped>
.manual-control {
  padding: 32px;
  background: transparent;
}

.control-section {
  .section-title {
    font-size: 20px;
    font-weight: 700;
    color: #1ecfff;
    margin-bottom: 32px;
    padding-left: 14px;
    border-left: 4px solid #1ecfff;
    letter-spacing: 2px;
    text-shadow: 0 0 8px #1ecfff55;
  }
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.control-card {
  background: rgba(20,34,56,0.92);
  border-radius: 18px;
  padding: 32px 36px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 24px #1ecfff22;
  border: 1.5px solid #1ecfff33;
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
  &:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 8px 32px #1ecfff55;
    border-color: #1ecfff;
  }
  .device-icon {
    width: 54px;
    height: 54px;
    background: #1a2b3f;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 18px;
    transition: background-color 0.3s;
  }
  .device-info {
    flex: 1;
    margin-right: 18px;
    .device-name {
      font-size: 18px;
      font-weight: 600;
      color: #7ad0ff;
      display: block;
      margin-bottom: 6px;
      letter-spacing: 1px;
    }
    .device-status {
      font-size: 16px;
      display: block;
      font-weight: 700;
      &.status-on {
        color: #1ecfff;
        text-shadow: 0 0 8px #1ecfff55;
      }
      &.status-off {
        color: #999;
      }
    }
  }
  .control-switch {
    display: flex;
    align-items: center;
    .uni-switch {
      --switch-checked-color: #1ecfff;
      --switch-border-color: #1ecfff55;
      --switch-bg-color: #1a2b3f;
      --switch-width: 56px;
      --switch-height: 32px;
    }
  }
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 36px;
  padding: 0 20px;
}

.reset-button {
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

@media screen and (max-width: 1200px) {
  .control-grid {
    gap: 16px;
  }
  .control-card {
    min-width: 180px;
    padding: 18px 12px;
  }
  .button-group {
    gap: 16px;
  }
}
@media screen and (max-width: 900px) {
  .manual-control {
    padding: 8px;
  }
  .control-card {
    min-width: 120px;
    padding: 10px 4px;
  }
  .button-group {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .reset-button,
  .submit-button {
    width: 100%;
    max-width: 300px;
  }
}
</style> 