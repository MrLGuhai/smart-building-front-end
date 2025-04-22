<template>
  <view class="threshold-history">
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

        <view class="form-item threshold-type-item">
          <text class="label">阈值类型</text>
          <picker 
            :range="thresholdTypes" 
            range-key="label"
            :value="thresholdTypeIndex"
            @change="handleThresholdTypeChange"
          >
            <view class="picker">
              {{ searchParams.thresholdType ? getThresholdTypeName(searchParams.thresholdType) : '请选择阈值类型' }}
            </view>
          </picker>
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

    <!-- 记录列表 -->
    <view class="records-list">
      <view class="table-header">
        <text class="header-item index">序号</text>
        <text class="header-item record-id">记录ID</text>
        <text class="header-item threshold-type">阈值类型</text>
        <text class="header-item old-value">原始值</text>
        <text class="header-item new-value">修改值</text>
        <text class="header-item operator">操作人</text>
        <text class="header-item time">修改时间</text>
      </view>

      <scroll-view 
        class="table-body" 
        scroll-y
      >
        <view 
          class="table-row"
          v-for="(record, index) in thresholdRecords" 
          :key="record.id"
        >
          <text class="cell index">{{ index + 1 }}</text>
          <text class="cell record-id">{{ record.id }}</text>
          <text class="cell threshold-type">{{ getThresholdTypeName(record.thresholdType) }}</text>
          <text class="cell old-value">{{ formatValue(record.oldValue, record.thresholdType) }}</text>
          <text class="cell new-value">{{ formatValue(record.newValue, record.thresholdType) }}</text>
          <text class="cell operator">{{ record.userId }}</text>
          <text class="cell time">{{ formatDateTime(new Date(record.createTime)) }}</text>
        </view>
        <view v-if="thresholdRecords.length === 0" class="empty-tip">
          暂无数据
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { thresholdAPI } from '@/api'

// 当前时间
const now = ref(Date.now())

// 阈值类型选项
const thresholdTypes = [
  { value: null, label: '全部' },
  { value: 1, label: '温度阈值' },
  { value: 2, label: '湿度阈值' },
  { value: 3, label: '光照上限' },
  { value: 4, label: '光照下限' }
]

// 搜索参数
const searchParams = ref({
  thresholdType: null,
  startTime: '',
  endTime: '',
  limit: 100
})

// 阈值类型索引
const thresholdTypeIndex = computed(() => {
  if (searchParams.value.thresholdType === null) return 0
  return thresholdTypes.findIndex(item => item.value === searchParams.value.thresholdType)
})

// 阈值修改记录数据
const thresholdRecords = ref([])
const loading = ref(false)

// 获取阈值类型名称
const getThresholdTypeName = (type) => {
  if (type === null) return '全部'
  const threshold = thresholdTypes.find(item => item.value === type)
  return threshold ? threshold.label : '未知类型'
}

// 格式化阈值数值
const formatValue = (value, type) => {
  switch (type) {
    case 1: // 温度
      return `${value}°C`
    case 2: // 湿度
      return `${value}%`
    case 3: // 光照上限
    case 4: // 光照下限
      return `${value}lx`
    default:
      return value
  }
}

// 处理阈值类型选择
const handleThresholdTypeChange = (e) => {
  const index = e.detail.value
  searchParams.value.thresholdType = thresholdTypes[index].value
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

// 获取阈值修改记录
const fetchThresholdRecords = async () => {
  try {
    loading.value = true
    // 构建请求参数
    const params = {
      limit: parseInt(searchParams.value.limit) || 100
    }
    
    // 只有在有值且不为null时才添加参数
    if (searchParams.value.thresholdType !== null) {
      params.thresholdType = searchParams.value.thresholdType
    }
    if (searchParams.value.startTime) {
      params.startTime = searchParams.value.startTime
    }
    if (searchParams.value.endTime) {
      params.endTime = searchParams.value.endTime
    }
    
    const res = await thresholdAPI.getThresholdRecords(params)
    console.log('阈值修改记录响应数据:', res)
    
    if (res.code === 200) {
      // 根据实际的数据结构进行解析
      if (res.data && res.data.records) {
        thresholdRecords.value = res.data.records
      } else if (Array.isArray(res.data)) {
        thresholdRecords.value = res.data
      } else {
        thresholdRecords.value = []
        console.warn('未能识别的数据结构:', res.data)
      }
    } else {
      uni.showToast({
        title: res.message || '获取阈值修改记录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取阈值修改记录失败:', error)
    uni.showToast({
      title: '获取阈值修改记录失败',
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
  
  await fetchThresholdRecords()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchThresholdRecords()
})
</script>

<style lang="scss" scoped>
.threshold-history {
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
        
        // 阈值类型选择器样式
        &.threshold-type-item {
          flex: 0 0 300rpx;
          
          .picker {
            width: 220rpx;
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
      
      &.threshold-type {
        flex: 1.2;
      }
      
      &.old-value,
      &.new-value {
        flex: 0.8;
      }
      
      &.operator {
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