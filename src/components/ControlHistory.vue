<template>
  <view class="control-history">
    <!-- 搜索表单 -->
    <view class="search-form">
      <view class="form-content">
        <view class="form-item limit-item">
          <text class="label">记录数量</text>
          <input 
            class="input" 
            type="number" 
            v-model="searchParams.limit" 
            placeholder="默认100条"
          />
        </view>

        <view class="form-item device-item">
          <text class="label">设备类型</text>
          <picker 
            :range="deviceTypes" 
            range-key="label"
            :value="deviceTypeIndex"
            @change="handleDeviceTypeChange"
          >
            <view class="picker">
              {{ searchParams.deviceType ? getDeviceTypeName(searchParams.deviceType) : '请选择设备类型' }}
            </view>
          </picker>
        </view>

        <view class="form-item user-item">
          <text class="label">用户ID</text>
          <input 
            class="input" 
            type="number" 
            v-model="searchParams.userId" 
            placeholder="请输入用户ID"
          />
        </view>

        <view class="form-item">
          <text class="label">开始时间</text>
          <uni-datetime-picker
            type="datetime"
            v-model="searchParams.startTime"
            :end="now"
            return-type="timestamp"
            @change="handleStartTimeChange"
          />
        </view>

        <view class="form-item">
          <text class="label">结束时间</text>
          <uni-datetime-picker
            type="datetime"
            v-model="searchParams.endTime"
            :end="now"
            return-type="timestamp"
            @change="handleEndTimeChange"
          />
        </view>

        <view class="form-item btn-item">
          <button 
            class="search-btn" 
            :disabled="loading" 
            :loading="loading"
            @click="handleSearch"
          >
            查询
          </button>
        </view>
      </view>
    </view>

    <!-- 记录列表 -->
    <view class="records-list">
      <view class="table-header">
        <text class="header-item index">序号</text>
        <text class="header-item record-id">记录ID</text>
        <text class="header-item user-id">用户ID</text>
        <text class="header-item device-type">设备类型</text>
        <text class="header-item action">控制动作</text>
        <text class="header-item time">操作时间</text>
      </view>

      <scroll-view 
        class="table-body" 
        scroll-y
      >
        <view 
          class="table-row"
          v-for="(record, index) in controlRecords" 
          :key="record.id"
        >
          <text class="cell index">{{ index + 1 }}</text>
          <text class="cell record-id">{{ record.id }}</text>
          <text class="cell user-id">{{ record.userId }}</text>
          <text class="cell device-type">{{ getDeviceTypeName(record.deviceType) }}</text>
          <text class="cell action">{{ record.controlAction ? '开启' : '关闭' }}</text>
          <text class="cell time">{{ formatDateTime(new Date(record.createTime)) }}</text>
        </view>
        <view v-if="controlRecords.length === 0" class="empty-tip">
          暂无数据
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { deviceAPI } from '@/api'

// 当前时间
const now = ref(Date.now())

// 设备类型选项
const deviceTypes = [
  { value: null, label: '全部' },
  { value: 1, label: '警示灯' },
  { value: 2, label: '补光灯' },
  { value: 3, label: '排气扇' },
  { value: 4, label: '警报器' },
  { value: 5, label: '应急逃生门' }
]

// 搜索参数
const searchParams = ref({
  deviceType: null,
  userId: '',
  startTime: '',
  endTime: '',
  limit: 100
})

// 设备类型索引
const deviceTypeIndex = computed(() => {
  if (searchParams.value.deviceType === null) return 0
  return deviceTypes.findIndex(item => item.value === searchParams.value.deviceType)
})

// 控制记录数据
const controlRecords = ref([])
const loading = ref(false)

// 获取设备类型名称
const getDeviceTypeName = (type) => {
  if (type === null) return '全部'
  const device = deviceTypes.find(item => item.value === type)
  return device ? device.label : '未知设备'
}

// 处理设备类型选择
const handleDeviceTypeChange = (e) => {
  const index = e.detail.value
  searchParams.value.deviceType = deviceTypes[index].value
}

// 格式化日期时间
const formatDateTime = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 验证时间范围
const validateTimeRange = () => {
  const { startTime, endTime } = searchParams.value
  if (startTime && endTime) {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const now = new Date()
    
    if (start > end) {
      uni.showToast({
        title: '开始时间不能晚于结束时间',
        icon: 'none'
      })
      searchParams.value.startTime = ''
      searchParams.value.endTime = ''
      return false
    }
    
    if (start > now || end > now) {
      uni.showToast({
        title: '时间不能晚于当前时间',
        icon: 'none'
      })
      searchParams.value.startTime = ''
      searchParams.value.endTime = ''
      return false
    }
  }
  return true
}

// 处理开始时间选择
const handleStartTimeChange = (timestamp) => {
  if (timestamp) {
    searchParams.value.startTime = formatDateTime(new Date(timestamp))
    validateTimeRange()
  } else {
    searchParams.value.startTime = ''
  }
}

// 处理结束时间选择
const handleEndTimeChange = (timestamp) => {
  if (timestamp) {
    searchParams.value.endTime = formatDateTime(new Date(timestamp))
    validateTimeRange()
  } else {
    searchParams.value.endTime = ''
  }
}

// 获取控制记录
const fetchControlRecords = async () => {
  try {
    loading.value = true
    // 构建请求参数
    const params = {
      limit: searchParams.value.limit
    }
    
    // 只有在有值且不为null时才添加参数
    if (searchParams.value.deviceType !== null) {
      params.deviceType = searchParams.value.deviceType
    }
    if (searchParams.value.userId) {
      params.userId = parseInt(searchParams.value.userId)
    }
    if (searchParams.value.startTime) {
      params.startTime = searchParams.value.startTime
    }
    if (searchParams.value.endTime) {
      params.endTime = searchParams.value.endTime
    }
    
    const res = await deviceAPI.getControlRecords(params)
    if (res.code === 200) {
      controlRecords.value = Array.isArray(res.data) ? res.data : []
    } else {
      uni.showToast({
        title: res.message || '获取控制记录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取控制记录失败:', error)
    uni.showToast({
      title: '获取控制记录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = async () => {
  if (!validateTimeRange()) return
  
  // 如果只设置了一个时间，提示需要同时设置
  if ((searchParams.value.startTime && !searchParams.value.endTime) || 
      (!searchParams.value.startTime && searchParams.value.endTime)) {
    uni.showToast({
      title: '开始时间和结束时间需要同时设置',
      icon: 'none'
    })
    return
  }
  
  await fetchControlRecords()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchControlRecords()
})
</script>

<style lang="scss" scoped>
.control-history {
  padding: 20rpx;
  
  .search-form {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    
    .form-content {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 20rpx;
      
      .form-item {
        display: flex;
        align-items: center;
        
        // 记录数量输入框样式
        &.limit-item {
          flex: 0 0 200rpx;
          
          .input {
            width: 120rpx;
          }
        }
        
        // 设备类型选择器样式
        &.device-item {
          flex: 0 0 300rpx;
          
          .picker {
            width: 220rpx;
          }
        }
        
        // 用户ID输入框样式
        &.user-item {
          flex: 0 0 240rpx;
          
          .input {
            width: 160rpx;
          }
        }
        
        // 时间选择器样式
        &:has(.uni-datetime-picker) {
          flex: 0 0 420rpx;
        }
        
        :deep(.uni-datetime-picker) {
          flex: 1;
          width: 100%;
          
          .uni-datetime-picker-timebox {
            width: 320rpx;
            height: 68rpx;
            line-height: 68rpx;
            padding: 0 16rpx;
            background-color: #f8f9fc;
            border-radius: 6rpx;
            font-size: 26rpx;
            border: 1rpx solid #eaecf3;
            transition: all 0.3s ease;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            
            &:hover {
              border-color: #4a6fee;
              background-color: #f5f7ff;
            }
            
            .uni-datetime-picker-time {
              line-height: 66rpx;
              height: 66rpx;
              color: #333;
            }
          }
        }
        
        .label {
          font-size: 26rpx;
          color: #333;
          margin-right: 12rpx;
          white-space: nowrap;
          font-weight: 500;
        }
        
        .picker, .input {
          height: 68rpx;
          line-height: 68rpx;
          padding: 0 16rpx;
          background-color: #f8f9fc;
          border-radius: 6rpx;
          font-size: 26rpx;
          color: #333;
          border: 1rpx solid #eaecf3;
          transition: all 0.3s ease;
          
          &:hover, &:focus {
            border-color: #4a6fee;
            background-color: #f5f7ff;
          }
        }
        
        .input {
          text-align: center;
        }
      }
      
      .search-btn {
        margin-left: auto;
        width: 120rpx;
        height: 68rpx;
        line-height: 68rpx;
        text-align: center;
        background-color: #4a6fee;
        color: #fff;
        border-radius: 6rpx;
        font-size: 26rpx;
        padding: 0;
        transition: all 0.3s ease;
        flex-shrink: 0;
        
        &:hover {
          background-color: #3d5ed9;
        }
        
        &[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
  }
  
  .records-list {
    background-color: #fff;
    border-radius: 8rpx;
    padding: 20rpx;
    
    .table-header {
      display: flex;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #eee;
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
    }
    
    .table-body {
      height: calc(100vh - 600rpx);
      
      .table-row {
        display: flex;
        padding: 20rpx 0;
        border-bottom: 1rpx solid #eee;
        font-size: 28rpx;
        color: #666;
        
        &:last-child {
          border-bottom: none;
        }
      }
    }
    
    .header-item,
    .cell {
      flex: 1;
      padding: 0 10rpx;
      
      &.index {
        flex: 0.5;
      }
      
      &.record-id {
        flex: 0.8;
      }
      
      &.user-id {
        flex: 0.8;
      }
      
      &.device-type {
        flex: 1.2;
      }
      
      &.action {
        flex: 0.8;
      }
      
      &.time {
        flex: 1.5;
      }
    }
    
    .empty-tip {
      text-align: center;
      padding: 40rpx 0;
      color: #999;
      font-size: 28rpx;
    }
  }
}
</style> 