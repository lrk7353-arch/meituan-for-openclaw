import axios from 'axios';
import { ElMessage } from 'element-plus';

const api = axios.create({
  // 如果有环境变量 VITE_API_URL，就用它；否则默认用 /api (走本地代理)
  baseURL: 'https://meituan-for-openclaw.onrender.com', // 成功吧，球球了
  timeout: 10000
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    const message = error.response?.data?.error || '请求失败，请稍后重试';
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export default api;
