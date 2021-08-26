<!-- 详情抽屉 -->
<template>
  <a-drawer
    width="50%"
    :closable="true"
    :visible="visible"
    title="记录详情"
    @close="visible = false"
  >
    <a-row justify="space-between" type="flex">
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="分账记录ID">{{ detailData.recordId }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="商户号">{{ detailData.mchNo }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="应用ID">{{ detailData.appId }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="支付接口代码">{{ detailData.ifCode }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="系统支付订单号">{{ detailData.payOrderId }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="支付订单渠道支付订单号">{{ detailData.payOrderChannelOrderNo }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="订单金额">{{ detailData.payOrderAmount / 100}}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="待计算分账金额">{{ detailData.payOrderDivisionAmount / 100 }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="系统分账批次号">{{ detailData.batchOrderId }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="上游分账批次号">{{ detailData.channelBatchOrderId }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="状态">
        <a-tag :key="detailData.state" :color="detailData.state === 0?'orange':detailData.state === 1?'blue':detailData.state === 2?'volcano':'volcano'">
          {{ detailData.state === 0?'分账中':detailData.state === 1?'分账成功':detailData.state === 2?'分账失败' : '未知' }}
        </a-tag>
      </a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="分账接收者ID">{{ detailData.receiverId }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="收款账号组ID">{{ detailData.receiverGroupId }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="收款账号别名">{{ detailData.receiverAlias }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="分账接收账号类型">{{ detailData.accType == 0 ? '个人' : '商户' }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="分账接收账号">{{ detailData.accNo }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="分账接收账号名称">{{ detailData.accName }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="分账关系类型">{{ detailData.relationType }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="分账关系类型名称">{{ detailData.relationTypeName }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="实际分账比例">{{ (detailData.divisionProfit * 100).toFixed(2) }}%</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="分账金额">{{ detailData.calDivisionAmount / 100 }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="创建时间">{{ detailData.createdAt }}</a-descriptions-item></a-descriptions></a-col>
      <a-col :sm="12"><a-descriptions><a-descriptions-item label="更新时间">{{ detailData.updatedAt }}</a-descriptions-item></a-descriptions></a-col>
    </a-row>
    <a-divider />
    <a-row justify="start" type="flex">
      <a-col :sm="24">
        <a-form-model-item label="上游返回数据包">
          <a-input type="textarea" disabled="disabled" style="height: 100px;color: black" v-model="detailData.channelRespResult"/>
        </a-form-model-item>
      </a-col>
    </a-row>
  </a-drawer>
</template>
<script>
import { API_URL_PAY_ORDER_DIVISION_RECORD_LIST, req } from '@/api/manage'

export default {
  data () {
    return {
      visible: false,
      detailData: {}
    }
  },
  methods: {
    show: function (recordId) {
      const that = this
      req.getById(API_URL_PAY_ORDER_DIVISION_RECORD_LIST, recordId).then(res => {
        that.detailData = res
      })
      this.visible = true
    }
  }
}
</script>
