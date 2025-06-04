<template>
  <div v-if="visible" class="alarm-dialog-overlay">
    <div class="alarm-dialog">
      <div class="alarm-dialog-header">
        <span class="alarm-icon">⚠️</span>
        <span class="alarm-title">系统告警</span>
      </div>
      <div class="alarm-dialog-content">
        <div class="alarm-info">
          <div class="alarm-item">
            <span class="alarm-label">告警类型：</span>
            <span class="alarm-value">{{ alarmTypeName(alarmInfo.alarmType) }}</span>
          </div>
          <div class="alarm-item">
            <span class="alarm-label">实际值：</span>
            <span class="alarm-value">{{ alarmInfo.actualValue }}</span>
          </div>
          <div class="alarm-item">
            <span class="alarm-label">阈值：</span>
            <span class="alarm-value">{{ alarmInfo.thresholdValue }}</span>
          </div>
          <div class="alarm-item">
            <span class="alarm-label">时间：</span>
            <span class="alarm-value">{{ formatTime(alarmInfo.createTime) }}</span>
          </div>
        </div>
      </div>
      <div class="alarm-dialog-footer">
        <button class="confirm-btn" @click="handleConfirm">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  alarmInfo: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['confirm'])

// 告警类型名称转换
const alarmTypeName = (type) => {
  const map = {
    1: '温度过高',
    2: '温度回归正常',
    3: '湿度过高',
    4: '湿度回归正常',
    5: '光照过强',
    6: '光照过弱'
  }
  return map[type] || '未知类型'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  return time.replace('T', ' ').slice(0, 19)
}

// 确认按钮点击事件
const handleConfirm = () => {
  emit('confirm')
}
</script>

<style lang="scss" scoped>
.alarm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.alarm-dialog {
  background: linear-gradient(135deg, #1a2b3f 0%, #0a1a2f 100%);
  border-radius: 12px;
  padding: 20px;
  width: 400px;
  box-shadow: 0 0 20px rgba(30, 207, 255, 0.3);
  border: 1px solid rgba(30, 207, 255, 0.2);
}

.alarm-dialog-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(30, 207, 255, 0.2);
}

.alarm-icon {
  font-size: 24px;
  margin-right: 10px;
}

.alarm-title {
  font-size: 20px;
  color: #1ecfff;
  font-weight: bold;
}

.alarm-dialog-content {
  margin-bottom: 20px;
}

.alarm-info {
  .alarm-item {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
  }

  .alarm-label {
    color: #7ad0ff;
    width: 80px;
  }

  .alarm-value {
    color: #fff;
    font-weight: 500;
  }
}

.alarm-dialog-footer {
  text-align: right;
}

.confirm-btn {
  background: linear-gradient(90deg, #1ecfff, #00eaff);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 207, 255, 0.4);
  }
}
</style> 