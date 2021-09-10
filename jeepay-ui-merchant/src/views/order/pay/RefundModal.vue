<template>
  <div>
    <a-modal
      title="退款"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
      :closable="false"
    >
      <a-row>
        <a-col :sm="24">
          <a-descriptions>
            <a-descriptions-item label="支付订单号">
              <a-tag color="purple">
                {{ detailData.payOrderId }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
        <a-col :sm="24">
          <a-descriptions>
            <a-descriptions-item label="支付金额">
              <a-tag color="green">
                {{ detailData.amount/100 }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
        <a-col :sm="24">
          <a-descriptions>
            <a-descriptions-item label="可退金额">
              <a-tag color="pink">
                {{ nowRefundAmount }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
      </a-row>

      <a-form-model :rules="rules" :model="refund" ref="refundInfo" >

        <a-form-model-item label="退款金额" prop="refundAmount">
          <a-input-number v-model="refund.refundAmount" :precision="2" style="width:100%"/>
        </a-form-model-item>

        <a-form-model-item label="退款原因" prop="refundReason">
          <a-input v-model="refund.refundReason" type="textarea" />
        </a-form-model-item>

      </a-form-model>

    </a-modal>
  </div>
</template>
<script>
import { API_URL_PAY_ORDER_LIST, req, payOrderRefund } from '@/api/manage'
export default {

  props: {
    callbackFunc: { type: Function, default: () => () => ({}) }
  },

  data () {
    return {
      recordId: '',
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
      visible: false,
      confirmLoading: false,
      detailData: {
      },
      refund: {
        // refundReason: '', // 退款原因
        // refundAmount: '' // 退款金额
      },
      rules: {
        refundReason: [{ min: 0, max: 256, required: true, trigger: 'blur', message: '请输入退款原因，最长不超过256个字符' }],
        refundAmount: [{ required: true, message: '请输入金额', trigger: 'blur' },
         {
            validator: (rule, value, callBack) => {
								if (value < 0.01 || value > this.nowRefundAmount) {
									callBack('退款金额不能小于0.01，或者大于可退金额')
								}
							callBack()
						}
         }]
      }
    }
  },
  computed: {
    nowRefundAmount () {
      return (this.detailData.amount - this.detailData.refundAmount) / 100
    }
  },
  methods: {
    show (recordId) {
      if (this.$refs.refundInfo !== undefined) {
					this.$refs.refundInfo.resetFields()
			}
      this.recordId = recordId
      this.visible = true
      this.refund = {}
      const that = this
      req.getById(API_URL_PAY_ORDER_LIST, recordId).then(res => {
        that.detailData = res
      })
    },
    handleOk (e) {
      this.$refs.refundInfo.validate(valid => {
				if (valid) {
          this.confirmLoading = true
          const that = this
          // 退款接口
          payOrderRefund(that.recordId, that.refund.refundAmount, that.refund.refundReason).then(res => {
              that.visible = false // 关闭弹窗
              that.confirmLoading = false // 取消按钮转圈

            if (res.state === 0 || res.state === 3) { // 订单生成 || 失败
              const refundErrorModal = that.$infoBox.modalError('退款失败', (h) => that.buildModalText(res, h, () => { refundErrorModal.destroy() }))
            } else if (res.state === 1) { // 退款中
              const refundErrorModal = that.$infoBox.modalWarning('退款中', (h) => that.buildModalText(res, h, () => { refundErrorModal.destroy() }))
              that.callbackFunc()
            } else if (res.state === 2) { // 退款成功
              that.$message.success('退款成功')
              that.callbackFunc()
            } else {
              const refundErrorModal = that.$infoBox.modalWarning('退款状态未知', (h) => that.buildModalText(res, h, () => { refundErrorModal.destroy() }))
            }
          }).catch(() => {
            that.confirmLoading = false // 取消按钮转圈
          })
        }
      })
    },
    handleCancel (e) {
      this.visible = false
    },

    buildModalText (res, h, callbackFunc) {
      // 跳转退款列表Btn
      const toRefundPageBtn = h('a', { on: { click: () => {
            callbackFunc()
            this.$router.push({ name: 'ENT_REFUND_ORDER' })
          } } })
      toRefundPageBtn.text = '退款列表'
      return h('div', [
        h('div', res.errCode ? `错误码：${res.errCode}` : ''),
        h('div', res.errMsg ? `错误信息：${res.errMsg}` : ''),
        h('div', [h('span', '请到'), toRefundPageBtn, h('span', '中查看详细信息')])
      ])
    }

  }
}
</script>

<style scoped lang="less">

</style>
