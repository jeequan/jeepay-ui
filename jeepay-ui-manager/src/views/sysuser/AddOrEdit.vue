<template>
  <a-drawer
    :title=" isAdd ? '新增操作员' : '修改操作员' "
    placement="right"
    :closable="true"
    @ok="handleOkFunc"
    :visible="isShow"
    width="600"
    @close="onClose"
    :maskClosable="false"
  >
    <!-- <a-modal :confirmLoading="confirmLoading"> -->

    <a-form-model ref="infoFormModel" :model="saveObject" :label-col="{span: 8}" :wrapper-col="{span: 12}" :rules="rules">

      <a-form-model-item label="用户登录名:" prop="loginUsername">
        <a-input v-model="saveObject.loginUsername" :disabled="!isAdd" />
      </a-form-model-item>

      <a-form-model-item label="用户姓名：" prop="realname">
        <a-input v-model="saveObject.realname" />
      </a-form-model-item>

      <a-form-model-item label="手机号：" prop="telphone">
        <a-input v-model="saveObject.telphone" />
      </a-form-model-item>

      <a-form-model-item label="编号：" prop="userNo">
        <a-input v-model="saveObject.userNo" />
      </a-form-model-item>

      <a-form-model-item label="请选择性别：" prop="sex">
        <a-radio-group v-model="saveObject.sex">
          <a-radio :value="1">男</a-radio>
          <a-radio :value="2">女</a-radio>
        </a-radio-group>
      </a-form-model-item>

      <a-form-model-item label="是否为超级管理员：" prop="isAdmin">
        <a-radio-group v-model="saveObject.isAdmin">
          <a-radio :value="1">是</a-radio>
          <a-radio :value="0">否</a-radio>
        </a-radio-group>
      </a-form-model-item>

      <a-form-model-item label="状态：" prop="state">
        <a-radio-group v-model="saveObject.state">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">停用</a-radio>
        </a-radio-group>
      </a-form-model-item>

      <div class="drawer-btn-center">
        <a-button :style="{ marginRight: '8px' }" @click="onClose" icon="close">取消</a-button>
        <a-button type="primary" @click="handleOkFunc" icon="check" :loading="confirmLoading">保存</a-button>
      </div>

    </a-form-model>

  </a-drawer>
</template>

<script>
import { req, API_URL_SYS_USER_LIST } from '@/api/manage'

export default {

  props: {
    callbackFunc: { type: Function, default: () => ({}) }
  },

  data () {
    return {
      loading: false, // 按钮上的loading
      value: 1, // 单选框默认的值
      confirmLoading: false, // 显示确定按钮loading图标
      isAdd: true, // 新增 or 修改页面标识
      isShow: false, // 是否显示弹层/抽屉
      saveObject: {}, // 数据对象
      recordId: null, // 更新对象ID
      rules: {
        realname: [{ required: true, message: '请输入用户姓名', trigger: 'blur' }],
        telphone: [{ required: true, pattern: /^[1][0-9]{10}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
        userNo: [{ required: true, message: '请输入编号', trigger: 'blur' }],
        loginUsername: []
      }
    }
  },
  created () {
  },
  methods: {
    show (recordId) { // 弹层打开事件
      if (this.$refs.infoFormModel !== undefined) {
        this.$refs.infoFormModel.resetFields()
      }

      this.isAdd = !recordId
      // 数据恢复为默认数据
      this.saveObject = {
        isAdmin: 1,
        state: 1,
        sex: 1
      }
      this.rules.loginUsername = []
      this.confirmLoading = false // 关闭loading

      if (this.isAdd) {
        this.rules.loginUsername.push({
          required: true,
          pattern: /^[a-zA-Z][a-zA-Z0-9]{5,17}$/,
          message: '请输入字母开头，长度为6-18位的登录名',
          trigger: 'blur'
        })
      }

      const that = this
      if (!this.isAdd) { // 修改信息 延迟展示弹层
        that.recordId = recordId
        req.getById(API_URL_SYS_USER_LIST, recordId).then(res => { that.saveObject = res })
        this.isShow = true
      } else {
        that.isShow = true // 立马展示弹层信息
      }
    },
    handleOkFunc: function () { // 点击【确认】按钮事件
        const that = this
        this.$refs.infoFormModel.validate(valid => {
          if (valid) { // 验证通过
            // 请求接口
            that.loading = true // 打开按钮上的 loading
            that.confirmLoading = true // 显示loading
            if (that.isAdd) {
              req.add(API_URL_SYS_USER_LIST, that.saveObject).then(res => {
                that.$message.success('新增成功')
                that.isShow = false
                that.loading = false
                that.callbackFunc() // 刷新列表
              }).catch((res) => {
                that.confirmLoading = false
              })
            } else {
              req.updateById(API_URL_SYS_USER_LIST, that.recordId, that.saveObject).then(res => {
                that.$message.success('修改成功')
                that.isShow = false

                that.callbackFunc() // 刷新列表
              }).catch(res => { that.confirmLoading = false })
            }
          }
        })
    },
    // 点击遮罩层关闭抽屉
    onClose () {
      this.isShow = false
    }
  }
}
</script>
