<!-- 订单详情抽屉 -->
<template>
  <a-drawer
    width="50%"
    placement="right"
    :closable="true"
    v-model:open="vdata.isShow"
    title="转账订单详情"
    @close="vdata.isShow = false"
  >
    <a-row justify="space-between" type="flex">
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="商户类型">
            {{
              vdata.detailData.mchType === 1
                ? '普通商户'
                : vdata.detailData.mchType === 2
                  ? '特约商户'
                  : '未知'
            }}
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
          <a-descriptions-item label="商户名称">{{ vdata.detailData.mchName }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="应用APPID">{{ vdata.detailData.appId }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="服务商号">{{ vdata.detailData.isvNo }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="转账订单号">
            <a-tag color="purple">{{ vdata.detailData.transferId }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-col>

      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="商户转账单号">
            {{ vdata.detailData.mchOrderNo }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="渠道订单号">
            {{ vdata.detailData.channelOrderNo }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>

      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="金额">
            <a-tag color="green">{{ vdata.detailData.amount / 100 }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="货币代码">
            {{ vdata.detailData.currency }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="收款账号">
            <a-tag color="green">{{ vdata.detailData.accountNo }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="收款人姓名">
            {{ vdata.detailData.accountName }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="转账备注">
            {{ vdata.detailData.transferDesc }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="订单状态">
            <a-tag
              :color="
                vdata.detailData.state === 0
                  ? 'blue'
                  : vdata.detailData.state === 1
                    ? 'orange'
                    : vdata.detailData.state === 2
                      ? 'green'
                      : 'volcano'
              "
            >
              {{
                vdata.detailData.state === 0
                  ? '订单生成'
                  : vdata.detailData.state === 1
                    ? '转账中'
                    : vdata.detailData.state === 2
                      ? '转账成功'
                      : vdata.detailData.state === 3
                        ? '转账失败'
                        : vdata.detailData.state === 4
                          ? '任务关闭'
                          : '未知'
              }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="转账成功时间">
            {{ vdata.detailData.successTime }}
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
      <a-divider />
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="接口代码">{{ vdata.detailData.ifCode }}</a-descriptions-item>
        </a-descriptions>
      </a-col>

      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="入账类型">
            {{ vdata.detailData.entryType }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="12">
        <a-descriptions>
          <a-descriptions-item label="客户端IP">
            {{ vdata.detailData.clientIp }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col :sm="24">
        <a-descriptions>
          <a-descriptions-item label="异步通知地址">
            {{ vdata.detailData.notifyUrl }}
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
    </a-row>
    <a-divider />
    <a-col :sm="12">
      <a-descriptions>
        <a-descriptions-item label="渠道订单号">
          {{ vdata.detailData.channelOrderNo }}
        </a-descriptions-item>
      </a-descriptions>
    </a-col>
    <a-col :sm="12">
      <a-descriptions>
        <a-descriptions-item label="渠道错误码">{{ vdata.detailData.errCode }}</a-descriptions-item>
      </a-descriptions>
    </a-col>
    <a-col :sm="12">
      <a-descriptions>
        <a-descriptions-item label="渠道错误描述">
          {{ vdata.detailData.errMsg }}
        </a-descriptions-item>
      </a-descriptions>
    </a-col>
    <a-form layout="vertical">
      <a-col :sm="24">
        <a-form-item label="渠道额外参数:">
          <a-textarea
            disabled="disabled"
            style="height: 100px; color: black"
            v-model:value="vdata.detailData.channelExtra"
          />
        </a-form-item>
      </a-col>
      <a-divider />
      <a-col :sm="24">
        <a-form-item label="扩展参数:">
          <a-textarea
            disabled="disabled"
            style="height: 100px; color: black"
            v-model:value="vdata.detailData.extParam"
          />
        </a-form-item>
      </a-col>
    </a-form>
  </a-drawer>
</template>
<script setup lang="ts">
import { API_URL_TRANSFER_ORDER_LIST, req } from '@/api/manage'
import { reactive } from 'vue'

const vdata: any = reactive({
  detailData: {},
  isShow: false, // 是否显示弹层/抽屉
  recordId: null, // 更新对象ID
})

function show(recordId) {
  req.getById(API_URL_TRANSFER_ORDER_LIST, recordId).then((res) => {
    vdata.detailData = res
  })
  vdata.isShow = true
}

defineExpose({ show })
</script>
