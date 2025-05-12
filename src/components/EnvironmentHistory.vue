<template>
  <view class="environment-history">
    <view class="search-container">
      <view class="search-form">
        <view class="form-content">
          <view class="form-item limit-item">
            <text class="label">记录数量：</text>
            <input 
              type="number" 
              v-model="searchParams.limit" 
              class="input" 
              placeholder="默认200条"
            />
          </view>
          <view class="form-item">
            <text class="label">开始时间：</text>
            <uni-datetime-picker
              type="datetime"
              v-model="searchParams.startTime"
              :end="now"
              return-type="timestamp"
              @change="handleStartTimeChange"
            />
          </view>
          <view class="form-item">
            <text class="label">结束时间：</text>
            <uni-datetime-picker
              type="datetime"
              v-model="searchParams.endTime"
              :end="now"
              return-type="timestamp"
              @change="handleEndTimeChange"
            />
          </view>
          <button class="search-btn" @click="handleSearch">查询</button>
        </view>
      </view>
    </view>
    
    <view class="chart-container">
      <view class="chart-title">温度与湿度趋势</view>
      <canvas type="2d" id="tempHumidityChart" class="chart"></canvas>
    </view>
    <view class="chart-container">
      <view class="chart-title">光照强度趋势</view>
      <canvas type="2d" id="lightChart" class="chart"></canvas>
    </view>
    <view class="chart-container">
      <view class="chart-title">烟雾浓度趋势</view>
      <canvas type="2d" id="smokeChart" class="chart"></canvas>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { environmentAPI } from '@/api'

// 当前时间
const now = ref(Date.now())

// 搜索参数
const searchParams = ref({
  limit: 200,
  startTime: '',
  endTime: ''
})

// 环境数据
const environmentData = ref({
  times: [],
  temperature: [],
  humidity: [],
  light: [],
  smoke: []
})

// 保存图表实例
const charts = ref({
  tempHumidity: null,
  light: null,
  smoke: null
})

// 处理时间选择
const handleStartTimeChange = (timestamp) => {
  if (timestamp) {
    searchParams.value.startTime = formatDateTime(new Date(timestamp))
    validateTimeRange()
  }
}

const handleEndTimeChange = (timestamp) => {
  if (timestamp) {
    searchParams.value.endTime = formatDateTime(new Date(timestamp))
    validateTimeRange()
  }
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
  
  // 获取数据
  await fetchHistoryData()
}

// 获取历史数据
const fetchHistoryData = async () => {
  try {
    const res = await environmentAPI.getHistoryData(searchParams.value)
    if (res.code === 200 && res.data) {
      // 处理返回的数据
      const records = res.data.records || []
      environmentData.value = {
        times: records.map(record => formatDateTime(new Date(record.createTime))),
        temperature: records.map(record => record.temperature),
        humidity: records.map(record => record.humidity),
        light: records.map(record => record.light),
        smoke: records.map(record => record.smoke)
      }
      // 更新图表
      initCharts()
    }
  } catch (error) {
    console.error('获取历史数据失败:', error)
  }
}

// 初始化温度湿度图表
const initTempHumidityChart = () => {
  const query = uni.createSelectorQuery()
  query.select('#tempHumidityChart')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res[0] || !res[0].node) return
      
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      
      // 使用容器的实际宽度
      const width = res[0].width
      const height = 300 // 保持固定高度
      const dpr = uni.getSystemInfoSync().pixelRatio
      
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      
      // 如果已有实例，先销毁
      if (charts.value.tempHumidity) {
        charts.value.tempHumidity.dispose()
      }
      
      charts.value.tempHumidity = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      })
      const option = {
        // 关闭动画效果，提高性能
        animation: false,
        
        // 提示框配置
        tooltip: {
          trigger: 'axis',      // 触发类型：坐标轴触发
          axisPointer: {
            type: 'cross'       // 十字准星指示器
          }
        },
        
        // 图例配置
        legend: {
          data: ['温度', '湿度'],
          top: 5,               // 距离容器上边距5px
          left: 'center'        // 水平居中
        },
        
        // 直角坐标系内绘图网格配置
        grid: {
          left: 20,            // 距离容器左侧的距离，单位px
          right: 240,          // 距离容器右侧的距离，这里设置较大是为了给右侧Y轴预留足够空间
          bottom: 60,          // 距离容器下方的距离
          top: 40,             // 距离容器上方的距离
          containLabel: true    // 网格区域是否包含坐标轴的刻度标签
        },
        
        // X轴配置
        xAxis: {
          type: 'category',     // 类目轴，适用于离散的类目数据
          boundaryGap: false,   // 坐标轴两边留白策略
          data: environmentData.value.times,
          show: false          // 隐藏X轴
        },
        
        // Y轴配置（数组形式，支持双Y轴）
        yAxis: [
          {
            // 左侧温度Y轴配置
            type: 'value',      // 数值轴
            name: '温度(°C)',   // 坐标轴名称
            nameTextStyle: {    // 坐标轴名称的文字样式
              color: '#ff6b6b',
              fontSize: 12,
              align: 'left',    // 文字左对齐
              padding: [0, 0, 0, 0]  // 文字的内边距
            },
            position: 'left',   // 左侧Y轴
            scale: true,        // 是否是脱离 0 值比例，设置成 true 后坐标刻度不会强制包含零刻度
            min: function(value) {
              return Math.floor(value.min - 2);  // 设置最小值，向下取整并留出空间
            },
            max: function(value) {
              return Math.ceil(value.max + 2);   // 设置最大值，向上取整并留出空间
            },
            axisLine: {         // 坐标轴线设置
              show: true,
              lineStyle: {
                color: '#ff6b6b',
                width: 2
              }
            },
            axisTick: {         // 坐标轴刻度设置
              show: true
            },
            splitLine: {        // 分隔线设置
              show: true,
              lineStyle: {
                type: 'dashed',
                color: '#E5E5E5'
              }
            },
            axisLabel: {        // 坐标轴刻度标签设置
              color: '#ff6b6b',
              margin: 8,        // 刻度标签与轴线之间的距离
              fontSize: 12
            }
          },
          {
            // 右侧湿度Y轴配置（配置项含义同上）
            type: 'value',
            name: '湿度(%)',
            nameTextStyle: {
              color: '#4a6fee',
              fontSize: 12,
              align: 'right',
              padding: [0, 0, 0, 0]
            },
            position: 'right',
            scale: true,
            min: function(value) {
              return Math.floor(value.min - 5);
            },
            max: function(value) {
              return Math.ceil(value.max + 5);
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#4a6fee',
                width: 2
              }
            },
            axisTick: {
              show: true
            },
            splitLine: {
              show: false      // 不显示右侧Y轴的分隔线，避免与左侧Y轴的分隔线重叠
            },
            axisLabel: {
              color: '#4a6fee',
              margin: 8,
              fontSize: 12
            }
          }
        ],
        
        // 系列列表配置
        series: [
          {
            name: '温度',
            type: 'line',      // 折线图
            yAxisIndex: 0,      // 使用第一个Y轴（温度）
            data: environmentData.value.temperature,
            itemStyle: {        // 折线拐点样式
              color: '#ff6b6b'
            },
            lineStyle: {        // 折线样式
              width: 3         // 加粗线条
            },
            showSymbol: false,  // 不显示折线上的点
            smooth: true,       // 平滑曲线
            z: 3               // 控制图形的前后顺序，值越大越靠前
          },
          {
            name: '湿度',
            type: 'line',
            yAxisIndex: 1,      // 使用第二个Y轴（湿度）
            data: environmentData.value.humidity,
            itemStyle: {
              color: '#4a6fee'
            },
            lineStyle: {
              width: 3
            },
            showSymbol: false,
            smooth: true,
            z: 2
          }
        ]
      }
      charts.value.tempHumidity.setOption(option)
    })
}

// 初始化光照强度图表
const initLightChart = () => {
  const query = uni.createSelectorQuery()
  query.select('#lightChart')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res[0] || !res[0].node) return
      
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      
      // 使用容器的实际宽度
      const width = res[0].width
      const height = 300 // 保持固定高度
      const dpr = uni.getSystemInfoSync().pixelRatio
      
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      
      // 如果已有实例，先销毁
      if (charts.value.light) {
        charts.value.light.dispose()
      }
      
      charts.value.light = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      })
      const option = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['光照强度'],
          top: 5,
          left: 'center'
        },
        grid: {
          left: 20,       // 增加左边距
          right: 240,      // 增加右边距
          bottom: 60,
          top: 40,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: environmentData.value.times,
          show: false
        },
        yAxis: {
          type: 'value',
          name: '光照强度(lx)',
          nameTextStyle: {
            color: '#FF9F43',
            fontSize: 12,
            align: 'left',
            padding: [0, 0, 0, 0]
          },
          scale: true,
          min: function(value) {
            return Math.floor(value.min - 20);
          },
          max: function(value) {
            return Math.ceil(value.max + 20);
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#FF9F43',
              width: 2
            }
          },
          axisTick: {
            show: true
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: '#E5E5E5'
            }
          },
          axisLabel: {
            color: '#FF9F43',
            margin: 8,
            fontSize: 12
          }
        },
        series: [
          {
            name: '光照强度',
            type: 'line',
            data: environmentData.value.light,
            itemStyle: {
              color: '#FF9F43'
            },
            lineStyle: {
              width: 3
            },
            showSymbol: false,
            smooth: true
          }
        ]
      }
      charts.value.light.setOption(option)
    })
}

// 初始化烟雾浓度图表
const initSmokeChart = () => {
  const query = uni.createSelectorQuery()
  query.select('#smokeChart')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res[0] || !res[0].node) return
      
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      
      // 使用容器的实际宽度
      const width = res[0].width
      const height = 300 // 保持固定高度
      const dpr = uni.getSystemInfoSync().pixelRatio
      
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      
      // 如果已有实例，先销毁
      if (charts.value.smoke) {
        charts.value.smoke.dispose()
      }
      
      charts.value.smoke = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      })
      const option = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['烟雾浓度'],
          top: 5,
          left: 'center'
        },
        grid: {
          left: 20,
          right: 240,
          bottom: 60,
          top: 40,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: environmentData.value.times,
          show: false
        },
        yAxis: {
          type: 'value',
          name: '烟雾浓度(ppm)',
          nameTextStyle: {
            color: '#6C5CE7',
            fontSize: 12,
            align: 'left',
            padding: [0, 0, 0, 0]
          },
          scale: true,
          min: function(value) {
            return Math.floor(value.min - 20);
          },
          max: function(value) {
            return Math.ceil(value.max + 20);
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#6C5CE7',
              width: 2
            }
          },
          axisTick: {
            show: true
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: '#E5E5E5'
            }
          },
          axisLabel: {
            color: '#6C5CE7',
            margin: 8,
            fontSize: 12
          }
        },
        series: [
          {
            name: '烟雾浓度',
            type: 'line',
            data: environmentData.value.smoke,
            itemStyle: {
              color: '#6C5CE7'
            },
            lineStyle: {
              width: 3
            },
            showSymbol: false,
            smooth: true
          }
        ]
      }
      charts.value.smoke.setOption(option)
    })
}

// 初始化所有图表
const initCharts = () => {
  setTimeout(() => {
    initTempHumidityChart()
    initLightChart()
    initSmokeChart()
  }, 300)
}

// 监听窗口大小变化
const handleResize = () => {
  initCharts()
}

onMounted(async () => {
  await fetchHistoryData()
  window.addEventListener('resize', handleResize)
})

onActivated(() => {
  initCharts()
})

onDeactivated(() => {
  if (charts.value.tempHumidity) {
    charts.value.tempHumidity.dispose()
  }
  if (charts.value.light) {
    charts.value.light.dispose()
  }
  if (charts.value.smoke) {
    charts.value.smoke.dispose()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (charts.value.tempHumidity) {
    charts.value.tempHumidity.dispose()
  }
  if (charts.value.light) {
    charts.value.light.dispose()
  }
  if (charts.value.smoke) {
    charts.value.smoke.dispose()
  }
})
</script>

<style lang="scss" scoped>
.environment-history {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  
  .search-container {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    
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
          
          .input {
            height: 68rpx;
            line-height: 68rpx;
            padding: 0 16rpx;
            background-color: #f8f9fc;
            border-radius: 6rpx;
            font-size: 26rpx;
            color: #333;
            border: 1rpx solid #eaecf3;
            transition: all 0.3s ease;
            text-align: center;
            
            &:hover, &:focus {
              border-color: #4a6fee;
              background-color: #f5f7ff;
            }
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
  }
  
  .chart-container {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    width: 100%;  // 使用100%宽度
    box-sizing: border-box;
    overflow: visible;  // 允许内容溢出以显示右侧Y轴
    
    .chart-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 16px;
      text-align: left;  // 标题左对齐
    }
    
    .chart {
      width: 100% !important;  // 使用100%宽度
      height: 300px !important;
      box-sizing: border-box;
      display: block;
    }
  }
}
</style> 