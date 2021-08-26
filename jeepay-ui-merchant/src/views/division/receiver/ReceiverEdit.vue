<template>
  <a-drawer :visible="isShow" title="修改分账用户信息" width="30%" :maskClosable="false" @close="isShow = false">

    <a-form-model ref="infoFormModel" :model="saveObject" :label-col="{span: 6}" :wrapper-col="{span: 15}" :rules="rules">

      <a-form-model-item label="账号别名：" prop="receiverAlias">
        <a-input v-model="saveObject.receiverAlias" />
      </a-form-model-item>

      <a-form-model-item label="默认分账比例：" prop="divisionProfit">
        <a-input v-model="saveObject.divisionProfit" style="width: 100px" /> %
      </a-form-model-item>

      <a-form-model-item label="状态" prop="state">
        <a-radio-group v-model="saveObject.state">
          <a-radio :value="1">正常分账</a-radio> <a-radio :value="0">暂停分账</a-radio>
        </a-radio-group>
      </a-form-model-item>

      <a-form-model-item label="分组变更：" prop="receiverGroupId">
        <a-select style="width: 210px" placeholder="账号分组" v-model="saveObject.receiverGroupId">
          <a-select-option v-for="(item) in allReceiverGroup" :key="item.receiverGroupId" :value="item.receiverGroupId">{{ item.receiverGroupName }}</a-select-option>
        </a-select>
      </a-form-model-item>

    </a-form-model>

    <div class="drawer-btn-center">
      <a-button :style="{ marginRight: '8px' }" @click="isShow = false" icon="close">取消</a-button>
      <a-button type="primary" @click="handleOkFunc" :loading="confirmLoading" icon="check">保存</a-button>
    </div>

  </a-drawer>

</template>

<script>
import { API_URL_DIVISION_RECEIVER, API_URL_DIVISION_RECEIVER_GROUP, req } from '@/api/manage'
export default {
  props: {
    callbackFunc: { type: Function }
  },

  data () {
    return {
      confirmLoading: false, // 显示确定按钮loading图标
      isShow: false, // 是否显示弹层/抽屉
      saveObject: {}, // 数据对象
      recordId: null, // 更新对象ID
      allReceiverGroup: [], // 当前商户所有的接收账号的分组情况
      rules: {
        receiverAlias: [{ required: true, message: '请输入别名', trigger: 'blur' }],
        receiverGroupId: [{ required: true, message: '请选择分组', trigger: 'blur' }],
        divisionProfit: [{ required: true, message: '请录入默认分账比例', trigger: 'blur' }],
        state: [{ required: true, message: '请选择状态', trigger: 'blur' }]
      }
    }
  },
  created () {
  },
  methods: {
    show: function (recordId) { // 弹层打开事件
      this.saveObject = {} // 数据清空
      this.confirmLoading = false // 关闭loading

      if (this.$refs.infoFormModel !== undefined) {
        this.$refs.infoFormModel.resetFields()
      }

      const that = this

      that.recordId = recordId

      // 查询账号信息
      req.getById(API_URL_DIVISION_RECEIVER, recordId).then(res => {
        res.divisionProfit = (res.divisionProfit * 100).toFixed(2)
        that.saveObject = res
      })

      // 请求接口，获取所有分组信息，只有此处进行pageSize=-1传参
      req.list(API_URL_DIVISION_RECEIVER_GROUP, { pageSize: -1 }).then(res => { that.allReceiverGroup = res.records })

      this.isShow = true
    },

    handleOkFunc: function () { // 点击【确认】按钮事件
        const that = this
        this.$refs.infoFormModel.validate(valid => {
          if (valid) { // 验证通过
            that.confirmLoading = true // 显示loading

            var reqObject = {
              receiverAlias: that.saveObject.receiverAlias,
              receiverGroupId: that.saveObject.receiverGroupId,
              divisionProfit: that.saveObject.divisionProfit,
              state: that.saveObject.state
            }

            req.updateById(API_URL_DIVISION_RECEIVER, that.recordId, reqObject).then(res => {
              that.$message.success('修改成功')
              that.isShow = false
              that.callbackFunc() // 刷新列表
            }).catch(res => { that.confirmLoading = false })
          }
        })
    }
  }
}
</script>
