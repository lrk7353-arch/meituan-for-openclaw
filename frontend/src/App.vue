<template>
  <div id="app">
    <el-container class="app-container">
      <!-- 顶部导航 -->
      <el-header class="app-header">
        <div class="header-content">
          <div class="logo">
            <el-icon :size="32" color="#222222"><Food /></el-icon>
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
  background-color: #fffcf5; /* 全局暖色背景 */
}

.app-header {
  background: #FFC300; /* 美团黄 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 0;
  height: 64px;
  position: sticky; /* 移动端 sticky */
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo h1 {
  font-size: 22px;
  font-weight: 700;
  color: #222222;
  letter-spacing: 0.5px;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  text-decoration: none;
  color: #222222;
  font-weight: 500;
  font-size: 16px;
  transition: all 0.2s;
  padding: 4px 0;
  position: relative;
}

.nav-links a:hover {
  font-weight: 700;
}

.nav-links a.router-link-active {
  font-weight: 700;
}

.nav-links a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #222222;
  border-radius: 2px;
}

.app-main {
  flex: 1;
  padding: 24px 20px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.app-footer {
  background: #fff;
  border-top: 1px solid #f0f0f0;
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-header {
    height: auto;
    min-height: 56px;
    padding: 8px 0;
  }

  .header-content {
    flex-direction: column;
    gap: 12px;
    padding: 0 16px;
  }

  .logo h1 {
    font-size: 18px;
  }

  .nav-links {
    width: 100%;
    justify-content: space-between;
    gap: 0;
    padding-bottom: 4px;
    overflow-x: auto; /* 允许横向滚动如果实在太窄 */
  }

  .nav-links a {
    font-size: 14px;
    padding: 8px 12px;
    white-space: nowrap;
  }

  .nav-links a.router-link-active::after {
    bottom: 2px;
    width: 16px;
    height: 2px;
  }

  .app-main {
    padding: 16px 12px;
  }
}
</style>
