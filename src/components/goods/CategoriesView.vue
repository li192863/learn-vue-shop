<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索添加区 -->
      <el-row :gutter="20">
        <!-- 添加-->
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog()">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 列表区 -->
      <tree-table class="tree_table" :data="categoryList" :columns="columns" :selection-type="false"
        :expand-type="false" show-index index-text="#" border :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isValid" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: green;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-if="scope.row.cat_level === 2">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operation" slot-scope="scope">
          <!-- 编辑 -->
          <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showUpdateDialog(scope.row.cat_id)">
            </el-button>
          </el-tooltip>
          <!-- 删除 -->
          <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="remove(scope.row.cat_id)">
            </el-button>
          </el-tooltip>
        </template>
      </tree-table>

      <!-- 页码区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[10, 20, 30, 40, 50]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="closeAddDialog()">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <!-- 级联选择框 -->
        <el-form-item label="父级分类">
          <el-cascader v-model="selectedKeys" :options="parentCategoryList" :props="cascaderProps" @change="handleParentCategoryChange()" clearable ref="cascader">
          </el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="updateDialogVisible" width="50%" @close="closeUpdateDialog()">
      <!-- 内容主体区 -->
      <el-form :model="updateForm" :rules="updateFormRules" ref="updateFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="updateForm.cat_name"></el-input>
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
      // 用户请求参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      // 分类列表
      categoryList: [],
      // 数目条数
      total: 0,
      // 列表列选项
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isValid' }, // 定义当前列类型为模板列 模板名称为isValid
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'operation' }
      ],

      // 添加分类对话框
      addDialogVisible: false,
      // 添加分类表单数据
      addForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      // 添加分类表单数据验证规则
      addFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCategoryList: [],
      // 父级分类选项
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 已选择的父级分类id
      selectedKeys: [],

      // 修改用户对话框
      updateDialogVisible: false,
      // 修改用户表单数据
      updateForm: {
        cat_name: ''
      },
      // 修改用户表单数据验证规则
      updateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getAll()
  },
  methods: {
    // 获取分类列表
    async getAll() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      this.categoryList = res.data.result
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

    // 显示添加分类对话框
    showAddDialog() {
      this.getParentCategoryList()
      this.addDialogVisible = true
    },
    // 添加分类
    add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        // 发起添加分类请求
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.addDialogVisible = false
        this.getAll()
      })
    },
    // 查询父级分类
    async getParentCategoryList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类失败')
      this.parentCategoryList = res.data
    },
    // 父级分类变化触发事件
    handleParentCategoryChange() {
      this.$refs.cascader.dropDownVisible = false // 关闭下拉菜单
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },
    // 关闭添加分类对话框
    closeAddDialog() {
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    },

    // 显示修改对话框
    async showUpdateDialog(id) {
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) return this.$message.error('查询分类数据失败')
      this.updateForm = res.data
      this.updateDialogVisible = true
    },
    // 修改分类
    update() {
      this.$refs.updateFormRef.validate(async (valid) => {
        if (!valid) return
        // 发起修改分类请求
        const { data: res } = await this.$http.put(`categories/${this.updateForm.cat_id}`, this.updateForm)
        if (res.meta.status !== 200) return this.$message.error('更新分类失败')
        this.$message.success('更新分类成功')
        this.updateDialogVisible = false
        this.getAll()
      })
    },
    // 关闭修改分类对话框
    closeUpdateDialog() {
      this.$refs.updateFormRef.resetFields()
    },

    // 删除分类
    async remove(id) {
      const confirmRes = await this.$confirm('此操作将永久删除该分类, 是否继续?', '删除分类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err) // 用户点击取消返回cancel 点击确认返回confirm
      if (confirmRes !== 'confirm') return this.$message.info('删除分类已取消')
      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败')
      this.$message.success('删除分类成功')
      this.getAll()
    }
  }
}
</script>

<style lang="less" scoped>
.tree_table {
  margin-top: 15px;
}

.el-cascader {
  width: 100%
}
</style>
