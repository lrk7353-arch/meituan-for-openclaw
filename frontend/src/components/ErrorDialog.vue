<template>
  <el-dialog
    v-model="visible"
    title="系统提示"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <el-result
      :icon="iconType"
      :title="title"
      :sub-title="message"
    >
      <template #extra>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-result>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // success, warning, error, info
    validator: (value) => ['success', 'warning', 'error', 'info'].includes(value)
  },
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const iconType = computed(() => {
  const map = {
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info'
  };
  return map[props.type];
});

const handleConfirm = () => {
  emit('confirm');
  visible.value = false;
};
</script>
