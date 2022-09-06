import Vue from 'vue'
import App from './App.vue'
import router from './router'

import './plugins/axios.js'
import './plugins/element.js'
import './assets/fonts/iconfont.css' // 导入字体图标
import './assets/css/global.css' // 导入全局样式表

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App) // 告诉vue渲染什么样的结点
}).$mount('#app')
