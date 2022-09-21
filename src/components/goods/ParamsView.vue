<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>分类管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只能为第三级分类设置相关参数" type="warning" :closable="false" show-icon>
      </el-alert>

      <!-- 搜索添加区 -->
      <el-row :gutter="20" class="category">
        <!-- 搜索 -->
        <el-col>
          <span>选择商品分类</span>
          <!-- 级联选择框 -->
          <el-cascader v-model="selectedKeys" :options="categoryList" :props="cascaderProps"
            @change="handleCategoryChange()" clearable ref="cascader">
          </el-cascader>
        </el-col>
      </el-row>

      <!-- 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数-->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加按钮 -->
          <el-button type="primary" :disabled="isCategorySelected" @click="showAddDialog()">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column label="" type="expand">

              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="removeTag(scope.row, i)">
                  {{item}}</el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ 新参数
                </el-button>
              </template>

            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <!-- 作用域插槽 -->
              <template slot-scope="scope">
                <!-- 修改 -->
                <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
                  <el-button type="primary" icon="el-icon-edit" size="mini"
                    @click="showUpdateDialog(scope.row.attr_id)">
                  </el-button>
                </el-tooltip>
                <!-- 删除 -->
                <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="remove(scope.row.attr_id)">
                  </el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加按钮 -->
          <el-button type="primary" :disabled="isCategorySelected" @click="showAddDialog()">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column label="" type="expand">

              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="removeTag(scope.row, i)">
                  {{item}}</el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ 新属性
                </el-button>
              </template>

            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <!-- 作用域插槽 -->
              <template slot-scope="scope">
                <!-- 修改 -->
                <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
                  <el-button type="primary" icon="el-icon-edit" size="mini"
                    @click="showUpdateDialog(scope.row.attr_id)">
                  </el-button>
                </el-tooltip>
                <!-- 删除 -->
                <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="remove(scope.row.attr_id)">
                  </el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数/属性对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="closeAddDialog()">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数/属性对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="updateDialogVisible" width="50%" @close="closeUpdateDialog()">
      <!-- 内容主体区 -->
      <el-form :model="updateForm" :rules="updateFormRules" ref="updateFormRef" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="updateForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="update()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 当前页面标签
      activeName: 'many',
      // 分类列表
      categoryList: [],
      // 分类选项
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 已选择的分类id
      selectedKeys: [],

      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],

      // 添加对话框
      addDialogVisible: false,
      // 添加表单数据
      addForm: {
        attr_name: ''
      },
      // 添加表单数据验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },

      // 修改对话框
      updateDialogVisible: false,
      // 修改表单数据
      updateForm: {
        attr_name: ''
      },
      // 修改表单数据验证规则
      updateFormRules: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    // 获取商品分类数据
    async getCategoryList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 3 } })
      if (res.meta.status !== 200) return this.$message.error('获取分类数据失败')
      this.categoryList = res.data
    },
    // 获取参数列表
    async getAll() {
      // 选择一级或二级分类特殊处理
      if (this.selectedKeys.length !== 3) {
        if (this.selectedKeys.length !== 0) this.$message.error('只能为第三级分类设置相关参数')
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const { data: res } = await this.$http.get(`categories/${this.categoryId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数数据失败')
      // 分割字符串转为数组
      res.data.forEach(element => {
        element.attr_vals = element.attr_vals ? element.attr_vals.split(' ') : []
        element.inputVisible = false
        element.inputValue = ''
      })
      // 保存数据
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 处理分类变化
    handleCategoryChange() {
      this.$refs.cascader.dropDownVisible = false // 关闭下拉菜单
      this.getAll()
    },
    // 处理页签切换
    handleTabClick() {
      this.getAll()
    },

    // 显示添加对话框
    showAddDialog() {
      this.addDialogVisible = true
    },
    // 添加
    add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        // 发起添加请求
        this.addForm.attr_sel = this.activeName
        const { data: res } = await this.$http.post(`categories/${this.categoryId}/attributes`, this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getAll()
      })
    },
    // 关闭添加对话框
    closeAddDialog() {
      this.$refs.addFormRef.resetFields()
    },

    // 显示修改对话框
    async showUpdateDialog(id) {
      const { data: res } = await this.$http.get(`categories/${this.categoryId}/attributes/${id}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('查询数据失败')
      this.updateForm = res.data
      this.updateDialogVisible = true
    },
    // 修改用户
    update() {
      this.$refs.updateFormRef.validate(async (valid) => {
        if (!valid) return
        // 发起修改用户请求
        this.updateForm.attr_sel = this.activeName
        const { data: res } = await this.$http.put(`categories/${this.categoryId}/attributes/${this.updateForm.attr_id}`, this.updateForm)
        if (res.meta.status !== 200) return this.$message.error('更新参数数据失败')
        this.$message.success('更新参数数据成功')
        this.updateDialogVisible = false
        this.getAll()
      })
    },
    // 关闭修改用户对话框
    closeUpdateDialog() {
      this.$refs.updateFormRef.resetFields()
    },

    // 删除
    async remove(id) {
      const confirmRes = await this.$confirm('此操作将永久删除该参数, 是否继续?', '删除参数', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err) // 用户点击取消返回cancel 点击确认返回confirm
      if (confirmRes !== 'confirm') return this.$message.info('删除参数已取消')
      const { data: res } = await this.$http.delete(`categories/${this.categoryId}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      this.$message.success('删除参数成功')
      this.getAll()
    },

    // 保存属性值
    async saveTag(tag) {
      const { data: res } = await this.$http.put(`categories/${this.categoryId}/attributes/${tag.attr_id}`, {
        attr_name: tag.attr_name,
        attr_sel: tag.attr_sel,
        attr_vals: tag.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) this.$message.error('修改参数项失败')
      this.$message.success('修改参数项成功')
    },
    // 确认输入
    handleInputConfirm(tag) {
      const text = tag.inputValue.trim()
      if (text.length === 0) {
        tag.inputValue = ''
        tag.inputVisible = false
        return
      }
      tag.attr_vals.push(text)
      tag.inputValue = ''
      tag.inputVisible = false
      this.saveTag(tag) // 后端存储结果
    },
    // 显示输入
    showInput(tag) {
      tag.inputVisible = true
      this.$nextTick(_ => { // 页面重新渲染后执行回调函数
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除属性值
    removeTag(tag, index) {
      tag.attr_vals.splice(index, 1)
      this.saveTag(tag) // 后端存储结果
    }
  },
  computed: {
    // 是否选中了三级分类
    isCategorySelected() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的分类id
    categoryId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 标题名称参数/属性
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }

}
</script>

<style lang="less" scoped>
.category {
  margin: 15px 0;

  span {
    margin-right: 15px;
  }
}

.el-tag {
  margin: 5px;
}

.input-new-tag {
  width: 90px;
  margin-left: 5px;
}
</style>
