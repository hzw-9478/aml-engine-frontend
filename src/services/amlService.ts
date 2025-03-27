import axios from 'axios';
import router from '@/router';

const service = axios.create({
  baseURL: 'http://localhost:3000/api', // 实际API地址
  timeout: 10000
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    if (response.data.code !== 200) {
      return Promise.reject(response.data);
    }
    return response.data;
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          router.push('/login');
          break;
        case 403:
          alert('权限不足');
          break;
        case 500:
          alert('服务器错误');
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default service;