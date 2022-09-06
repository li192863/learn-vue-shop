<template>
  <div class="login_container">
    <!-- 登录 -->
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单 -->
      <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" class="login_form">
        <!-- 用户名称 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <!-- 用户密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btn">
          <el-button type="primary" @click="login()">登录</el-button>
          <el-button type="info" @click="resetLoginForm()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单
      loginForm: {
        username: '',
        password: ''
      },
      // 表单验证规则
      loginFormRules: {
        username: [ // 验证用户名
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [ // 验证密码
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 提交表单
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        // 校验未通过
        if (!valid) return
        // 发送登录请求
        const { data: res } = await this.axios.post('login', this.loginForm)
        // 状态码异常登录失败
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 登录成功
        this.$message.success(res.meta.msg)
        window.sessionStorage.setItem('token', res.data.token) // 将token保存至客户端的sessionStorage中
        this.$router.push('/home') // 跳转至主页
      })
    },
    // 重置表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  /* 居中显示 */
  position: absolute;  /* 绝对定位 */
  left: 50%;  /* 左边缘距离父元素的50% */
  top: 50%;  /* 上边缘距离父元素的50% */
  transform: translate(-50%, -50%);  /* 向左/下移动元素自身距离的50% */

  .avatar_box {
    width: 130px;
    height: 130px;
    border: 1px, solid, #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;  /* 阴影 */
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.btn {
  display: flex;
  justify-content: flex-end;
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box; /* 要设置的边框和内边距的值是包含在width内的 */
}
</style>
