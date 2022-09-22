import Vue from 'vue'
import axios from 'axios'

import NProgress from 'nprogress' // 导入进度条
import 'nprogress/nprogress.css'

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 请求拦截器
axios.interceptors.request.use(config => {
  // Do something before request is sent
  NProgress.start() // 显示进度条
  config.headers.Authorization = window.sessionStorage.getItem('token') // 为请求头添加字段（token令牌）
  return config // 最后必须返回config
})

// Add a response interceptor
axios.interceptors.response.use(config => {
  // Do something with response data
  NProgress.done() // 关闭进度条
  return config
})

Vue.prototype.$http = axios // 将axios挂载至Vue的原型对象，可作为属性使用
