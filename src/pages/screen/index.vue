<template>
  <div class="screen-bg">
    <!-- 顶部标题和操作栏 -->
    <div class="screen-header">
      <div class="screen-title">智能楼宇环境监控系统数字大屏</div>
      <div class="screen-actions">
        <button class="screen-btn" @click="handleGoMain">进入后台</button>
        <button class="screen-btn logout" @click="handleLogout">退出登录</button>
      </div>
    </div>
    <!-- 顶部横向小卡片 -->
    <div class="top-cards">
      <div class="top-card" v-for="item in topCardList" :key="item.label">
        <div class="top-card-label">{{ item.label }}</div>
        <div class="top-card-value">{{ item.value }}<span class="top-card-unit">{{ item.unit }}</span></div>
        <div class="top-card-desc">{{ item.desc }}</div>
      </div>
    </div>
    <!-- 主体内容分区 -->
    <div class="main-grid">
      <!-- 左上 折线/柱状图 -->
      <div class="main-block block-line">
        <div class="block-title"><span class="block-title-bar"></span>近10次温度、湿度历史波动</div>
        <div id="cpuChart" class="block-chart"></div>
      </div>
      <!-- 中上 条形图 -->
      <div class="main-block block-bar">
        <div class="block-title"><span class="block-title-bar"></span>近100次告警统计</div>
        <div id="diskBar" class="block-chart"></div>
      </div>
      <!-- 右上 饼图 -->
      <div class="main-block block-pie">
        <div class="block-title"><span class="block-title-bar"></span>告警类型分布</div>
        <div id="hostPie" class="block-chart"></div>
      </div>
      <!-- 左中 折线图 -->
      <div class="main-block block-line2">
        <div class="block-title"><span class="block-title-bar"></span>近10次光照强度历史波动</div>
        <div id="memChart" class="block-chart"></div>
      </div>
      <!-- 中中 统计数字 -->
      <div class="main-block block-num">
        <div class="block-title"><span class="block-title-bar"></span>其他资源统计</div>
        <div class="num-list">
          <div class="num-item" v-for="item in numList" :key="item.label">
            <div class="num-value">{{ item.value }}</div>
            <div class="num-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
      <!-- 右中 列表 -->
      <div class="main-block block-list">
        <div class="block-title"><span class="block-title-bar"></span>系统日志</div>
        <ul class="log-list">
          <li v-for="item in logList" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
    <!-- 背景装饰 -->
    <div class="bg-decor"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { environmentAPI, alarmAPI, thresholdAPI, deviceAPI } from '@/api'
import { useRouter } from 'vue-router'
import { clearUserInfo } from '@/store/user'

const router = useRouter && useRouter()

// 顶部小卡片数据
const topCardList = ref([
  { label: '温度', value: '--', unit: '°C', desc: '当前环境温度' },
  { label: '湿度', value: '--', unit: '%', desc: '当前环境湿度' },
  { label: '光照强度', value: '--', unit: 'lx', desc: '当前环境光照' },
  { label: '烟雾浓度', value: '--', unit: 'ppm', desc: '当前环境烟雾' }
])
// 统计数字
const numList = ref([
  { label: '今日告警数', value: '--' },
  { label: '警示灯状态', value: '--' },
  { label: '补光灯状态', value: '--' },
  { label: '排气扇状态', value: '--' },
  { label: '警报器状态', value: '--' },
  { label: '逃生门状态', value: '--' },
  { label: '温度故障标识', value: '--' },
  { label: '光敏故障标识', value: '--' }
])
// 日志列表
const logList = ref([])

// 历史环境数据
const historyData = ref({
  times: [],
  temperature: [],
  humidity: [],
  light: [],
  smoke: []
})
// 告警统计
const alarmStats = ref({
  typeCount: [], // [{name, value}]
  dayCount: []  // [{date, value}]
})

// 获取所有数据
const fetchAllData = async () => {
  // 1. 当前环境数据
  environmentAPI.getCurrentData().then(res => {
    if (res.code === 200 && res.data) {
      const d = res.data
      topCardList.value = [
        { label: '温度', value: d.temperature, unit: '°C', desc: '当前环境温度' },
        { label: '湿度', value: d.humidity, unit: '%', desc: '当前环境湿度' },
        { label: '光照强度', value: d.light, unit: 'lx', desc: '当前环境光照' },
        { label: '烟雾浓度', value: d.smoke, unit: 'ppm', desc: '当前环境烟雾' }
      ]
    }
  })
  // 2. 近10条历史环境数据
  environmentAPI.getHistoryData({ limit: 10 }).then(res => {
    if (res.code === 200 && res.data) {
      const records = res.data.records || []
      historyData.value = {
        times: records.map(r => r.createTime.slice(11, 16)),
        temperature: records.map(r => r.temperature),
        humidity: records.map(r => r.humidity),
        light: records.map(r => r.light),
        smoke: records.map(r => r.smoke)
      }
      setTimeout(() => initCharts(), 200)
    }
  })
  // 3. 告警统计
  alarmAPI.getAlarmRecords({ limit: 100 }).then(res => {
    if (res.code === 200 && res.data) {
      const records = res.data.records || []
      // 按类型统计
      const typeMap = {}
      records.forEach(r => {
        typeMap[r.alarmType] = (typeMap[r.alarmType] || 0) + 1
      })
      alarmStats.value.typeCount = Object.keys(typeMap).map(k => ({
        name: alarmTypeName(k),
        value: typeMap[k]
      }))
      // 按天统计
      const dayMap = {}
      records.forEach(r => {
        const day = r.createTime.slice(5, 10)
        dayMap[day] = (dayMap[day] || 0) + 1
      })
      alarmStats.value.dayCount = Object.keys(dayMap).map(k => ({ date: k, value: dayMap[k] }))
      // 最新日志
      logList.value = records.slice(0, 10).map(r => `${alarmTypeName(r.alarmType)}告警，实际值${r.actualValue}，阈值${r.thresholdValue}，${r.createTime}`)
    }
  })
  // 4. 设备状态
  deviceAPI.getStatus().then(res => {
    if (res.code === 200 && res.data) {
      numList.value[1].value = res.data.warningLight ? '开' : '关'
      numList.value[2].value = res.data.fillLight ? '开' : '关'
      numList.value[3].value = res.data.exhaustFan ? '开' : '关'
      numList.value[4].value = res.data.alarm ? '开' : '关'
      numList.value[5].value = res.data.emergencyDoor ? '开' : '关'
      numList.value[6].value = res.data.tempHumiFault ? '故障' : '正常'
      numList.value[7].value = res.data.lightFault ? '故障' : '正常'
    }
  })

  // 5. 今日告警数
  alarmAPI.getAlarmRecords({ limit: 100 }).then(res => {
    if (res.code === 200 && res.data) {
      const today = new Date().toISOString().slice(0, 10)
      numList.value[0].value = (res.data.records || []).filter(r => r.createTime.startsWith(today)).length
    }
  })
}

// 告警类型名称
function alarmTypeName(type) {
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

// 图表渲染
function initCharts() {
  // 近10条温湿度历史数据双柱图
  const cpuChart = echarts.init(document.getElementById('cpuChart'))
  cpuChart.setOption({
    backgroundColor: 'rgba(0,0,0,0)',
    grid: { left: 40, right: 20, bottom: 30, top: 30 },
    xAxis: {
      type: 'category',
      data: historyData.value.times,
      axisLine: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#1ecfff' } },
      splitLine: { lineStyle: { color: '#1e2b4a' } },
      axisLabel: { color: '#fff' }
    },
    legend: {
      data: ['温度', '湿度'],
      top: 0,
      textStyle: { color: '#1ecfff' }
    },
    series: [
      {
        name: '温度',
        type: 'bar',
        data: historyData.value.temperature,
        barWidth: 12,
        itemStyle: {
          borderRadius: 4,
          color: '#1ecfff',
          shadowBlur: 8,
          shadowColor: '#1ecfff'
        }
      },
      {
        name: '湿度',
        type: 'bar',
        data: historyData.value.humidity,
        barWidth: 12,
        itemStyle: {
          borderRadius: 4,
          color: '#ffb347',
          shadowBlur: 8,
          shadowColor: '#ffb347'
        }
      }
    ]
  })
  // 近100次告警数柱形图
  const diskBar = echarts.init(document.getElementById('diskBar'))
  diskBar.setOption({
    backgroundColor: 'rgba(0,0,0,0)',
    grid: { left: 80, right: 40, bottom: 30, top: 30 },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#1ecfff' } },
      splitLine: { lineStyle: { color: '#1e2b4a' } },
      axisLabel: { color: '#fff' }
    },
    yAxis: {
      type: 'category',
      data: alarmStats.value.dayCount.map(d => d.date),
      axisLine: { lineStyle: { color: '#1ecfff' } },
      axisLabel: { color: '#fff' }
    },
    series: [{
      name: '告警数',
      type: 'bar',
      data: alarmStats.value.dayCount.map(d => d.value),
      barWidth: 16,
      itemStyle: {
        borderRadius: 8,
        color: function(params) {
          const colors = ['#ff5e62','#ffb347','#1ecfff','#00eaff','#a084ee','#00ffae']
          return colors[params.dataIndex % colors.length]
        },
        shadowBlur: 8,
        shadowColor: '#1ecfff'
      },
      label: {
        show: true,
        position: 'right',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        formatter: '{c}'
      }
    }]
  })
  // 近100条告警类型分布饼图
  const hostPie = echarts.init(document.getElementById('hostPie'))
  hostPie.setOption({
    backgroundColor: 'rgba(0,0,0,0)',
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#1ecfff', fontSize: 15 }
    },
    series: [
      {
        name: '告警类型',
        type: 'pie',
        radius: ['60%', '80%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        labelLine: { show: false },
        data: alarmStats.value.typeCount
      }
    ]
  })
  // 左中 光照强度折线图
  const memChart = echarts.init(document.getElementById('memChart'))
  const lightData = historyData.value.light
  let minLight = Math.min(...lightData)
  let maxLight = Math.max(...lightData)
  if (minLight === maxLight) {
    minLight = Math.max(0, minLight - 100)
    maxLight = maxLight + 100
  }
  memChart.setOption({
    backgroundColor: 'rgba(0,0,0,0)',
    grid: { left: 40, right: 20, bottom: 30, top: 30 },
    xAxis: {
      type: 'category',
      data: historyData.value.times,
      axisLine: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      min: minLight,
      max: maxLight,
      axisLine: { lineStyle: { color: '#1ecfff' } },
      splitLine: { lineStyle: { color: '#1e2b4a' } },
      axisLabel: { color: '#fff' }
    },
    series: [{
      name: '光照强度',
      type: 'line',
      data: lightData,
      symbol: 'none',
      lineStyle: {
        color: '#a084ee',
        width: 3,
        shadowBlur: 8,
        shadowColor: '#a084ee'
      },
      areaStyle: {
        color: 'rgba(160,132,238,0.08)'
      }
    }]
  })
}

// 退出登录逻辑（参考主页面）
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除用户信息
        clearUserInfo()
        // 跳转到登录页
        uni.redirectTo({ url: '/pages/login/index' })
      }
    }
  })
}
// 进入后台
function handleGoMain() {
  uni.redirectTo({ url: '/pages/main/index' })
}

onMounted(() => {
  fetchAllData()
})
</script>

<style lang="scss" scoped>
.screen-bg {
  min-height: 100vh;
  background: #0a1833 url('https://img.js.design/assets/img/65e5e2e2b6b5b7b2b2b2b2b2.png') repeat;
  font-family: 'DIN', 'Microsoft YaHei', Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
}
.screen-header {
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 18px;
  margin-bottom: 8px;
}
.screen-title {
  font-size: 32px;
  color: #1ecfff;
  font-weight: bold;
  letter-spacing: 4px;
  text-shadow: 0 0 12px #1ecfff99;
  flex: 1;
  text-align: center;
}
.screen-actions {
  position: absolute;
  right: 48px;
  top: 0;
  display: flex;
  gap: 18px;
}
.screen-btn {
  background: linear-gradient(90deg,#1ecfff,#00eaff);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 22px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 0 8px #1ecfff55;
  transition: background 0.2s;
}
.screen-btn.logout {
  background: linear-gradient(90deg,#ff5e62,#ffb347);
}
.screen-btn:hover {
  filter: brightness(1.1);
}
.top-cards {
  display: flex;
  justify-content: flex-start;
  gap: 32px;
  margin: 32px 0 0 32px;
}
.top-card {
  background: rgba(10,24,51,0.92);
  border: 2px solid #1ecfff;
  border-radius: 12px;
  box-shadow: 0 0 16px #1ecfff33;
  min-width: 200px;
  min-height: 80px;
  padding: 18px 32px 12px 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  .top-card-label {
    color: #1ecfff;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  .top-card-value {
    font-size: 32px;
    color: #fff;
    font-weight: bold;
    .top-card-unit {
      font-size: 18px;
      margin-left: 4px;
      color: #1ecfff;
    }
  }
  .top-card-desc {
    color: #7ed6ff;
    font-size: 14px;
    margin-top: 6px;
  }
}
.main-grid {
  display: grid;
  grid-template-columns: 1.2fr 1.2fr 1fr;
  grid-template-rows: 1.1fr 1fr;
  gap: 32px;
  margin: 32px 32px 0 32px;
}
.main-block {
  background: rgba(10,24,51,0.92);
  border: 2px solid #1ecfff;
  border-radius: 18px;
  box-shadow: 0 0 24px #1ecfff33;
  padding: 24px 24px 18px 24px;
  position: relative;
  min-width: 260px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
}
.block-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  color: #1ecfff;
  font-weight: bold;
  margin-bottom: 18px;
  .block-title-bar {
    display: inline-block;
    width: 6px;
    height: 22px;
    background: linear-gradient(180deg,#1ecfff,#00eaff);
    border-radius: 3px;
    margin-right: 10px;
  }
}
.block-chart {
  width: 100%;
  height: 180px;
  background: transparent;
}
.num-list {
  display: flex;
  flex-wrap: wrap;
  gap: 18px 32px;
  margin-top: 12px;
}
.num-item {
  min-width: 80px;
  .num-value {
    font-size: 28px;
    color: #fff;
    font-weight: bold;
    text-shadow: 0 0 8px #1ecfff;
  }
  .num-label {
    color: #1ecfff;
    font-size: 15px;
    margin-top: 4px;
  }
}
.log-list {
  margin: 0;
  padding: 0 0 0 8px;
  list-style: none;
  max-height: 160px;
  overflow-y: auto;
  li {
    color: #fff;
    font-size: 15px;
    margin-bottom: 6px;
    border-bottom: 1px dashed #1ecfff33;
    padding-bottom: 2px;
  }
}
.bg-decor {
  position: absolute;
  left: 0; right: 0; bottom: 0; top: 0;
  pointer-events: none;
  z-index: 0;
  background: url('https://img.js.design/assets/img/65e5e2e2b6b5b7b2b2b2b2b2.png') repeat;
  opacity: 0.18;
}
</style> 