<template>
  <a-modal v-model="isShow" :title=" isAdd ? '新增菜单' : '修改菜单' " @ok="handleOkFunc" :confirmLoading="confirmLoading">

    <a-form-model ref="infoFormModel" :model="saveObject" :label-col="{span: 6}" :wrapper-col="{span: 15}" :rules="rules">

      <a-form-model-item label="组名称：" prop="receiverGroupName">
        <a-input v-model="saveObject.receiverGroupName" />
      </a-form-model-item>

      <a-form-model-item label="自动分账组" prop="autoDivisionFlag">
        <a-radio-group v-model="saveObject.autoDivisionFlag">
          <a-radio :value="1">是</a-radio> <a-radio :value="0">否</a-radio>
        </a-radio-group>
        <hr/>
        <p style="color: indianred">1. 自动分账组: 当订单分账模式为自动分账，该组下的所有正常分账状态的账号将作为订单分账对象</p>
        <p style="color: indianred">2. 每个商户仅有一个默认分账组， 当该组更新为自动分账时，其他组将改为否</p>
      </a-form-model-item>
    </a-form-model>

  </a-modal>

</template>

<script>
import { API_URL_DIVISION_RECEIVER_GROUP, req } from '@/api/manage'
export default {

  props: {
    callbackFunc: { type: Function }
  },

  data () {
    return {
      confirmLoading: false, // 显示确定按钮loading图标
      isAdd: true, // 新增 or 修改页面标识
      isShow: false, // 是否显示弹层/抽屉
      saveObject: { autoDivisionFlag: 0 }, // 数据对象
      recordId: null, // 更新对象ID
      rules: {
        receiverGroupName: [
          { required: true, message: '请输入组名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
  },
  methods: {
    show: function (recordId) { // 弹层打开事件
      this.isAdd = !recordId
      this.saveObject = { autoDivisionFlag: 0 } // 数据清空
      this.confirmLoading = false // 关闭loading

      if (this.$refs.infoFormModel !== undefined) {
        this.$refs.infoFormModel.resetFields()
      }

      const that = this
      if (!this.isAdd) { // 修改信息 延迟展示弹层
        that.recordId = recordId
        req.getById(API_URL_DIVISION_RECEIVER_GROUP, recordId).then(res => {
          that.saveObject = res
          that.isShow = true
        })
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
            req.add(API_URL_DIVISION_RECEIVER_GROUP, that.saveObject).then(res => {
              that.$message.success('添加成功')
              that.isShow = false
              that.callbackFunc() // 刷新列表
            }).catch(res => { that.confirmLoading = false })
          } else {
            req.updateById(API_URL_DIVISION_RECEIVER_GROUP, that.recordId, that.saveObject).then(res => {
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
