<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索添加区 -->
      <el-row :gutter="20">
        <!-- 搜索 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getAll()" @keyup.enter.native="getAll()">
            <el-button slot="append" icon="el-icon-search" @click="getAll()"></el-button>
          </el-input>
        </el-col>
        <!-- 添加-->
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog()">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽-获取子组件的数据并命名为scope -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="updateUserState(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showUpdateDialog(scope.row.id)">
              </el-button>
            </el-tooltip>
            <!-- 删除 -->
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="remove(scope.row.id)">
              </el-button>
            </el-tooltip>
            <!-- 分配角色 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRoleDialog(scope.row)">
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 页码区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[10, 20, 30, 40, 50]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="closeAddDialog()">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="updateDialogVisible" width="50%" @close="closeUpdateDialog()">
      <!-- 内容主体区 -->
      <el-form :model="updateForm" :rules="updateFormRules" ref="updateFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="updateForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="updateForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="updateForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="update()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="closeSetRoleDialog()">
      <!-- 内容主体区 -->
      <div>
        <p>当前用户：{{current.username}}</p>
        <p>当前角色：{{current.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRole()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 邮箱验证器
    const checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback() // 合法邮箱
      }
      return callback(new Error('请输入合法的邮箱'))
    }
    // 手机验证器
    const checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      return callback(new Error('请输入合法的手机号'))
    }
    return {
      // 用户请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 用户列表
      userList: [],
      // 数目条数
      total: 0,
      // 当前用户
      current: {},

      // 添加用户对话框
      addDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单数据验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符内', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 10, message: '密码长度在 3 到 10 个字符内', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },

      // 修改用户对话框
      updateDialogVisible: false,
      // 修改用户表单数据
      updateForm: {
        username: ''
      },
      // 修改用户表单数据验证规则
      updateFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },

      // 分配角色对话框
      setRoleDialogVisible: false,
      // 角色列表
      roleList: [],
      // 已选中的角色id值
      selectedRoleId: ''
    }
  },
  created() {
    this.getAll()
  },
  methods: {
    // 获取用户列表
    async getAll() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听页面大小pagesize变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getAll()
    },
    // 监听当前页码currentpage变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getAll()
    },

    // 修改用户状态
    async updateUserState(userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('修改用户状态失败')
      }
      this.$message.success('修改用户状态成功')
    },

    // 显示添加用户对话框
    showAddDialog() {
      this.addDialogVisible = true
    },
    // 添加用户
    add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        // 发起添加用户请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getAll()
      })
    },
    // 关闭添加用户对话框
    closeAddDialog() {
      this.$refs.addFormRef.resetFields()
    },

    // 显示修改对话框
    async showUpdateDialog(id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('查询用户数据失败')
      this.updateForm = res.data
      this.updateDialogVisible = true
    },
    // 修改用户
    update() {
      this.$refs.updateFormRef.validate(async (valid) => {
        if (!valid) return
        // 发起修改用户请求
        const { data: res } = await this.$http.put(`users/${this.updateForm.id}`, this.updateForm)
        if (res.meta.status !== 200) return this.$message.error('更新用户失败')
        this.$message.success('更新用户成功')
        this.updateDialogVisible = false
        this.getAll()
      })
    },
    // 关闭修改用户对话框
    closeUpdateDialog() {
      this.$refs.updateFormRef.resetFields()
    },

    // 删除用户
    async remove(id) {
      const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err) // 用户点击取消返回cancel 点击确认返回confirm
      if (confirmRes !== 'confirm') return this.$message.info('删除用户已取消')
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')
      this.getAll()
    },

    // 显示分配角色对话框
    async showSetRoleDialog(user) {
      this.current = user // 保存对象以供后续使用
      // 获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.roleList = res.data

      this.setRoleDialogVisible = true
    },
    // 分配角色
    async setRole() {
      if (!this.selectedRoleId) return this.$message.error('请选择要分配的角色')
      const { data: res } = await this.$http.put(`users/${this.current.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) return this.$message.error('更新用户角色失败')
      this.$message.success('更新用户角色成功')
      this.setRoleDialogVisible = false
      this.getAll()
    },
    // 关闭分配角色对话框
    closeSetRoleDialog() {
      this.selectedRoleId = ''
      this.setRoleDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>

</style>
