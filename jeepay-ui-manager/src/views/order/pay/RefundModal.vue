<template>
  <div>
    <a-modal
      title="退款"
      v-model:open="vdata.open"
      :confirm-loading="vdata.confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
      :closable="false"
    >
      <a-row>
        <a-col :sm="24">
          <a-descriptions>
            <a-descriptions-item label="支付订单号">
              <a-tag color="purple">
                {{ vdata.detailData.payOrderId }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
        <a-col :sm="24">
          <a-descriptions>
            <a-descriptions-item label="支付金额">
              <a-tag color="green">
                {{ vdata.detailData.amount / 100 }}
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

      <a-form :rules="rules" :model="vdata.refund" ref="refundInfo">
        <a-form-item label="退款金额" name="refundAmount">
          <a-input-number
            v-model:value="vdata.refund.refundAmount"
            :precision="2"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="退款原因" name="refundReason">
          <a-textarea v-model:value="vdata.refund.refundReason" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script setup lang="tsx">
import { API_URL_PAY_ORDER_LIST, req, payOrderRefund } from '@/api/manage'
import { reactive, ref, computed, getCurrentInstance, h } from 'vue'
import { useRouter } from 'vue-router'
const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const router = useRouter()

const props = defineProps({
  callbackFunc: { type: Function, default: () => () => ({}) },
})

const refundInfo = ref()

const vdata: any = reactive({
  refundErrorModal: '',
  recordId: '',
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
  open: false,
  confirmLoading: false,
  detailData: {},
  refund: {
    // refundReason: '', // 退款原因
    // refundAmount: '' // 退款金额
  },
})

const rules = reactive({
  refundReason: [
    {
      min: 0,
      max: 256,
      required: true,
      trigger: 'blur',
      message: '请输入退款原因，最长不超过256个字符',
    },
  ],
  refundAmount: [
    { required: true, message: '请输入金额', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value < 0.01 || value > vdata.nowRefundAmount) {
          return Promise.reject('退款金额不能小于0.01，或者大于可退金额')
        }
        return Promise.resolve()
      },
    },
  ],
})

const nowRefundAmount = computed(() => {
  return (vdata.detailData.amount - vdata.detailData.refundAmount) / 100
})

function show(recordId) {
  if (refundInfo.value) {
    refundInfo.value.resetFields()
  }
  vdata.recordId = recordId
  vdata.open = true
  vdata.refund = {}
  req.getById(API_URL_PAY_ORDER_LIST, recordId).then((res) => {
    vdata.detailData = res
  })
}
function handleOk(e) {
  refundInfo.value.validate().then((valid) => {
    if (valid) {
      vdata.confirmLoading = true
      // 退款接口
      payOrderRefund(vdata.recordId, vdata.refund.refundAmount, vdata.refund.refundReason)
        .then((res) => {
          vdata.open = false // 关闭弹窗
          vdata.confirmLoading = false // 取消按钮转圈

          if (res.state === 0 || res.state === 3) {
            // 订单生成 || 失败
            vdata.refundErrorModal = $infoBox.modalError('退款失败', (h) => buildModalText(res))
          } else if (res.state === 1) {
            // 退款中
            vdata.refundErrorModal = $infoBox.modalWarning('退款中', (h) => buildModalText(res))
            props.callbackFunc()
          } else if (res.state === 2) {
            // 退款成功
            $infoBox.message.success('退款成功')
            props.callbackFunc()
          } else {
            vdata.refundErrorModal = $infoBox.modalWarning('退款状态未知', '', (h) =>
              buildModalText(res)
            )
          }
        })
        .catch(() => {
          vdata.confirmLoading = false // 取消按钮转圈
        })
    }
  })
}
function handleCancel(e) {
  vdata.open = false
}

// 跳转到退款列表函数
function toRefundList() {
  vdata.refundErrorModal.destroy()
  router.push({ name: 'ENT_REFUND_ORDER' })
}

function buildModalText(res) {
  return (
    <div>
      {res.errCode ? <div>错误码：{res.errCode} </div> : ''}
      {res.errMsg ? <div>错误信息：{res.errMsg} </div> : ''}
      <div>
        请到<a onClick={toRefundList}>退款列表</a>中查看详细信息
      </div>
    </div>
  )
}

defineExpose({ show })
</script>

<style scoped lang="less"></style>
