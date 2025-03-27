<template>
  <view class="data-display">
    <!-- 环境数据卡片 -->
    <view class="data-section">
      <view class="section-title">环境数据</view>
      <view class="data-cards">
        <view class="data-card">
          <view class="card-header">
            <uni-icons type="thermometer" size="24" color="#4a6fee"></uni-icons>
            <text class="card-title">温度</text>
          </view>
          <view class="card-value">
            <text class="value">{{ environmentData.temperature }}</text>
            <text class="unit">°C</text>
          </view>
        </view>

        <view class="data-card">
          <view class="card-header">
            <uni-icons type="wind" size="24" color="#4a6fee"></uni-icons>
            <text class="card-title">湿度</text>
          </view>
          <view class="card-value">
            <text class="value">{{ environmentData.humidity }}</text>
            <text class="unit">%</text>
          </view>
        </view>

        <view class="data-card">
          <view class="card-header">
            <uni-icons type="sun" size="24" color="#4a6fee"></uni-icons>
            <text class="card-title">光照强度</text>
          </view>
          <view class="card-value">
            <text class="value">{{ environmentData.light }}</text>
            <text class="unit">lx</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 设备状态卡片 -->
    <view class="data-section">
      <view class="section-title">设备状态</view>
      <view class="status-cards">
        <!-- 1. 警示灯 -->
        <view class="status-card">
          <view class="status-header">
            <uni-icons type="notification" size="20" color="#666"></uni-icons>
            <text class="status-title">警示灯状态</text>
          </view>
          <view :class="['status-value', deviceStatus.warningLight ? 'status-on' : 'status-off']">
            {{ deviceStatus.warningLight ? 'ON' : 'OFF' }}
          </view>
        </view>

        <!-- 2. 补光灯 -->
        <view class="status-card">
          <view class="status-header">
            <uni-icons type="notification-filled" size="20" color="#666"></uni-icons>
            <text class="status-title">补光灯状态</text>
          </view>
          <view :class="['status-value', deviceStatus.fillLight ? 'status-on' : 'status-off']">
            {{ deviceStatus.fillLight ? 'ON' : 'OFF' }}
          </view>
        </view>

        <!-- 3. 排气扇 -->
        <view class="status-card">
          <view class="status-header">
            <uni-icons type="refreshempty" size="20" color="#666"></uni-icons>
            <text class="status-title">排气扇状态</text>
          </view>
          <view :class="['status-value', deviceStatus.exhaustFan ? 'status-on' : 'status-off']">
            {{ deviceStatus.exhaustFan ? 'ON' : 'OFF' }}
          </view>
        </view>

        <!-- 4. 蜂鸣器 -->
        <view class="status-card">
          <view class="status-header">
            <uni-icons type="sound" size="20" color="#666"></uni-icons>
            <text class="status-title">蜂鸣器状态</text>
          </view>
          <view :class="['status-value', deviceStatus.alarm ? 'status-on' : 'status-off']">
            {{ deviceStatus.alarm ? 'ON' : 'OFF' }}
          </view>
        </view>

        <!-- 5. 应急逃生门 -->
        <view class="status-card">
          <view class="status-header">
            <uni-icons type="fire" size="20" color="#666"></uni-icons>
            <text class="status-title">应急逃生门状态</text>
          </view>
          <view :class="['status-value', deviceStatus.emergencyDoor ? 'status-on' : 'status-off']">
            {{ deviceStatus.emergencyDoor ? 'ON' : 'OFF' }}
          </view>
        </view>

        <!-- 6. DHT11模块 -->
        <view class="status-card">
          <view class="status-header">
            <uni-icons type="info" size="20" color="#666"></uni-icons>
            <text class="status-title">DHT11模块状态</text>
          </view>
          <view :class="['status-value', deviceStatus.dht11Status ? 'status-normal' : 'status-error']">
            {{ deviceStatus.dht11Status ? '正常' : '故障' }}
          </view>
        </view>

        <!-- 7. 光敏模块 -->
        <view class="status-card">
          <view class="status-header">
            <uni-icons type="info" size="20" color="#666"></uni-icons>
            <text class="status-title">光敏模块状态</text>
          </view>
          <view :class="['status-value', deviceStatus.lightSensorStatus ? 'status-normal' : 'status-error']">
            {{ deviceStatus.lightSensorStatus ? '正常' : '故障' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { environmentAPI, deviceAPI } from '@/api'

// 环境数据
const environmentData = ref({
  temperature: 0,
  humidity: 0,
  light: 0
})

// 设备状态
const deviceStatus = ref({
  warningLight: false,
  fillLight: false,
  exhaustFan: false,
  alarm: false,
  emergencyDoor: false,
  dht11Status: true,
  lightSensorStatus: true
})

// 轮询定时器
let pollTimer = null

// 获取环境数据
const fetchEnvironmentData = async () => {
  try {
    const res = await environmentAPI.getCurrentData()
    environmentData.value = {
      temperature: res.data.temperature,
      humidity: res.data.humidity,
      light: res.data.light
    }
  } catch (error) {
    console.error('获取环境数据失败：', error)
  }
}

// 获取设备状态
const fetchDeviceStatus = async () => {
  try {
    const res = await deviceAPI.getStatus()
    deviceStatus.value = res.data
  } catch (error) {
    console.error('获取设备状态失败：', error)
  }
}

// 开始轮询
const startPolling = () => {
  // 立即执行一次
  fetchEnvironmentData()
  fetchDeviceStatus()
  
  // 设置定时器，每5秒更新一次数据
  pollTimer = setInterval(() => {
    fetchEnvironmentData()
    fetchDeviceStatus()
  }, 5000)
}

// 组件挂载时开始轮询
onMounted(() => {
  startPolling()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
  }
})
</script>

<style lang="scss" scoped>
.data-display {
  padding: 20px;
}

.data-section {
  margin-bottom: 30px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    padding-left: 12px;
    border-left: 4px solid #4a6fee;
  }
}

.data-cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.data-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  min-width: 200px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-2px);
  }

  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .card-title {
      margin-left: 8px;
      font-size: 16px;
      color: #666;
    }
  }

  .card-value {
    display: flex;
    align-items: baseline;

    .value {
      font-size: 32px;
      font-weight: 600;
      color: #333;
    }

    .unit {
      margin-left: 4px;
      font-size: 16px;
      color: #666;
    }
  }
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.status-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-2px);
  }

  .status-header {
    display: flex;
    align-items: center;
    gap: 8px;

    .status-title {
      font-size: 14px;
      color: #666;
    }
  }

  .status-value {
    font-size: 16px;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 4px;
    text-align: center;
    
    &.status-on {
      background-color: #e6f3ff;
      color: #4a6fee;
    }
    
    &.status-off {
      background-color: #f5f5f5;
      color: #999;
    }
    
    &.status-normal {
      background-color: #e6fff1;
      color: #00b578;
    }
    
    &.status-error {
      background-color: #ffece8;
      color: #ff4d4f;
    }
  }
}
</style> 