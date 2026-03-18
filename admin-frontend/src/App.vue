<template>
  <el-container style="height: 100vh">
    <el-header>
      <div class="header-content">
        <div class="logo">
          <el-icon :size="24" style="margin-right: 8px; vertical-align: middle">
            <Camera />
          </el-icon>
          活码管理系统
        </div>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :ellipsis="false"
          @select="handleSelect"
        >
          <el-menu-item index="/activities" class="menu-item-spacing">活动管理</el-menu-item>
          <el-menu-item index="/switch-logs" class="menu-item-spacing">切换日志</el-menu-item>
          <el-menu-item index="/help-guide" class="menu-item-spacing">使用说明</el-menu-item>
          <el-menu-item index="/help-faq" class="menu-item-spacing">常见问题</el-menu-item>
        </el-menu>
      </div>
    </el-header>

    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Camera } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeMenu = ref('/activities')

// 监听路由变化，更新菜单激活状态
watch(() => route.path, (newPath) => {
  // 简单匹配活动编辑页面
  if (newPath.startsWith('/activities/edit')) {
    activeMenu.value = '/activities'
  } else {
    activeMenu.value = newPath
  }
}, { immediate: true })

const handleSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

::deep(.el-container) {
  background: #f5f7fa;
}

::deep(.el-header) {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

::deep(.el-menu) {
  border-bottom: none;
  flex: 1;
  justify-content: flex-end;
}

::deep(.el-menu-item) {
  border-bottom: 2px solid transparent !important;
  margin: 0 8px !important;
  padding: 0 16px !important;
  height: 60px !important;
  line-height: 60px !important;
}

::deep(.el-menu-item.is-active) {
  border-bottom-color: #409eff;
}

::deep(.el-main) {
  padding: 20px;
}
</style>
