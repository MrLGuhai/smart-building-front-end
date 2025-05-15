<template>
  <view class="main-bg">
    <view class="main-header">
      <text class="main-title">智能楼宇环境监控系统</text>
      <view class="main-header-right">
        <text class="main-username">[{{ user.username }}]</text>
        <view class="main-btn" @click="handleGoScreen">
          <uni-icons type="tv" size="18" color="#1ecfff"></uni-icons>
          <text>数字大屏</text>
        </view>
        <view class="main-btn logout" @click="handleLogout">
          <uni-icons type="poweroff" size="18" color="#ff5e62"></uni-icons>
          <text>退出登录</text>
        </view>
      </view>
    </view>
    <view class="main-content-wrap">
      <view class="main-sidebar">
        <view 
          v-for="(item, index) in menuItems" 
          :key="index"
          class="sidebar-item"
          :class="{'sidebar-item-active': currentMenuIndex === index}"
          @click="handleMenuClick(index)"
        >
          <uni-icons :type="item.icon" size="22" :color="currentMenuIndex === index ? '#1ecfff' : '#7ad0ff'" />
          <text class="sidebar-text">{{ item.name }}</text>
        </view>
        <view v-if="menuItems[currentMenuIndex].subItems" class="sidebar-submenu">
          <view 
            v-for="(subItem, subIndex) in menuItems[currentMenuIndex].subItems" 
            :key="subIndex"
            class="sidebar-subitem"
            :class="{'sidebar-subitem-active': currentSubMenuIndex === subIndex}"
            @click="handleSubMenuClick(subIndex)"
          >
            <text class="sidebar-subtext">{{ subItem.name }}</text>
          </view>
        </view>
      </view>
      <view class="main-content">
        <view class="main-content-header">
          <text class="main-content-title">{{ currentMenuItem.name }}</text>
        </view>
        <view class="main-content-body">
          <DataDisplay v-if="currentMenuIndex === 0" />
          <ThresholdSettings v-if="currentMenuIndex === 1" />
          <ManualControl v-if="currentMenuIndex === 2" />
          <ThresholdAnalysis v-if="currentMenuIndex === 3" />
          <EnvironmentHistory v-if="currentMenuIndex === 4 && currentSubMenuIndex === 0" />
          <ThresholdHistory v-if="currentMenuIndex === 4 && currentSubMenuIndex === 1" />
          <ControlHistory v-if="currentMenuIndex === 4 && currentSubMenuIndex === 2" />
          <AlarmHistory v-if="currentMenuIndex === 4 && currentSubMenuIndex === 3" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { user, clearUserInfo } from '@/store/user'
import DataDisplay from '@/components/DataDisplay.vue'
import ThresholdSettings from '@/components/ThresholdSettings.vue'
import ManualControl from '@/components/ManualControl.vue'
import EnvironmentHistory from '@/components/EnvironmentHistory.vue'
import ControlHistory from '@/components/ControlHistory.vue'
import AlarmHistory from '@/components/AlarmHistory.vue'
import ThresholdHistory from '@/components/ThresholdHistory.vue'
import ThresholdAnalysis from '@/components/ThresholdAnalysis.vue'

const menuItems = [
  { name: '数据展示', icon: 'list' },
  { name: '阈值设置', icon: 'gear' },
  { name: '手动控制', icon: 'paperplane' },
  { name: '阈值分析', icon: 'vip' },
  { 
    name: '历史数据', 
    icon: 'search',
    subItems: [
      { name: '环境数据', component: 'EnvironmentHistory' },
      { name: '阈值修改记录', component: 'ThresholdHistory' },
      { name: '控制记录', component: 'ControlHistory' },
      { name: '告警记录', component: 'AlarmHistory' }
    ]
  }
]

const currentMenuIndex = ref(0)
const currentSubMenuIndex = ref(0)

const currentMenuItem = computed(() => {
  const item = menuItems[currentMenuIndex.value]
  if (item.subItems) {
    return item.subItems[currentSubMenuIndex.value]
  }
  return item
})

const handleMenuClick = (index) => {
  currentMenuIndex.value = index
  currentSubMenuIndex.value = 0
}

const handleSubMenuClick = (index) => {
  currentSubMenuIndex.value = index
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除用户信息
        clearUserInfo()
        // 跳转到登录页
        uni.redirectTo({
          url: '/pages/login/index'
        })
      }
    }
  })
}

const handleGoScreen = () => {
  uni.redirectTo({ url: '/pages/screen/index' })
}
</script>

<style lang="scss" scoped>
.main-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1a2f 0%, #112a4d 100%);
  display: flex;
  flex-direction: column;
}
.main-header {
  width: 100vw;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #0a1a2f 60%, #1ecfff22 100%);
  box-shadow: 0 4px 24px #1ecfff22;
  padding: 0 3px;
  position: relative;
  z-index: 10;
}
.main-title {
  font-size: 30px;
  color: #1ecfff;
  font-weight: bold;
  letter-spacing: 4px;
  text-shadow: 0 0 16px #1ecfff99;
}
.main-header-right {
  display: flex;
  align-items: center;
  gap: 18px;
}
.main-username {
  font-size: 16px;
  color: #7ad0ff;
  background: #1a2b3f;
  border-radius: 6px;
  padding: 6px 16px;
  margin-right: 8px;
  font-weight: 500;
  letter-spacing: 1px;
}
.main-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(90deg,#1ecfff,#00eaff);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 22px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 0 8px #1ecfff55;
  transition: background 0.2s, filter 0.2s;
  &:hover {
    filter: brightness(1.1);
    background: linear-gradient(90deg,#00eaff,#1ecfff);
  }
}
.main-btn.logout {
  background: linear-gradient(90deg,#ff5e62,#ffb347);
  color: #fff;
  &:hover {
    background: linear-gradient(90deg,#ffb347,#ff5e62);
  }
}
.main-content-wrap {
  flex: 1;
  display: flex;
  height: calc(100vh - 72px);
  overflow: hidden;
}
.main-sidebar {
  width: 250px;
  background: rgba(10,26,47,0.92);
  box-shadow: 2px 0 18px #1ecfff22;
  border-radius: 0 24px 24px 0;
  padding: 32px 0 32px 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}
.sidebar-item {
  height: 54px;
  display: flex;
  align-items: center;
  padding: 0 36px;
  cursor: pointer;
  border-radius: 12px 0 0 12px;
  margin-bottom: 8px;
  font-size: 17px;
  color: #7ad0ff;
  font-weight: 500;
  transition: all 0.25s;
  background: transparent;
  &:hover {
    background: linear-gradient(90deg,#1ecfff22 0%,#1a2b3f 100%);
    color: #1ecfff;
  }
  &-active {
    background: linear-gradient(90deg,#1ecfff33 0%,#1a2b3f 100%);
    color: #1ecfff;
    box-shadow: 0 2px 12px #1ecfff33;
  }
  .sidebar-text {
    margin-left: 16px;
    font-size: 17px;
    font-weight: 600;
  }
}
.sidebar-submenu {
  margin-left: 24px;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sidebar-subitem {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  cursor: pointer;
  border-radius: 8px 0 0 8px;
  font-size: 15px;
  color: #7ad0ff;
  font-weight: 500;
  transition: all 0.2s;
  background: transparent;
  &:hover {
    background: linear-gradient(90deg,#1ecfff22 0%,#1a2b3f 100%);
    color: #1ecfff;
  }
  &-active {
    background: linear-gradient(90deg,#1ecfff33 0%,#1a2b3f 100%);
    color: #1ecfff;
    box-shadow: 0 2px 8px #1ecfff33;
  }
  .sidebar-subtext {
    margin-left: 8px;
    font-size: 15px;
    font-weight: 500;
  }
}
.main-content {
  flex: 1;
  padding: 36px 36px 36px 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.main-content-header {
  margin-bottom: 24px;
  .main-content-title {
    font-size: 28px;
    font-weight: bold;
    color: #1ecfff;
    letter-spacing: 2px;
    text-shadow: 0 0 8px #1ecfff55;
  }
}
.main-content-body {
  background: rgba(20,34,56,0.92);
  border-radius: 18px;
  min-height: 600px;
  padding: 32px 36px;
  box-shadow: 0 4px 32px #1ecfff22;
  transition: box-shadow 0.2s;
  margin-bottom: 32px;
}
@media (max-width: 1200px) {
  .main-sidebar {
    width: 180px;
    padding: 16px 0;
  }
  .main-content {
    padding: 24px 8px 24px 0;
  }
  .main-content-body {
    padding: 18px 8px;
  }
}
@media (max-width: 900px) {
  .main-header {
    padding: 0 12px;
    height: 56px;
  }
  .main-title {
    font-size: 20px;
  }
  .main-sidebar {
    width: 100px;
    padding: 8px 0;
  }
  .main-content {
    padding: 8px 2px 8px 0;
  }
  .main-content-body {
    padding: 8px 2px;
  }
}
</style> 