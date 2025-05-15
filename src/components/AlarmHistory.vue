<template>
  <view class="alarm-history">
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

        <view class="form-item alarm-type-item">
          <text class="label">告警类型</text>
          <picker 
            :range="alarmTypes" 
            range-key="label"
            :value="alarmTypeIndex"
            @change="handleAlarmTypeChange"
          >
            <view class="picker">
              {{ searchParams.alarmType ? getAlarmTypeName(searchParams.alarmType) : '请选择告警类型' }}
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
        <text class="header-item alarm-type">告警类型</text>
        <text class="header-item actual-value">实际值</text>
        <text class="header-item threshold">阈值</text>
        <text class="header-item time">告警时间</text>
      </view>

      <scroll-view 
        class="table-body" 
        scroll-y
      >
        <view 
          class="table-row"
          v-for="(record, index) in alarmRecords" 
          :key="record.id"
        >
          <text class="cell index">{{ index + 1 }}</text>
          <text class="cell record-id">{{ record.id }}</text>
          <text class="cell alarm-type">{{ getAlarmTypeName(record.alarmType) }}</text>
          <text class="cell actual-value">{{ record.actualValue }}</text>
          <text class="cell threshold">{{ record.thresholdValue }}</text>
          <text class="cell time">{{ formatDateTime(new Date(record.createTime)) }}</text>
        </view>
        <view v-if="alarmRecords.length === 0" class="empty-tip">
          暂无数据
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { alarmAPI } from '@/api'

// 当前时间
const now = ref(Date.now())

// 告警类型选项
const alarmTypes = [
  { value: null, label: '全部' },
  { value: 1, label: '温度过高' },
  { value: 2, label: '温度回归正常' },
  { value: 3, label: '湿度过高' },
  { value: 4, label: '湿度回归正常' },
  { value: 5, label: '光照过强' },
  { value: 6, label: '光照过弱' }
]

// 搜索参数
const searchParams = ref({
  alarmType: null,
  startTime: '',
  endTime: '',
  limit: 100
})

// 告警类型索引
const alarmTypeIndex = computed(() => {
  if (searchParams.value.alarmType === null) return 0
  return alarmTypes.findIndex(item => item.value === searchParams.value.alarmType)
})

// 告警记录数据
const alarmRecords = ref([])
const loading = ref(false)

// 获取告警类型名称
const getAlarmTypeName = (type) => {
  if (type === null) return '全部'
  const alarm = alarmTypes.find(item => item.value === type)
  return alarm ? alarm.label : '未知类型'
}

// 处理告警类型选择
const handleAlarmTypeChange = (e) => {
  const index = e.detail.value
  searchParams.value.alarmType = alarmTypes[index].value
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

// 获取告警记录
const fetchAlarmRecords = async () => {
  try {
    loading.value = true
    // 构建请求参数
    const params = {
      limit: parseInt(searchParams.value.limit) || 100
    }
    
    // 只有在有值且不为null时才添加参数
    if (searchParams.value.alarmType !== null) {
      params.alarmType = searchParams.value.alarmType
    }
    if (searchParams.value.startTime) {
      params.startTime = searchParams.value.startTime
    }
    if (searchParams.value.endTime) {
      params.endTime = searchParams.value.endTime
    }
    
    const res = await alarmAPI.getAlarmRecords(params)
    console.log('告警记录响应数据:', res) // 添加日志查看响应数据结构
    
    if (res.code === 200) {
      // 根据实际的数据结构进行解析
      if (res.data && res.data.records) {
        alarmRecords.value = res.data.records
      } else if (Array.isArray(res.data)) {
        alarmRecords.value = res.data
      } else {
        alarmRecords.value = []
        console.warn('未能识别的数据结构:', res.data)
      }
    } else {
      uni.showToast({
        title: res.message || '获取告警记录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取告警记录失败:', error)
    uni.showToast({
      title: '获取告警记录失败',
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
  
  await fetchAlarmRecords()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAlarmRecords()
})
</script>

<style lang="scss" scoped>
.alarm-history {
  padding: 32px;
  background: transparent;
}

.search-form {
  background: rgba(20,34,56,0.92);
  border-radius: 18px;
  padding: 16px 18px;
  margin-bottom: 28px;
  box-shadow: 0 4px 24px #1ecfff22;
  border: 1.5px solid #1ecfff33;
  .form-content {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 12px;
    .form-item {
      display: flex;
      align-items: center;
      gap: 6px;
      .label {
        font-size: 15px;
        color: #1ecfff;
        margin-right: 6px;
        white-space: nowrap;
        font-weight: 600;
      }
      .input, .picker {
        height: 36px;
        line-height: 36px;
        background: #1a2b3f;
        border-radius: 6px;
        font-size: 15px;
        color: #fff;
        border: 1.2px solid #1ecfff33;
        padding: 0 10px;
        transition: border-color 0.2s;
        min-width: 60px;
        max-width: 120px;
        &:focus, &:hover {
          border-color: #1ecfff;
          outline: none;
        }
      }
    }
    .search-btn {
      margin-left: auto;
      width: 80px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      background: linear-gradient(90deg,#1ecfff,#00eaff);
      color: #fff;
      border-radius: 6px;
      font-size: 15px;
      font-weight: bold;
      padding: 0;
      transition: background 0.2s;
      flex-shrink: 0;
      border: none;
      box-shadow: 0 0 8px #1ecfff55;
      &:hover {
        background: linear-gradient(90deg,#00eaff,#1ecfff);
      }
      &[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}

.records-list {
  background: rgba(20,34,56,0.92);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 4px 24px #1ecfff22;
  border: 1.5px solid #1ecfff33;
  .table-header {
    display: flex;
    padding: 16px 0;
    border-bottom: 1.5px solid #1ecfff33;
    font-size: 17px;
    color: #1ecfff;
    font-weight: bold;
    letter-spacing: 1px;
  }
  .table-body {
    height: calc(100vh - 600rpx);
    .table-row {
      display: flex;
      padding: 16px 0;
      border-bottom: 1px solid #1ecfff22;
      font-size: 15px;
      color: #fff;
      font-weight: 600;
      &:last-child {
        border-bottom: none;
      }
    }
  }
  .header-item,
  .cell {
    flex: 1;
    padding: 0 6px;
    &.index {
      flex: 0.5;
    }
    &.record-id {
      flex: 0.8;
    }
    &.alarm-type {
      flex: 1.2;
    }
    &.actual-value,
    &.threshold {
      flex: 0.8;
    }
    &.time {
      flex: 1.5;
    }
  }
  .empty-tip {
    text-align: center;
    padding: 32px 0;
    color: #999;
    font-size: 15px;
  }
}

@media (max-width: 1200px) {
  .alarm-history {
    padding: 8px;
  }
  .search-form {
    padding: 8px 4px;
    margin-bottom: 12px;
    .form-content {
      gap: 6px;
      .form-item {
        gap: 2px;
        .input, .picker {
          min-width: 40px;
          max-width: 80px;
          font-size: 13px;
          height: 28px;
        }
        .label {
          font-size: 13px;
        }
      }
      .search-btn {
        width: 60px;
        height: 28px;
        font-size: 13px;
      }
    }
  }
  .records-list {
    padding: 8px;
    .table-header, .table-row {
      font-size: 13px;
      padding: 8px 0;
    }
    .header-item, .cell {
      padding: 0 2px;
    }
  }
}
@media (max-width: 900px) {
  .alarm-history {
    padding: 4px;
  }
  .search-form {
    padding: 4px 2px;
    margin-bottom: 8px;
    .form-content {
      gap: 2px;
      .form-item {
        gap: 1px;
        .input, .picker {
          min-width: 30px;
          max-width: 60px;
          font-size: 12px;
          height: 22px;
        }
        .label {
          font-size: 12px;
        }
      }
      .search-btn {
        width: 40px;
        height: 22px;
        font-size: 12px;
      }
    }
  }
  .records-list {
    padding: 4px;
    .table-header, .table-row {
      font-size: 12px;
      padding: 4px 0;
    }
    .header-item, .cell {
      padding: 0 1px;
    }
  }
}
</style> 