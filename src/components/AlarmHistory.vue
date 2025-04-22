<template>
  <view class="alarm-history">
    <!-- 查询条件 -->
    <view class="search-conditions">
      <view class="condition-item">
        <text class="label">告警类型</text>
        <picker 
          :range="alarmTypes" 
          range-key="label"
          @change="handleAlarmTypeChange"
        >
          <view class="picker">
            {{ selectedAlarmType.label || '全部类型' }}
          </view>
        </picker>
      </view>
      
      <view class="condition-item">
        <text class="label">时间范围</text>
        <picker 
          mode="date" 
          :value="startDate"
          @change="handleStartDateChange"
        >
          <view class="picker">{{ startDate || '开始日期' }}</view>
        </picker>
        <text class="separator">至</text>
        <picker 
          mode="date" 
          :value="endDate"
          @change="handleEndDateChange"
        >
          <view class="picker">{{ endDate || '结束日期' }}</view>
        </picker>
      </view>
      
      <button class="search-btn" @click="handleSearch">查询</button>
    </view>
    
    <!-- 记录列表 -->
    <view class="record-list">
      <view class="record-item" v-for="(record, index) in records" :key="index">
        <view class="record-header">
          <text class="alarm-type">{{ getAlarmTypeName(record.alarmType) }}</text>
          <text class="record-time">{{ record.createTime }}</text>
        </view>
        <view class="record-content">
          <text class="value">实际值: {{ record.actualValue }}</text>
          <text class="threshold">阈值: {{ record.thresholdValue }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 告警类型选项
const alarmTypes = [
  { value: 0, label: '全部类型' },
  { value: 1, label: '温度过高' },
  { value: 2, label: '温度过低' },
  { value: 3, label: '湿度过高' },
  { value: 4, label: '湿度过低' },
  { value: 5, label: '光照过强' },
  { value: 6, label: '光照过弱' }
]

const selectedAlarmType = ref({ value: 0, label: '全部类型' })
const startDate = ref('')
const endDate = ref('')
const records = ref([])

// 获取告警类型名称
const getAlarmTypeName = (type) => {
  const alarm = alarmTypes.find(item => item.value === type)
  return alarm ? alarm.label : '未知类型'
}

// 处理告警类型选择
const handleAlarmTypeChange = (e) => {
  const index = e.detail.value
  selectedAlarmType.value = alarmTypes[index]
}

// 处理开始日期选择
const handleStartDateChange = (e) => {
  startDate.value = e.detail.value
}

// 处理结束日期选择
const handleEndDateChange = (e) => {
  endDate.value = e.detail.value
}

// 处理查询
const handleSearch = () => {
  // 后续会在这里实现查询逻辑
}
</script>

<style lang="scss" scoped>
.alarm-history {
  padding: 20px;
  
  .search-conditions {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 20px;
    align-items: center;
    
    .condition-item {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .label {
        font-size: 14px;
        color: #666;
      }
      
      .picker {
        padding: 8px 12px;
        background: #f5f7fa;
        border-radius: 4px;
        font-size: 14px;
        color: #333;
      }
      
      .separator {
        color: #666;
        margin: 0 8px;
      }
    }
    
    .search-btn {
      margin-left: auto;
      padding: 8px 24px;
      background: #4a6fee;
      color: #fff;
      border-radius: 4px;
      font-size: 14px;
    }
  }
  
  .record-list {
    .record-item {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      
      .record-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        
        .alarm-type {
          font-size: 15px;
          font-weight: 500;
          color: #333;
        }
        
        .record-time {
          font-size: 13px;
          color: #666;
        }
      }
      
      .record-content {
        display: flex;
        gap: 16px;
        
        .value, .threshold {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
}
</style> 