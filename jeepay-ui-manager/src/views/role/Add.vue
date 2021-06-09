<template>
  <a-modal v-model="isShow" title="新增角色" @ok="handleOkFunc">

    <a-form-model ref="infoFormModel" :model="saveObject" :label-col="{span: 4}" :wrapper-col="{span: 15}" :rules="rules">

      <a-form-model-item label="角色名称：" prop="roleName">
        <a-input v-model="saveObject.roleName" />
      </a-form-model-item>

    </a-form-model>

  </a-modal>

</template>

<script>
import { API_URL_ROLE_LIST, req } from '@/api/manage'
export default {
  props: {
    callbackFunc: { type: Function }
  },

  data () {
    return {
      isShow: false, // 是否显示弹层/抽屉
      saveObject: {}, // 数据对象

      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
  },
  methods: {
    show: function () { // 弹层打开事件
      this.saveObject = {} // 数据清空
      if (this.$refs.infoFormModel !== undefined) {
        this.$refs.infoFormModel.resetFields()
      }
      this.isShow = true
    },

    handleOkFunc: function () { // 点击【确认】按钮事件
        const that = this
        this.$refs.infoFormModel.validate(valid => {
          if (valid) { // 验证通过
            // 请求接口
            req.add(API_URL_ROLE_LIST, that.saveObject).then(res => {
              that.$message.success('新增成功')
              that.isShow = false
              // 刷新列表
              that.callbackFunc()
            })
          }
        })
    }

  }
}
</script>
