import Vue from 'vue'
import App from './App.vue'
import router from './router'

import './plugins/axios.js' // 挂载axios
import './plugins/element.js' // 挂载message和confirm 注册element-ui
import './plugins/tree.js' // 注册组件TreeTable
import './plugins/dateFormatFilter.js' // 注册过滤器dateFormat
import './plugins/editor.js' // 注册文本编辑器VueQuillEditor
import './assets/fonts/iconfont.css' // 导入字体图标
import './assets/css/global.css' // 导入全局样式表

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App) // 告诉vue渲染什么样的结点
}).$mount('#app')
