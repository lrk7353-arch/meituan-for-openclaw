<template>
  <div id="app">
    <el-container class="app-container">
      <!-- 顶部导航 -->
      <el-header class="app-header">
        <div class="header-content">
          <div class="logo">
            <el-icon :size="32" color="#ff6b6b"><Food /></el-icon>
            <h1>大学城美食地图</h1>
          </div>
          <nav class="nav-links">
            <router-link to="/">首页</router-link>
            <router-link to="/map">地图</router-link>
            <router-link to="/favorites">我的收藏</router-link>
          </nav>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="app-main">
        <router-view />
      </el-main>

      <!-- 页脚 -->
      <el-footer class="app-footer">
        <p>© 2026 大学城美食地图 - 吃遍大学城</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { Food } from '@element-plus/icons-vue';
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 64px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-links a {
  text-decoration: none;
  color: #606266;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #ff6b6b;
}

.app-main {
  flex: 1;
  padding: 24px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.app-footer {
  background: #ffffff;
  border-top: 1px solid #dcdfe6;
  text-align: center;
  padding: 16px;
  color: #909399;
  font-size: 14px;
}

@media (max-width: 768px) {
  .app-header {
    height: 56px;
  }

  .logo h1 {
    font-size: 18px;
  }

  .nav-links {
    gap: 16px;
    font-size: 14px;
  }

  .app-main {
    padding: 16px;
  }
}
</style>
