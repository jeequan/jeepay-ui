<!-- 订单详情抽屉 -->
<template>
  <a-drawer
      width="50%"
      placement="right"
      :closable="true"
      :visible="isShow"
      title="转账订单详情"
      @close="isShow = false"
  >
    <a-row justify="space-between" type="flex">
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="商户类型">
            {{ detailData.mchType === 1?'普通商户':detailData.mchType === 2?'特约商户':'未知' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="商户号">{{ detailData.mchNo }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="商户名称">{{ detailData.mchName }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="应用APPID">{{ detailData.appId }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="服务商号">{{ detailData.isvNo }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="转账订单号">
            <a-tag color="purple">{{ detailData.transferId }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-col>

      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="商户转账单号">{{ detailData.mchOrderNo }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="渠道订单号">{{ detailData.channelOrderNo }}</a-descriptions-item>
        </a-descriptions>
      </a-col>

      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="金额">
            <a-tag color="green">{{ detailData.amount/100 }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="货币代码">{{ detailData.currency }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="收款账号">
            <a-tag color="green">{{ detailData.accountNo }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="收款人姓名">{{ detailData.accountName }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="转账备注">{{ detailData.transferDesc }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="订单状态">
            <a-tag :color="detailData.state === 0?'blue':detailData.state === 1?'orange':detailData.state === 2?'green':'volcano'">
              {{ detailData.state === 0?'订单生成':detailData.state === 1?'转账中':detailData.state === 2?'转账成功':detailData.state === 3?'转账失败':detailData.state === 4?'任务关闭':'未知' }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="转账成功时间">{{ detailData.successTime }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="创建时间">{{ detailData.createdAt }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="更新时间">{{ detailData.updatedAt }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-divider />
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="接口代码">{{ detailData.ifCode }}</a-descriptions-item>
        </a-descriptions>
      </a-col>

      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="入账类型">{{ detailData.entryType }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="客户端IP">{{ detailData.clientIp }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="24">
        <a-descriptions>
          <a-descriptions-item label="异步通知地址">{{ detailData.notifyUrl }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
    </a-row>
    <a-divider />
    <a-col :sm="12">
      <a-descriptions>
        <a-descriptions-item label="渠道订单号">{{ detailData.channelOrderNo }}</a-descriptions-item>
      </a-descriptions>
    </a-col>
    <a-col :sm="12">
      <a-descriptions>
        <a-descriptions-item label="渠道错误码">{{ detailData.errCode }}</a-descriptions-item>
      </a-descriptions>
    </a-col>
    <a-col :sm="12">
      <a-descriptions>
        <a-descriptions-item label="渠道错误描述">{{ detailData.errMsg }}</a-descriptions-item>
      </a-descriptions>
    </a-col>
    <a-col :sm="24">
      <a-form-model-item label="渠道额外参数">
        <a-input
            type="textarea"
            disabled="disabled"
            style="height: 100px;color: black"
            v-model="detailData.channelExtra"
        />
      </a-form-model-item>
    </a-col>
    <a-divider />
    <a-col :sm="24">
      <a-form-model-item label="扩展参数">
        <a-input
            type="textarea"
            disabled="disabled"
            style="height: 100px;color: black"
            v-model="detailData.extParam"
        />
      </a-form-model-item>
    </a-col>
  </a-drawer>
</template>
<script>
  import { API_URL_TRANSFER_ORDER_LIST, req } from '@/api/manage'

  export default {
    data () {
      return {
        detailData: {},
        isShow: false, // 是否显示弹层/抽屉
        recordId: null // 更新对象ID
      }
    },
    methods: {
      show: function (recordId) {
        const that = this
        req.getById(API_URL_TRANSFER_ORDER_LIST, recordId).then(res => {
          that.detailData = res
        })
        this.isShow = true
      }
    }
  }
</script>
