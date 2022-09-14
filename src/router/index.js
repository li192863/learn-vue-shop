import Vue from 'vue'
import Router from 'vue-router'
import LoginView from '../components/LoginView.vue'
import HomeView from '../components/HomeView.vue'
import WelcomeView from '../components/WelcomeView.vue'
import UsersView from '../components/user/UsersView.vue'
import RightsView from '../components/power/RightsView.vue'
import RolesView from '../components/power/RolesView.vue'

Vue.use(Router)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  {
    path: '/home',
    component: HomeView,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: WelcomeView },
      { path: '/users', component: UsersView },
      { path: '/rights', component: RightsView },
      { path: '/roles', component: RolesView }
    ]
  }
]

const router = new Router({
  routes
})

// 挂载路由导向守卫
router.beforeEach((to, from, next) => { // to为将要访问的路径 from为从某个页面跳转而来 next为放行函数
  // 若访问login页面直接放行
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 若token不存在则跳转至登录页面
  if (!tokenStr) return next('/login') // 强制跳转至login
  // 放行
  next()
})

export default router
