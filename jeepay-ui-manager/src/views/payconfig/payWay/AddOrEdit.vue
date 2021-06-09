<template>
  <a-modal v-model="isShow" :title=" isAdd ? '新增支付方式' : '修改支付方式' " @ok="handleOkFunc">
    <a-form-model ref="infoFormModel" :model="saveObject" :label-col="{span: 6}" :wrapper-col="{span: 15}" :rules="rules">
      <a-form-model-item label="支付方式代码：" prop="wayCode">
        <a-input v-model="saveObject.wayCode" :disabled="!isAdd" />
      </a-form-model-item>
      <a-form-model-item label="支付方式名称：" prop="wayName">
        <a-input v-model="saveObject.wayName" />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>
<script>
import { API_URL_PAYWAYS_LIST, req } from '@/api/manage'
export default {
  props: {
    callbackFunc: { type: Function, default: () => () => ({}) }
  },

  data () {
    return {
      isAdd: true, // 新增 or 修改页面标志
      isShow: false, // 是否显示弹层/抽屉
      saveObject: {}, // 数据对象
      wayCode: null, // 更新对象ID
      rules: {
        wayCode: [
          { required: true, message: '请输入支付方式代码', trigger: 'blur' }
        ],
        wayName: [
          { required: true, message: '请输入支付方式名称', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    show: function (wayCode) { // 弹层打开事件
      this.isAdd = !wayCode
      this.saveObject = {} // 数据清空

      if (this.$refs.infoFormModel !== undefined) {
        this.$refs.infoFormModel.resetFields()
      }

      const that = this
      if (!this.isAdd) { // 修改信息 延迟展示弹层
        that.wayCode = wayCode
        req.getById(API_URL_PAYWAYS_LIST, wayCode).then(res => { that.saveObject = res })
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

            if (that.isAdd) {
              req.add(API_URL_PAYWAYS_LIST, that.saveObject).then(res => {
                that.$message.success('新增成功')
                that.isShow = false
                that.callbackFunc() // 刷新列表
              })
            } else {
              req.updateById(API_URL_PAYWAYS_LIST, that.wayCode, that.saveObject).then(res => {
                that.$message.success('修改成功')
                that.isShow = false
                that.callbackFunc() // 刷新列表
              })
            }
          }
        })
    }

  }
}
</script>
