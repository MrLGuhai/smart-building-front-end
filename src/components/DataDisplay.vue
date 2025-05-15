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

        <view class="data-card">
          <view class="card-header">
            <uni-icons type="cloud" size="24" color="#4a6fee"></uni-icons>
            <text class="card-title">烟雾浓度</text>
          </view>
          <view class="card-value">
            <text class="value">{{ environmentData.smoke }}</text>
            <text class="unit">ppm</text>
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
  light: 0,
  smoke: 0
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
      light: res.data.light,
      smoke: res.data.smoke
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
  padding: 32px;
  background: transparent;
}

.data-section {
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

.data-cards {
  display: flex;
  gap: 24px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.data-card {
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

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.status-card {
  background: rgba(20,34,56,0.92);
  border-radius: 16px;
  padding: 22px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px #1ecfff22;
  border: 1.5px solid #1ecfff22;
  transition: box-shadow 0.3s, border-color 0.3s;
  &:hover {
    box-shadow: 0 6px 24px #1ecfff55;
    border-color: #1ecfff;
  }
  .status-header {
    display: flex;
    align-items: center;
    gap: 10px;
    .status-title {
      font-size: 16px;
      color: #7ad0ff;
      font-weight: 600;
    }
  }
  .status-value {
    font-size: 18px;
    font-weight: 700;
    padding: 6px 18px;
    border-radius: 6px;
    text-align: center;
    min-width: 60px;
    &.status-on {
      background-color: #1ecfff33;
      color: #1ecfff;
      box-shadow: 0 0 8px #1ecfff55;
    }
    &.status-off {
      background-color: #2a3a4d;
      color: #999;
    }
    &.status-normal {
      background-color: #00b57833;
      color: #00e6a0;
      box-shadow: 0 0 8px #00e6a055;
    }
    &.status-error {
      background-color: #ff4d4f22;
      color: #ff4d4f;
      box-shadow: 0 0 8px #ff4d4f55;
    }
  }
}

@media (max-width: 1200px) {
  .data-cards {
    gap: 16px;
  }
  .status-cards {
    gap: 12px;
  }
  .data-card {
    min-width: 160px;
    padding: 18px 12px;
  }
  .status-card {
    padding: 12px 8px;
  }
}
@media (max-width: 900px) {
  .data-display {
    padding: 8px;
  }
  .data-card {
    min-width: 120px;
    padding: 10px 4px;
  }
  .status-card {
    padding: 8px 4px;
  }
}
</style> 