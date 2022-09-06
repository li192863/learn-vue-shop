<template>
  <div>
    <!-- 退出按钮 -->
    <el-button type="info" @click="logout()">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      window.sessionStorage.clear() // 清除token
      this.$router.push('/login') // 跳转至登录页面
    }
  }
}
</script>

<style lang="less" scoped></style>
