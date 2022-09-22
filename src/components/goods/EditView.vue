<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="修改商品信息" type="info" :closable="false" show-icon>
      </el-alert>

      <!-- 步骤条区 -->
      <el-steps :space="200" :active="+activeIndex" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 标签栏区 -->
      <el-form :model="updateForm" :rules="updateFormRules" ref="updateFormRef" label-width="80px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="updateForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="updateForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="updateForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="updateForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="updateForm.goods_cat" :options="categoryList" :props="cascaderProps"
                @change="handleCategoryChange()" clearable ref="cascader">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture"
              :headers="headerObject" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容 -->
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="updateForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="add_button" @click="update()">修改商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="提示" :visible.sync="previewDialogVisible" width="50%" @close="closePreviewDialog()">
      <img :src="previewPath" alt="" class="preview_image">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      // 当前商品id
      id: 0,
      // 当前页面步骤
      activeIndex: '0',

      // 修改商品表单数据
      updateForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [], // 需要转为以','分割的分类列表
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 修改用户表单数据验证规则
      updateFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      categoryList: [],
      // 商品分类选项
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },

      // 动态参数列表
      manyTableData: [],

      // 静态属性列表
      onlyTableData: [],

      // 图片上传地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传请求头
      headerObject: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览地址
      previewPath: '',
      // 图片预览对话框
      previewDialogVisible: false
    }
  },
  created() {
    this.getCategoryList()
    this.id = this.$route.query.id // 当前商品id
    this.getGoods(this.id)
  },
  methods: {
    // 获取商品信息
    async getGoods(id) {
      const { data: res } = await this.$http.get(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取商品数据失败')
      res.data.goods_cat = res.data.goods_cat.split(',').map(Number)
      res.data.attrs.forEach((element) => {
        const attribute = {
          attr_id: element.attr_id,
          attr_name: element.attr_name,
          attr_vals: element.attr_value
        }
        if (element.attr_sel === 'many') {
          this.manyTableData.push(attribute)
        } else {
          this.onlyTableData.push(attribute)
        }
      })
      // 后端并未提供相关api
      res.data.pics = [] // 鉴于后台未给出图片下载的api，故对图片无法回显，可直接清空处理
      this.updateForm = res.data
    },
    // 页签切换事件
    beforeTabLeave(newActiveName, oldActiveName) {
      if (oldActiveName === '0' && (this.updateForm.goods_name === '' || this.updateForm.goods_price === 0 || this.updateForm.goods_cat.length !== 3)) {
        this.$message.error('请先完成基本信息的填写')
        return false
      }
      return true
    },

    // 获取动态参数
    async getManyTableData() {
      // 动态参数面板
      const { data: res } = await this.$http.get(`categories/${this.categoryId}/attributes`, { params: { sel: 'many' } })
      if (res.meta.status !== 200) return this.$message.error('获取商品动态参数数据失败')
      this.manyTableData = res.data
    },

    // 获取静态属性
    async getOnlyTableData() {
      // 静态属性面板
      const { data: res } = await this.$http.get(`categories/${this.categoryId}/attributes`, { params: { sel: 'only' } })
      if (res.meta.status !== 200) return this.$message.error('获取商品静态参数数据失败')
      this.onlyTableData = res.data
    },

    // 获取商品分类数据
    async getCategoryList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 3 } })
      if (res.meta.status !== 200) return this.$message.error('获取分类数据失败')
      this.categoryList = res.data
    },
    // 处理分类变化
    handleCategoryChange() {
      this.$refs.cascader.dropDownVisible = false // 关闭下拉菜单
      // 选择一级或二级分类特殊处理
      if (this.updateForm.goods_cat.length !== 3) {
        if (this.updateForm.goods_cat.length !== 0) this.$message.error('只能为第三级分类设置相关参数')
        this.updateForm.goods_cat = []
      }
      this.getManyTableData()
      this.getOnlyTableData()
    },

    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理图片移除效果
    handleRemove(file) {
      const path = file.response.data.tmp_path // 得到图片临时路径
      const i = this.updateForm.pics.findIndex(element => element.pic === path) // 得到图片的索引
      this.updateForm.pics.splice(i, 1) // 移除图片
    },
    // 处理图片上传成功事件
    handleSuccess(response) {
      const pic = { pic: response.data.tmp_path } // 得到图片临时路径
      this.updateForm.pics.push(pic) // 添加图片的临时路径
    },
    // 关闭图片预览对话框
    closePreviewDialog() {
      this.previewDialogVisible = false
    },

    // 修改商品
    update() {
      this.$refs.updateFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请检查是否正确填写商品的必要信息')
        // 处理表单数据
        this.updateForm.attrs = [] // 避免重复添加需将原attr清空
        const form = _.cloneDeep(this.updateForm) // 深拷贝表单
        form.goods_cat = form.goods_cat.join(',')
        this.manyTableData.forEach((element) => {
          const attribute = {
            attr_id: element.attr_id,
            attr_value: element.attr_vals
          }
          form.attrs.push(attribute)
        })
        this.onlyTableData.forEach((element) => {
          const attribute = {
            attr_id: element.attr_id,
            attr_value: element.attr_vals
          }
          form.attrs.push(attribute)
        })
        // 发起修改商品请求
        const { data: res } = await this.$http.put(`goods/${this.id}`, form)
        if (res.meta.status !== 200) return this.$message.error('修改商品失败')
        this.$message.success('修改商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 当前选中的分类id
    categoryId() {
      if (this.updateForm.goods_cat.length === 3) {
        return this.updateForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px !important;
  font-size: small;
}

.preview_image {
  width: 100%;
}

.add_button {
  margin-top: 15px;
}
</style>
