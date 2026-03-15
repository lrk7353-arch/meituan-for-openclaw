<template>
  <div class="loading-container" :class="{ fullscreen }">
    <div class="loading-content">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <p v-if="text" class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '加载中...'
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #606266;
  font-size: 14px;
  margin: 0;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .spinner {
    border-color: #2c2c2c;
    border-top-color: #409EFF;
  }

  .loading-container.fullscreen {
    background: rgba(0, 0, 0, 0.9);
  }

  .loading-text {
    color: #909399;
  }
}
</style>
