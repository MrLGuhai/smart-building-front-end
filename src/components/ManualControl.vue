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
    const res = await deviceAPI.getControlStatus()
    // 更新初始状态和当前状态
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
  padding: 20px;
}

.control-section {
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 30px;
    padding-left: 12px;
    border-left: 4px solid #4a6fee;
  }
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.control-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  }

  .device-icon {
    width: 50px;
    height: 50px;
    background: #f5f7fa;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    transition: background-color 0.3s;
  }

  .device-info {
    flex: 1;
    margin-right: 16px;

    .device-name {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      display: block;
      margin-bottom: 4px;
    }

    .device-status {
      font-size: 14px;
      display: block;

      &.status-on {
        color: #4a6fee;
      }

      &.status-off {
        color: #999;
      }
    }
  }

  .control-switch {
    display: flex;
    align-items: center;
  }
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding: 0 20px;
}

.reset-button {
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

// 适配移动端
@media screen and (max-width: 768px) {
  .control-grid {
    grid-template-columns: 1fr;
  }

  .control-card {
    padding: 20px;
  }

  .button-group {
    flex-direction: column;
    align-items: center;
  }

  .reset-button,
  .submit-button {
    width: 100%;
    max-width: 300px;
  }
}
</style> 