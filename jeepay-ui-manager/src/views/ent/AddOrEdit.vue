<template>
  <a-modal v-model="isShow" :title=" isAdd ? '新增菜单' : '修改菜单' " @ok="handleOkFunc" :confirmLoading="confirmLoading">

    <a-form-model ref="infoFormModel" :model="saveObject" :label-col="{span: 6}" :wrapper-col="{span: 15}" :rules="rules">

      <a-form-model-item label="资源名称：" prop="entName">
        <a-input v-model="saveObject.entName" />
      </a-form-model-item>

      <a-form-model-item label="路径地址：" prop="menuUri">
        <a-input v-model="saveObject.menuUri" />
      </a-form-model-item>

      <a-form-model-item label="排序（正序显示）：" prop="entSort">
        <a-input v-model="saveObject.entSort" />
      </a-form-model-item>

      <a-form-model-item label="快速开始：" prop="quickJump">
        <a-radio-group v-model="saveObject.quickJump" :disabled="saveObject.menuType == 'PB' || !saveObject.menuUri">
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

    </a-form-model>

  </a-modal>

</template>

<script>
import { API_URL_ENT_LIST, req, getEntBySysType } from '@/api/manage'
export default {

  props: {
    callbackFunc: { type: Function }
  },

  data () {
    return {
      confirmLoading: false, // 显示确定按钮loading图标
      isAdd: true, // 新增 or 修改页面标识
      isShow: false, // 是否显示弹层/抽屉
      saveObject: {}, // 数据对象
      recordId: null, // 更新对象ID
      sysType: 'MGR', // 菜单类型
      rules: {
        entName: [
          { required: true, message: '请输入资源名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
  },
  methods: {
    show: function (recordId, sysType) { // 弹层打开事件
      this.isAdd = !recordId
      this.sysType = sysType
      this.saveObject = {} // 数据清空
      this.confirmLoading = false // 关闭loading

      if (this.$refs.infoFormModel !== undefined) {
        this.$refs.infoFormModel.resetFields()
      }

      const that = this
      if (!this.isAdd) { // 修改信息 延迟展示弹层
        that.recordId = recordId
        getEntBySysType(recordId, sysType).then(res => { that.saveObject = res })
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

            that.confirmLoading = true // 显示loading

            if (that.isAdd) {
            } else {
              req.updateById(API_URL_ENT_LIST, that.recordId, that.saveObject).then(res => {
                that.$message.success('修改成功')
                that.isShow = false
                that.callbackFunc() // 刷新列表
              }).catch(res => { that.confirmLoading = false })
            }
          }
        })
    }
  }
}
</script>
