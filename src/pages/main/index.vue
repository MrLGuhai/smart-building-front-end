<template>
  <view class="main-container">
    <!-- 顶部栏 -->
    <view class="header">
      <text class="system-title">智能楼宇环境监控系统</text>
      <view class="logout" @click="handleLogout">
        <uni-icons type="poweroff" size="18" color="#666"></uni-icons>
        <text class="logout-text">退出登录</text>
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
          <!-- 其他页面的内容将在后续添加 -->
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataDisplay from '@/components/DataDisplay.vue'
import ThresholdSettings from '@/components/ThresholdSettings.vue'
import ManualControl from '@/components/ManualControl.vue'

const menuItems = [
  { name: '数据展示', icon: 'list' },
  { name: '阈值设置', icon: 'gear' },
  { name: '手动控制', icon: 'paperplane' },
  { name: '历史数据', icon: 'search' }
]

const currentMenuIndex = ref(0)

const currentMenuItem = computed(() => menuItems[currentMenuIndex.value])

const handleMenuClick = (index) => {
  currentMenuIndex.value = index
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.redirectTo({
          url: '/pages/login/index'
        })
      }
    }
  })
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
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 100;
  
  .system-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    letter-spacing: 1px;
  }
  
  .logout {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 4px;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    .logout-text {
      margin-left: 6px;
      font-size: 14px;
      color: #666;
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
</style> 