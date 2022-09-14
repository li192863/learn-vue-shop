<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索添加区 -->
      <el-row :gutter="20">
        <!-- 添加-->
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog()">添加角色</el-button>
        </el-col>
      </el-row>

      <!--角色列表区 -->
      <el-table :data="roleList" border stripe>
        <el-table-column label="" type="expand">

          <template slot-scope="scope">
            <!-- 划分行 放置一级权限 -->
            <el-row :class="['vcenter', 'bdbottom', i1 === 0? 'bdtop': '']" v-for="(item1, i1) in scope.row.children"
              :key="item1.id">
              <!-- 划分列 一级权限占5列宽度 -->
              <el-col :span="5">
                <el-tag closable @close="removeRight(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 划分列 二三级权限占剩余宽度 -->
              <el-col :span="19">
                <!-- 划分行 二级权限按行放置 -->
                <el-row :class="['vcenter', i2 !== 0? 'bdtop': '']" v-for="(item2, i2) in item1.children"
                  :key="item2.id">
                  <!-- 划分列 二级权限占6列宽度 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRight(scope.row, item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 划分列 三级权限占剩余宽度 -->
                  <el-col :span="18">
                    <el-tag type="warn" closable @close="removeRight(scope.row, item3.id)"
                      v-for="item3 in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>

        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
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
            <!-- 分配权限 -->
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRoleRightDialog(scope.row)">
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="closeAddDialog()">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="updateDialogVisible" width="50%" @close="closeUpdateDialog()">
      <!-- 内容主体区 -->
      <el-form :model="updateForm" :rules="updateFormRules" ref="updateFormRef" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="updateForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="updateForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="update()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRoleRightDialogVisible" width="50%" @close="closeSetRoleRightDialog()">
      <!-- 内容主体区 -->
      <el-tree :data="rightList" :props="treeProps" show-checkbox node-key="id" :default-expand-all="true"
        :default-checked-keys="selectedKeys" ref="treeRef"></el-tree>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleRight()">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表
      roleList: [],
      // 当前角色
      current: {},

      // 添加角色对话框
      addDialogVisible: false,
      // 添加角色表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单数据验证规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },

      // 修改用户对话框
      updateDialogVisible: false,
      // 修改用户表单数据
      updateForm: {
        username: '',
        roleName: '',
        roleDesc: ''
      },
      // 修改用户表单数据验证规则
      updateFormRules: {
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },

      // 分配权限对话框
      setRoleRightDialogVisible: false,
      // 所有权限列表
      rightList: [],
      // 树形结构属性
      treeProps: {
        children: 'children', // 父子嵌套属性
        label: 'authName' // 名称
      },
      // 树形结构默认选中的权限
      selectedKeys: []
    }
  },
  created() {
    this.getAll()
  },
  methods: {
    // 获取角色列表
    async getAll() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.roleList = res.data
    },

    // 删除对应权限
    async removeRight(role, rightId) {
      const confirmRes = await this.$confirm('此操作将永久删除该权限, 是否继续?', '删除权限', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err) // 用户点击取消返回cancel 点击确认返回confirm
      if (confirmRes !== 'confirm') return this.$message.info('删除权限已取消')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      this.$message.success('删除权限成功')
      // 重新渲染该角色
      role.children = res.data
    },

    // 显示添加角色对话框
    showAddDialog() {
      this.addDialogVisible = true
    },
    // 添加角色
    add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        // 发起添加用户请求
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加角色成功')
        this.addDialogVisible = false
        this.getAll()
      })
    },
    // 关闭添加角色对话框
    closeAddDialog() {
      this.$refs.addFormRef.resetFields()
    },

    // 显示修改角色对话框
    async showUpdateDialog(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('查询角色数据失败')
      this.updateForm = res.data
      this.updateDialogVisible = true
    },
    // 修改角色
    update() {
      this.$refs.updateFormRef.validate(async (valid) => {
        if (!valid) return
        // 发起修改用户请求
        const { data: res } = await this.$http.put(`roles/${this.updateForm.roleId}`, this.updateForm)
        if (res.meta.status !== 200) return this.$message.error('更新角色失败')
        this.$message.success('更新角色成功')
        this.updateDialogVisible = false
        this.getAll()
      })
    },
    // 关闭修改角色对话框
    closeUpdateDialog() {
      this.$refs.updateFormRef.resetFields()
    },

    // 删除角色
    async remove(id) {
      const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '删除角色', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err) // 用户点击取消返回cancel 点击确认返回confirm
      if (confirmRes !== 'confirm') return this.$message.info('删除角色已取消')
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      this.$message.success('删除角色成功')
      this.getAll()
    },

    // 显示分配权限对话框
    async showSetRoleRightDialog(role) {
      this.current = role // 保存对象以供后续使用
      // 获取所有权限
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.rightList = res.data
      // 获取角色下所有三级权限并保存至selectedKeys中
      this.getLeafKeys(role, this.selectedKeys)
      this.setRoleRightDialogVisible = true
    },
    // 获取角色下所有三级权限并保存至selectedKeys中
    getLeafKeys(node, arr) {
      if (!node.children) { // node.children == 0 为三级结点
        return arr.push(node.id)
      }
      // 遍历每个非三级结点
      node.children.forEach(element => {
        this.getLeafKeys(element, arr)
      })
      // for (let i = 0; i < node.children.length; i++) {
      //   this.getLeafKeys(node.children[i], arr)
      // }
    },
    // 分配角色权限
    async setRoleRight() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.current.id}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配角色权限失败')
      this.$message.success('分配角色权限成功')
      this.setRoleRightDialogVisible = false
      this.getAll()
    },
    // 关闭分配角色对话框
    closeSetRoleRightDialog() {
      this.selectedKeys = [] // 清空selectedKeys数组元素避免重复堆积元素
      this.setRoleRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
