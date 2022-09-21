<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>分类管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
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
        <!-- 添加 -->
        <el-col :span="4">
          <el-button type="primary" @click="showAddPage()">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表区 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="80%"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="80%"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="160%">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}} <!-- 指示使用全局过滤器dateFormat -->
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditPage()">
              </el-button>
            </el-tooltip>
            <!-- 删除 -->
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="remove(scope.row.goods_id)">
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 用户请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 用户列表
      goodsList: [],
      // 数目条数
      total: 0,

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
          { required: true, message: '请输入用户名', trigger: 'blur' }
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
          { required: true, message: '请输入邮箱', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getAll()
  },
  methods: {
    // 获取商品列表
    async getAll() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.goodsList = res.data.goods
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

    // 显示添加商品页面
    showAddPage() {
      this.$router.push('goods/add')
    },

    // 显示修改商品页面
    showEditPage() {
      this.$router.push('goods/edit')
    },

    // 删除商品
    async remove(id) {
      const confirmRes = await this.$confirm('此操作将永久删除该商品, 是否继续?', '删除商品', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err) // 用户点击取消返回cancel 点击确认返回confirm
      if (confirmRes !== 'confirm') return this.$message.info('删除商品已取消')
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败')
      this.$message.success('删除商品成功')
      this.getAll()
    }
  }
}
</script>

<style lang="less" scoped>

</style>
