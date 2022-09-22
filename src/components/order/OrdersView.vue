<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索添加区 -->
      <el-row :gutter="20">
        <!-- 搜索 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getAll()"
            @keyup.enter.native="getAll()">
            <el-button slot="append" icon="el-icon-search" @click="getAll()"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表区 -->
      <el-table :data="orderList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
            <!-- 指示使用全局过滤器dateFormat -->
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改地址 -->
            <el-tooltip effect="dark" content="修改地址" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showUpdateDialog(scope.row.order_id)">
              </el-button>
            </el-tooltip>
            <!-- 展示进度 -->
            <el-tooltip effect="dark" content="展示进度" placement="top" :enterable="false">
              <el-button type="success" icon="el-icon-location" size="mini"
                @click="showProgressDialog(scope.row.order_id)">
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

    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="updateDialogVisible" width="50%" @close="closeUpdateDialog()">
      <!-- 内容主体区 -->
      <el-form :model="updateForm" :rules="updateFormRules" ref="updateFormRef" label-width="80px">
        <el-form-item label="省市区县" prop="address1">
          <el-cascader v-model="updateForm.address1" :options="cityData" :props="cascaderProps"
            @change="handleAddress1Change()" clearable ref="cascader">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="updateForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="update()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%" @close="closeProgressDialog()">
      <!-- 内容主体区 -->
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
      <!-- 底部按钮区 -->
    </el-dialog>

  </div>
</template>

<script>
import cityData from './citydata.js'

export default {
  data() {
    return {
      // 用户请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表
      orderList: [],
      // 数目条数
      total: 0,

      // 地址信息
      cityData: cityData,
      // 地址选项
      cascaderProps: {
        value: 'value',
        label: 'label',
        children: 'children',
        expandTrigger: 'hover'
      },

      // 修改地址对话框
      updateDialogVisible: false,
      // 修改地址表单数据
      updateForm: {
        address1: [],
        address2: ''
      },
      // 修改地址表单数据验证规则
      updateFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },

      // 修改地址对话框
      progressDialogVisible: false,
      // 修改地址表单数据
      progressInfo: [ // 后台并未提供相关api
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ],
      // 修改地址表单数据验证规则
      progressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getAll()
  },
  methods: {
    // 获取订单列表
    async getAll() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败')
      this.orderList = res.data.goods
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

    // 显示修改对话框
    async showUpdateDialog(id) {
      // 后台并未提供相关api
      // const { data: res } = await this.$http.get(`orders/${id}`)
      // if (res.meta.status !== 200) return this.$message.error('查询用户数据失败')
      // this.updateForm = res.data
      this.updateDialogVisible = true
    },
    // 修改地址
    update() {
      this.$refs.updateFormRef.validate(async (valid) => {
        if (!valid) return
        // 后台并未提供相关api
        // const { data: res } = await this.$http.put(`users/${this.updateForm.id}`, this.updateForm)
        // if (res.meta.status !== 200) return this.$message.error('更新用户失败')
        this.$message.success('更新地址成功')
        this.updateDialogVisible = false
        this.getAll()
      })
    },
    // 关闭修改地址对话框
    closeUpdateDialog() {
      this.$refs.updateFormRef.resetFields()
    },

    // 处理地址变化
    handleAddress1Change() {
      this.$refs.cascader.dropDownVisible = false // 关闭下拉菜单
    },

    // 显示物流进度对话框
    /* async */ showProgressDialog() {
      // 后端并未提供相关api
      // const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      // if (res.meta.status !== 200) return this.$http.error('获取物流信息失败')
      this.progressDialogVisible = true
    },
    // 关闭物流进度对话框
    closeProgressDialog() {
      this.progressDialogVisible = false
    }
  }

}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
