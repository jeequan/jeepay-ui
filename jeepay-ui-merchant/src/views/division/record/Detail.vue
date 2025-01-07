<!-- 详情抽屉 -->
<template>
  <a-drawer
    width="50%"
    :closable="true"
    v-model:open="vdata.visible"
    title="记录详情"
    @close="vdata.visible = false"
  >
    <a-row justify="space-between" type="flex">
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="分账记录ID">
            {{ vdata.detailData.recordId }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="商户号">{{ vdata.detailData.mchNo }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="应用ID">{{ vdata.detailData.appId }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="支付接口代码">
            {{ vdata.detailData.ifCode }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="系统支付订单号">
            {{ vdata.detailData.payOrderId }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="支付订单渠道支付订单号">
            {{ vdata.detailData.payOrderChannelOrderNo }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="订单金额">
            {{ vdata.detailData.payOrderAmount / 100 }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="分账基数">
            {{ vdata.detailData.payOrderDivisionAmount / 100 }} （订单金额-手续费-退款金额）
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="系统分账批次号">
            {{ vdata.detailData.batchOrderId }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="上游分账批次号">
            {{ vdata.detailData.channelBatchOrderId }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="状态">
            <a-tag v-if="vdata.detailData.state === 0" :key="vdata.detailData.state" color="orange">
              分账中
            </a-tag>
            <a-tag v-if="vdata.detailData.state === 1" :key="vdata.detailData.state" color="blue">
              分账成功
            </a-tag>
            <a-tag
              v-if="vdata.detailData.state === 2"
              :key="vdata.detailData.state"
              color="volcano"
            >
              分账失败
            </a-tag>
            <a-tag v-if="vdata.detailData.state === 3" :key="vdata.detailData.state" color="purple">
              已受理
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="分账接收者ID">
            {{ vdata.detailData.receiverId }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="收款账号组ID">
            {{ vdata.detailData.receiverGroupId }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="收款账号别名">
            {{ vdata.detailData.receiverAlias }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="分账接收账号类型">
            {{ vdata.detailData.accType == 0 ? '个人' : '商户' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="分账接收账号">
            {{ vdata.detailData.accNo }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="分账接收账号名称">
            {{ vdata.detailData.accName }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="分账关系类型">
            {{ vdata.detailData.relationType }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="分账关系类型名称">
            {{ vdata.detailData.relationTypeName }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="实际分账比例">
            {{ (vdata.detailData.divisionProfit * 100).toFixed(2) }}%
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="分账金额">
            {{ vdata.detailData.calDivisionAmount / 100 }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="创建时间">
            {{ vdata.detailData.createdAt }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="更新时间">
            {{ vdata.detailData.updatedAt }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
    </a-row>
    <a-divider />
    <a-row justify="start" type="flex">
      <a-col :sm="24">
        <a-form-item label="上游返回数据包">
          <a-textarea
            disabled="disabled"
            style="height: 100px; color: black"
            v-model="vdata.detailData.channelRespResult"
          />
        </a-form-item>
      </a-col>
    </a-row>
  </a-drawer>
</template>
<script lang="ts" setup>
import { API_URL_PAY_ORDER_DIVISION_RECORD_LIST, req } from '@/api/manage'
import { reactive } from 'vue'

const vdata: any = reactive({
  visible: false,
  detailData: {},
})

function show(recordId) {
  req.getById(API_URL_PAY_ORDER_DIVISION_RECORD_LIST, recordId).then((res) => {
    vdata.detailData = res
  })
  vdata.visible = true
}

defineExpose({ show })
</script>
