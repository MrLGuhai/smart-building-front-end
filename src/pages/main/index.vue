<template>
  <view class="main-container">
    <!-- 顶部栏 -->
    <view class="header">
      <text class="system-title">智能楼宇环境监控系统</text>
      <view class="header-right">
        <text class="username">[{{ user.username }}]</text>
        <view class="logout-btn" @click="handleLogout">
          <uni-icons type="poweroff" size="16" color="#666"></uni-icons>
          <text>退出登录</text>
        </view>
        <view class="screen-btn" @click="handleGoScreen">
          <uni-icons type="tv" size="16" color="#4a6fee"></uni-icons>
          <text>数字大屏</text>
        </view>
      </view>
    </view>
    
    <view class="content">
      <!-- 左侧菜单 -->
      <view class="sidebar">
        <view 
          v-for="(item, index) in menuItems" 
          :key="index"
          class="menu-item"
          :class="{'menu-item-active': currentMenuIndex === index}"
          @click="handleMenuClick(index)"
        >
          <uni-icons :type="item.icon" size="20" :color="currentMenuIndex === index ? '#4a6fee' : '#666'"></uni-icons>
          <text class="menu-text">{{ item.name }}</text>
        </view>
        
        <!-- 历史数据子菜单 -->
        <view v-if="menuItems[currentMenuIndex].subItems" class="sub-menu">
          <view 
            v-for="(subItem, subIndex) in menuItems[currentMenuIndex].subItems" 
            :key="subIndex"
            class="sub-menu-item"
            :class="{'sub-menu-item-active': currentSubMenuIndex === subIndex}"
            @click="handleSubMenuClick(subIndex)"
          >
            <text class="sub-menu-text">{{ subItem.name }}</text>
          </view>
        </view>
      </view>
      
      <!-- 主内容区域 -->
      <view class="main-content">
        <view class="content-header">
          <text class="content-title">{{ currentMenuItem.name }}</text>
        </view>
        <view class="content-body">
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
.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .system-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .username {
      font-size: 14px;
      color: #666;
      padding: 4px 8px;
      background: #f5f7fa;
      border-radius: 4px;
    }
    
    .logout-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      font-size: 14px;
      color: #666;
      background: #f5f7fa;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: #e6e8eb;
        color: #333;
      }
      
      &:active {
        transform: scale(0.98);
      }
    }
    
    .screen-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      font-size: 14px;
      color: #4a6fee;
      background: #f0f5ff;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 8px;
      transition: all 0.3s;
      &:hover {
        background: #e6e8eb;
        color: #333;
      }
      &:active {
        transform: scale(0.98);
      }
    }
  }
}

.content {
  flex: 1;
  display: flex;
  height: calc(100vh - 60px);
}

.sidebar {
  width: 220px;
  background: #fff;
  padding: 20px 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

.menu-item {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: #f5f7fa;
  }
  
  &-active {
    background-color: #f0f5ff;
    border-right: 3px solid #4a6fee;
    
    .menu-text {
      color: #4a6fee;
      font-weight: 500;
    }
  }
  
  .menu-text {
    margin-left: 12px;
    font-size: 15px;
    color: #333;
  }
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  
  .content-header {
    margin-bottom: 24px;
    
    .content-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .content-body {
    background: #fff;
    border-radius: 8px;
    min-height: calc(100% - 60px);
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  }
}

.sub-menu {
  margin-left: 20px;
  padding: 10px 0;
  
  .sub-menu-item {
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 24px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    &-active {
      background-color: #f0f5ff;
      border-right: 3px solid #4a6fee;
      
      .sub-menu-text {
        color: #4a6fee;
        font-weight: 500;
      }
    }
    
    .sub-menu-text {
      font-size: 14px;
      color: #666;
    }
  }
}
</style> 