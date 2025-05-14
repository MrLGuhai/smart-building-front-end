<template>
  <view class="threshold-analysis">
    <!-- 分析参数设置 -->
    <view class="analysis-header">
      <view class="header-left">
        <picker 
          mode="selector" 
          :range="thresholdTypes" 
          range-key="label"
          :value="selectedTypeIndex"
          @change="handleTypeChange"
          class="type-picker"
        >
          <view class="picker-content">
            <text>阈值类型：</text>
            <text class="selected-value">{{ thresholdTypes[selectedTypeIndex].label }}</text>
            <uni-icons type="down" size="14" color="#666"></uni-icons>
          </view>
        </picker>
        <picker 
          mode="selector" 
          :range="dayOptions" 
          range-key="label"
          :value="selectedDayIndex"
          @change="handleDayChange"
          class="day-picker"
        >
          <view class="picker-content">
            <text>分析天数：</text>
            <text class="selected-value">{{ dayOptions[selectedDayIndex].label }}</text>
            <uni-icons type="down" size="14" color="#666"></uni-icons>
          </view>
        </picker>
      </view>
      <button class="analyze-btn" @click="fetchAnalysisData" :loading="loading">
        开始分析
      </button>
    </view>

    <!-- 多类型分析卡片 -->
    <template v-if="isAllType">
      <view class="type-group" v-for="item in analysisList" :key="item.thresholdType">
        <view class="type-card">
          <view class="type-title-bar">
            <view class="type-color-dot" :style="{ backgroundColor: getTypeColor(item.thresholdType) }"></view>
            <text class="type-title-text">{{ getTypeName(item.thresholdType) }}分析</text>
          </view>
          <view class="type-content-row">
            <!-- 阈值对比 -->
            <view class="threshold-panel">
              <view class="panel-title">阈值对比</view>
              <view class="threshold-values">
                <view class="threshold-item">
                  <text class="item-label">当前阈值</text>
                  <text class="item-value">{{ item.currentThreshold }}</text>
                </view>
                <view class="threshold-item">
                  <text class="item-label">建议阈值</text>
                  <text class="item-value" :class="{ 'value-diff': item.currentThreshold !== item.suggestedThreshold }">
                    {{ item.suggestedThreshold }}
                  </text>
                </view>
              </view>
            </view>
            <!-- 告警分析 -->
            <view class="analysis-panel">
              <view class="panel-title">告警分析</view>
              <view class="analysis-values">
                <view class="analysis-item">
                  <text class="item-label">平均告警频率</text>
                  <view class="item-value-row">
                    <text class="item-value">{{ item.alarmFrequency }}</text>
                    <text class="item-unit">次/天</text>
                    <view class="tag-inline" :class="getFrequencyClass(item.alarmFrequency)">
                      {{ getFrequencyLevel(item.alarmFrequency) }}
                    </view>
                  </view>
                </view>
                <view class="analysis-item">
                  <text class="item-label">平均偏差</text>
                  <view class="item-value-row">
                    <text class="item-value">{{ item.averageDeviation }}</text>
                    <text class="item-unit">%</text>
                    <view class="tag-inline" :class="getDeviationClass(item.averageDeviation, item.thresholdType)">
                      {{ getDeviationLevel(item.averageDeviation, item.thresholdType) }}
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view class="type-content-bottom">
            <!-- 告警时间分布 -->
            <view class="distribution-panel">
              <view class="panel-title">告警时间分布</view>
              <view class="distribution-content">
                <view class="time-heatmap-bar">
                  <view 
                    v-for="(count, time) in item.timeDistribution" 
                    :key="time"
                    class="time-block"
                    :style="getBarStyle(count, item.timeDistribution, Object.keys(item.timeDistribution).length)"
                  >
                    <text class="time-label">{{ time }}</text>
                    <text class="count-label">{{ count }}次</text>
                  </view>
                </view>
                <view class="bar-x-axis"></view>
              </view>
            </view>
            <!-- 智能建议 -->
            <view class="suggestion-panel">
              <view class="panel-title">智能建议</view>
              <view class="suggestion-content">
                <view 
                  v-for="(suggestion, index) in getSuggestionList(item.suggestion)" 
                  :key="index"
                  class="suggestion-item"
                >
                  <uni-icons type="info" size="16" color="#409EFF"></uni-icons>
                  <text class="suggestion-text">{{ suggestion }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 单类型分析卡片 -->
    <template v-else>
      <view class="type-card" v-if="analysisList.length">
        <view class="type-title-bar">
          <view class="type-color-dot" :style="{ backgroundColor: getTypeColor(analysisList[0].thresholdType) }"></view>
          <text class="type-title-text">{{ getTypeName(analysisList[0].thresholdType) }}分析</text>
        </view>
        <view class="type-content-row">
          <!-- 阈值对比 -->
          <view class="threshold-panel">
            <view class="panel-title">阈值对比</view>
            <view class="threshold-values">
              <view class="threshold-item">
                <text class="item-label">当前阈值</text>
                <text class="item-value">{{ analysisList[0].currentThreshold }}</text>
              </view>
              <view class="threshold-item">
                <text class="item-label">建议阈值</text>
                <text class="item-value" :class="{ 'value-diff': analysisList[0].currentThreshold !== analysisList[0].suggestedThreshold }">
                  {{ analysisList[0].suggestedThreshold }}
                </text>
              </view>
            </view>
          </view>
          <!-- 告警分析 -->
          <view class="analysis-panel">
            <view class="panel-title">告警分析</view>
            <view class="analysis-values">
              <view class="analysis-item">
                <text class="item-label">平均告警频率</text>
                <view class="item-value-row">
                  <text class="item-value">{{ analysisList[0].alarmFrequency }}</text>
                  <text class="item-unit">次/天</text>
                  <view class="tag-inline" :class="getFrequencyClass(analysisList[0].alarmFrequency)">
                    {{ getFrequencyLevel(analysisList[0].alarmFrequency) }}
                  </view>
                </view>
              </view>
              <view class="analysis-item">
                <text class="item-label">平均偏差</text>
                <view class="item-value-row">
                  <text class="item-value">{{ analysisList[0].averageDeviation }}</text>
                  <text class="item-unit">%</text>
                  <view class="tag-inline" :class="getDeviationClass(analysisList[0].averageDeviation, analysisList[0].thresholdType)">
                    {{ getDeviationLevel(analysisList[0].averageDeviation, analysisList[0].thresholdType) }}
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="type-content-bottom">
          <!-- 告警时间分布 -->
          <view class="distribution-panel">
            <view class="panel-title">告警时间分布</view>
            <view class="distribution-content">
              <view class="time-heatmap-bar">
                <view 
                  v-for="(count, time) in analysisList[0].timeDistribution" 
                  :key="time"
                  class="time-block"
                  :style="getBarStyle(count, analysisList[0].timeDistribution, Object.keys(analysisList[0].timeDistribution).length)"
                >
                  <text class="time-label">{{ time }}</text>
                  <text class="count-label">{{ count }}次</text>
                </view>
              </view>
              <view class="bar-x-axis"></view>
            </view>
          </view>
          <!-- 智能建议 -->
          <view class="suggestion-panel">
            <view class="panel-title">智能建议</view>
            <view class="suggestion-content">
              <view 
                v-for="(suggestion, index) in getSuggestionList(analysisList[0].suggestion)" 
                :key="index"
                class="suggestion-item"
              >
                <uni-icons type="info" size="16" color="#409EFF"></uni-icons>
                <text class="suggestion-text">{{ suggestion }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { thresholdAPI } from '@/api'

// 阈值类型选项
const thresholdTypes = [
  { value: null, label: '全部' },
  { value: 1, label: '温度' },
  { value: 2, label: '湿度' },
  { value: 3, label: '光照上限' },
  { value: 4, label: '光照下限' }
]

// 分析天数选项
const dayOptions = [
  { value: 7, label: '最近7天' },
  { value: 15, label: '最近15天' },
  { value: 30, label: '最近30天' }
]

const selectedTypeIndex = ref(0)
const selectedDayIndex = ref(0)
const loading = ref(false)
const analysisList = ref([])

const isAllType = computed(() => thresholdTypes[selectedTypeIndex.value].value === null)

const getTypeName = (type) => {
  const found = thresholdTypes.find(t => t.value === type)
  return found ? found.label : '未知类型'
}
const getTypeColor = (type) => {
  const colors = {
    1: '#F56C6C',
    2: '#409EFF',
    3: '#E6A23C',
    4: '#67C23A'
  }
  return colors[type] || '#909399'
}
const getFrequencyLevel = (frequency) => {
  if (frequency > 3) return '严重'
  if (frequency > 1) return '中等'
  return '正常'
}
const getFrequencyClass = (frequency) => {
  if (frequency > 3) return 'level-high'
  if (frequency > 1) return 'level-medium'
  return 'level-normal'
}
const getDeviationLevel = (deviation, type) => {
  // 光照类型特殊处理
  if (type === 3 || type === 4) {
    if (deviation > 200) return '偏差大'
    if (deviation > 100) return '偏差中'
    return '偏差小'
  }
  // 温度/湿度
  if (deviation > 20) return '偏差大'
  if (deviation > 10) return '偏差中'
  return '偏差小'
}
const getDeviationClass = (deviation, type) => {
  if (type === 3 || type === 4) {
    if (deviation > 200) return 'level-high'
    if (deviation > 100) return 'level-medium'
    return 'level-normal'
  }
  if (deviation > 20) return 'level-high'
  if (deviation > 10) return 'level-medium'
  return 'level-normal'
}
// 柱状图美化：最大高度180px，最小高度32px，宽度自适应
const getBarStyle = (count, dist, barCount = 8) => {
  const max = Math.max(...Object.values(dist)) || 1
  const minHeight = 32
  const maxHeight = 180
  const height = Math.round((count / max) * (maxHeight - minHeight) + minHeight)
  // 动态宽度：数据少时宽一点，多时窄一点
  let width = 48
  if (barCount <= 5) width = 64
  else if (barCount >= 10) width = 32
  let bg = '#67C23A'
  if (count > 4) bg = 'linear-gradient(180deg, #F56C6C 0%, #fbbcbc 100%)'
  else if (count > 2) bg = 'linear-gradient(180deg, #E6A23C 0%, #fbe7c6 100%)'
  else bg = 'linear-gradient(180deg, #67C23A 0%, #b2e59e 100%)'
  return {
    background: bg,
    height: height + 'px',
    width: width + 'px',
    margin: '0 10px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    transition: 'height 0.3s, width 0.3s'
  }
}
// 建议分割
const getSuggestionList = (suggestion) => {
  if (!suggestion) return []
  return suggestion.split(';').filter(s => s.trim())
}

const handleTypeChange = (e) => {
  selectedTypeIndex.value = e.detail.value
}
const handleDayChange = (e) => {
  selectedDayIndex.value = e.detail.value
}
const fetchAnalysisData = async () => {
  loading.value = true
  try {
    const res = await thresholdAPI.getAnalysis({
      thresholdType: thresholdTypes[selectedTypeIndex.value].value,
      days: dayOptions[selectedDayIndex.value].value
    })
    analysisList.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('获取分析数据失败：', error)
    uni.showToast({
      title: '获取数据失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.threshold-analysis {
  padding: 24px 0 32px 0;
  background-color: #f5f7fa;
  min-height: 100vh;
}
.analysis-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  background: #fff;
  padding: 28px 32px 28px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(64,158,255,0.08);
  gap: 32px;
  .header-left {
    display: flex;
    gap: 32px;
  }
  .picker-content {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 22px;
    background: #f5f7fa;
    border-radius: 10px;
    font-size: 17px;
    color: #666;
    .selected-value {
      color: #333;
      font-weight: 500;
    }
  }
  .analyze-btn {
    background: linear-gradient(90deg, #409EFF 0%, #66b1ff 100%);
    color: #fff;
    font-size: 20px;
    padding: 0 38px;
    height: 48px;
    line-height: 48px;
    border-radius: 24px;
    border: none;
    box-shadow: 0 4px 16px rgba(64,158,255,0.13);
    font-weight: 600;
    letter-spacing: 2px;
    transition: background 0.2s, box-shadow 0.2s;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      background: linear-gradient(90deg, #66b1ff 0%, #409EFF 100%);
      box-shadow: 0 6px 20px rgba(64,158,255,0.18);
    }
    &:active {
      background: #337ecc;
    }
  }
}
.type-group {
  margin-bottom: 48px;
}
.type-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  padding: 0 0 24px 0;
  margin-bottom: 32px;
}
.type-title-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 32px;
  padding-top: 28px;
  padding-bottom: 8px;
}
.type-color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.type-title-text {
  font-size: 22px;
  font-weight: bold;
  color: #222;
  letter-spacing: 1px;
}
.type-content-row {
  display: flex;
  gap: 32px;
  padding: 0 32px;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 16px;
  }
}
.threshold-panel, .analysis-panel {
  flex: 1;
  background: #f8fafc;
  border-radius: 12px;
  padding: 18px 24px 12px 24px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 2px 8px rgba(64,158,255,0.04);
}
.panel-title {
  font-size: 17px;
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 12px;
}
.threshold-values, .analysis-values {
  display: flex;
  gap: 32px;
}
.threshold-item {
  text-align: left;
  .item-label {
    font-size: 15px;
    color: #888;
    margin-bottom: 4px;
  }
  .item-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    &.value-diff {
      color: #F56C6C;
    }
  }
}
.analysis-item {
  .item-label {
    font-size: 15px;
    color: #888;
    margin-bottom: 4px;
  }
  .item-value-row {
    display: flex;
    align-items: center;
    gap: 8px;
    .item-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    .item-unit {
      font-size: 15px;
      color: #666;
    }
    .tag-inline {
      margin-left: 8px;
      padding: 2px 12px;
      border-radius: 4px;
      font-size: 13px;
      color: #fff;
      font-weight: 500;
      &.level-high {
        background-color: #F56C6C;
      }
      &.level-medium {
        background-color: #E6A23C;
      }
      &.level-normal {
        background-color: #67C23A;
      }
    }
  }
}
.type-content-bottom {
  display: flex;
  gap: 32px;
  padding: 0 32px;
  margin-top: 18px;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 16px;
  }
}
.distribution-panel, .suggestion-panel {
  flex: 1;
  background: #f8fafc;
  border-radius: 12px;
  padding: 18px 24px 12px 24px;
  min-width: 220px;
  box-shadow: 0 2px 8px rgba(64,158,255,0.04);
}
.distribution-content {
  padding: 8px 0 0 0;
}
.time-heatmap-bar {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  min-height: 140px;
  max-height: 200px;
  overflow-x: auto;
  padding: 0 8px;
  margin-bottom: 8px;
}
.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  margin: 0 10px;
  border-radius: 8px;
  transition: height 0.3s, width 0.3s;
  .time-label {
    font-size: 13px;
    color: #fff;
    margin-bottom: 2px;
    user-select: none;
  }
  .count-label {
    font-size: 13px;
    color: #fff;
    user-select: none;
  }
}
.bar-x-axis {
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #e0e7ef 0%, #f5f7fa 100%);
  border-radius: 1px;
  margin-top: 2px;
}
.suggestion-content {
  padding: 8px 0 0 0;
}
.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  .suggestion-text {
    flex: 1;
    font-size: 16px;
    color: #666;
    line-height: 1.5;
  }
}
</style> 