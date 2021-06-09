<template>
  <a-drawer
    :maskClosable="false"
    :visible="visible"
    :title=" isAdd ? '新增服务商' : '修改服务商' "
    @close="onClose"
    :body-style="{ paddingBottom: '80px' }"
    width="40%"
  >
    <a-form-model ref="infoFormModel" :model="saveObject" layout="vertical" :rules="rules">
      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-model-item label="服务商名称" prop="isvName">
            <a-input
              placeholder="请输入服务商名称"
              v-model="saveObject.isvName"
            />
          </a-form-model-item>
        </a-col>
        <a-col :span="10">
          <a-form-model-item label="服务商简称" prop="isvShortName">
            <a-input
              placeholder="请输入服务商简称"
              v-model="saveObject.isvShortName"
            />
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-model-item label="联系人姓名" prop="contactName">
            <a-input
              placeholder="请输入联系人姓名"
              v-model="saveObject.contactName"
            />
          </a-form-model-item>
        </a-col>
        <a-col :span="10">
          <a-form-model-item label="联系人手机号" prop="contactTel">
            <a-input
              placeholder="请输入联系人手机号"
              v-model="saveObject.contactTel"
            >
            </a-input>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-model-item label="联系人邮箱" prop="contactEmail">
            <a-input
              placeholder="请输入联系人邮箱"
              v-model="saveObject.contactEmail"
            >
            </a-input>
          </a-form-model-item>
        </a-col>
        <a-col :span="10">
          <a-form-model-item label="状态" prop="state">
            <a-radio-group v-model="saveObject.state" :defaultValue="1">
              <a-radio :value="1">
                启用
              </a-radio>
              <a-radio :value="0">
                禁用
              </a-radio>
            </a-radio-group>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row justify="space-between" type="flex">
        <a-col :span="24">
          <a-form-model-item label="备注" prop="remark">
            <a-input v-model="saveObject.remark" placeholder="请输入备注" type="textarea" />
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>
    <div class="drawer-btn-center">
      <a-button icon="close" @click="onClose" style="margin-right:8px">
        取消
      </a-button>
      <a-button type="primary" style="margin-right:8px" icon="check" @click="handleOkFunc" :loading="btnLoading">
        保存
      </a-button>
    </div>
  </a-drawer>

</template>

<script>
import { API_URL_ISV_LIST, req } from '@/api/manage'
export default {

  props: {
    callbackFunc: { type: Function }
  },

  data () {
    return {
      btnLoading: false,
      isAdd: true, // 新增 or 修改页面标志
      saveObject: {}, // 数据对象
      recordId: null, // 更新对象ID
      visible: false, // 是否显示弹层/抽屉
      rules: {
        isvName: [ { required: true, message: '请输入服务商名称', trigger: 'blur' } ],
        isvShortName: [ { required: true, message: '请输入服务商简称', trigger: 'blur' } ],
        contactEmail: [{ required: false, pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/, message: '请输入正确的邮箱地址', trigger: 'blur' }],
        contactTel: [{ required: false, pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }]
      }
    }
  },
  created () {
  },
  methods: {
    show: function (recordId) { // 弹层打开事件
      this.isAdd = !recordId
      this.saveObject = { 'state': 1 } // 数据清空

      if (this.$refs.infoFormModel !== undefined) {
        this.$refs.infoFormModel.resetFields()
      }

      const that = this
      if (!this.isAdd) { // 修改信息 延迟展示弹层
        that.recordId = recordId
        req.getById(API_URL_ISV_LIST, recordId).then(res => {
          that.saveObject = res
          })
        this.visible = true
      } else {
        that.visible = true // 立马展示弹层信息
      }
    },

    handleOkFunc: function () { // 点击【确认】按钮事件
        const that = this
        this.$refs.infoFormModel.validate(valid => {
          if (valid) { // 验证通过
            that.btnLoading = true
            // 请求接口
            if (that.isAdd) {
              req.add(API_URL_ISV_LIST, that.saveObject).then(res => {
                that.$message.success('新增成功')
                that.visible = false
                that.callbackFunc() // 刷新列表
                that.btnLoading = false
              }).catch(res => {
                that.btnLoading = false
              })
            } else {
              req.updateById(API_URL_ISV_LIST, that.recordId, that.saveObject).then(res => {
                that.$message.success('修改成功')
                that.visible = false
                that.callbackFunc() // 刷新列表
                that.btnLoading = false
              }).catch(res => {
                that.btnLoading = false
              })
            }
          }
        })
    },
    onClose () {
      this.visible = false
    },
    searchFunc: function () { // 点击【查询】按钮点击事件
      this.$refs.infoTable.refTable(true)
    }
  }
}
</script>
