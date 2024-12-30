<template>
  <page-header-wrapper>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline" class="table-head-ground">
          <div class="table-layer">
            <a-range-picker
              class="table-head-layout"
              @change="onChange"
              :show-time="{ format: 'HH:mm:ss' }"
              format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="disabledDate"
            >
              <a-icon slot="suffixIcon" type="sync" />
            </a-range-picker>
            <jeepay-text-up :placeholder="'订单ID'" v-model:value="vdata.searchData.orderId" />
            <jeepay-text-up
              :placeholder="'商户订单号'"
              v-model:value="vdata.searchData.mchOrderNo"
            />
            <jeepay-text-up :placeholder="'商户号'" v-model:value="vdata.searchData.mchNo" />
            <jeepay-text-up :placeholder="'服务商号'" v-model:value="vdata.searchData.isvNo" />
            <jeepay-text-up :placeholder="'应用AppId'" v-model:value="vdata.searchData.appId" />
            <a-select
              v-model:value="vdata.searchData.state"
              placeholder="通知状态"
              class="table-head-layout"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="1">通知中</a-select-option>
              <a-select-option value="2">通知成功</a-select-option>
              <a-select-option value="3">通知失败</a-select-option>
            </a-select>
            <a-select
              v-model:value="vdata.searchData.orderType"
              placeholder="订单类型"
              class="table-head-layout"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="1">支付</a-select-option>
              <a-select-option value="2">退款</a-select-option>
              <a-select-option value="3">转账</a-select-option>
            </a-select>

            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="queryFunc" :loading="vdata.btnLoading">
                搜索
              </a-button>
              <a-button style="margin-left: 8px" @click="() => (vdata.searchData = {})">
                重置
              </a-button>
            </span>
          </div>
        </a-form>
      </div>

      <!-- 列表渲染 -->
      <JeepayTable
        @btnLoadClose="vdata.btnLoading = false"
        ref="infoTable"
        :closable="true"
        :initData="true"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="tableColumns"
        :searchData="vdata.searchData"
        :rowSelection="rowSelection"
        rowKey="orderId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'state'">
            <a-tag
              :key="record.orderId"
              :color="record.state === 1 ? 'orange' : record.state === 2 ? 'green' : 'volcano'"
            >
              <template v-if="record.state == 1">通知中</template>
              <template v-else-if="record.state == 2">通知成功</template>
              <template v-else-if="record.state == 3">通知失败</template>
              <template v-else>未知</template>
            </a-tag>
          </template>
          <template v-if="column.key === 'orderType'">
            <a-tag v-if="record.orderType == 1" color="green">支付</a-tag>
            <a-tag v-else-if="record.orderType == 1" color="volcano">退款</a-tag>
            <a-tag v-else-if="record.orderType == 1" color="blue">转账</a-tag>
            <a-tag v-else color="orange">未知</a-tag>
          </template>
          <template v-if="column.key === 'op'">
            <!-- 操作列插槽 -->
            <JeepayTableColumns>
              <a-button
                type="link"
                v-if="$access('ENT_MCH_NOTIFY_VIEW')"
                @click="detailFunc(record.notifyId)"
              >
                详情
              </a-button>
              <a-button
                type="link"
                v-if="$access('ENT_MCH_NOTIFY_RESEND') && record.state === 3"
                @click="resendFunc(record.notifyId)"
              >
                重发通知
              </a-button>
            </JeepayTableColumns>
          </template>
        </template>
      </JeepayTable>
    </a-card>
    <!-- 日志详情抽屉 -->
    <template>
      <a-drawer
        width="40%"
        placement="right"
        :closable="true"
        v-model:open="vdata.open"
        :title="vdata.open === true ? '商户通知详情' : ''"
        @close="onClose"
      >
        <a-row justify="space-between" type="flex">
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="订单ID">
                <a-tag color="purple">
                  {{ vdata.detailData.orderId }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="服务商号">
                {{ vdata.detailData.isvNo }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="商户订单号">
                {{ vdata.detailData.mchOrderNo }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="商户号">
                {{ vdata.detailData.mchNo }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="订单类型">
                <a-tag v-if="vdata.detailData.orderType == 1" color="green">支付</a-tag>
                <a-tag v-else-if="vdata.detailData.orderType == 1" color="volcano">退款</a-tag>
                <a-tag v-else-if="vdata.detailData.orderType == 1" color="blue">转账</a-tag>
                <a-tag v-else color="orange">未知</a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="应用APPID">
                {{ vdata.detailData.appId }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="通知状态">
                <a-tag v-if="vdata.detailData.state == 1" color="orange">通知中</a-tag>
                <a-tag v-else-if="vdata.detailData.state == 2" color="green">通知成功</a-tag>
                <a-tag v-else-if="vdata.detailData.state == 3" color="volcano">通知失败</a-tag>
                <a-tag v-else color="volcano">未知</a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="通知次数">
                {{ vdata.detailData.notifyCount }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="24">
            <a-descriptions>
              <a-descriptions-item label="最后通知时间">
                {{ vdata.detailData.lastNotifyTime }}
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
          <a-col :sm="24">
            <a-form-item label="通知地址">
              <a-input
                type="textarea"
                disabled="disabled"
                style="height: 100px; color: black"
                v-model:value="vdata.detailData.notifyUrl"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24">
            <a-form-item label="响应结果">
              <a-input
                type="textarea"
                disabled="disabled"
                style="height: 100px; color: black"
                v-model:value="vdata.detailData.resResult"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-drawer>
    </template>
  </page-header-wrapper>
</template>
<script setup lang="ts">
import { API_URL_MCH_NOTIFY_LIST, req, mchNotifyResend } from '@/api/manage'
import moment from 'moment'
import { reactive, computed, ref, getCurrentInstance } from 'vue'
const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  { key: 'orderId', title: '订单ID', fixed: 'left', dataIndex: 'orderId' },
  { key: 'mchOrderNo', title: '商户订单号', dataIndex: 'mchOrderNo' },
  { key: 'state', title: '通知状态', width: '130px', scopedSlots: { customRender: 'stateSlot' } },
  {
    key: 'orderType',
    title: '订单类型',
    width: '130px',
    scopedSlots: { customRender: 'orderTypeSlot' },
  },
  { key: 'createdAt', dataIndex: 'createdAt', title: '创建日期' },
  {
    key: 'op',
    title: '操作',
    fixed: 'right',
    align: 'center',
    scopedSlots: { customRender: 'opSlot' },
  },
]

const vdata: any = reactive({
  btnLoading: true,
  tableColumns: tableColumns,
  searchData: {},
  selectedIds: [], // 选中的数据
  createdStart: '', // 选择开始时间
  createdEnd: '', // 选择结束时间
  open: false,
  detailData: {},
  moment,
})

const infoTable = ref()

const rowSelection = computed(() => {
  const that = this
  return {
    onChange: (selectedRowKeys, selectedRows) => {
      vdata.selectedIds = [] // 清空选中数组
      selectedRows.forEach(function (data: any) {
        // 赋值选中参数
        vdata.selectedIds.push(data.payOrderId)
      })
    },
  }
})

function queryFunc() {
  vdata.btnLoading = true
  infoTable.value.refTable(true)
}

// 请求table接口数据
function reqTableDataFunc(params) {
  return req.list(API_URL_MCH_NOTIFY_LIST, params)
}
function searchFunc() {
  // 点击【查询】按钮点击事件
  infoTable.value.refTable(true)
}

function detailFunc(recordId) {
  req.getById(API_URL_MCH_NOTIFY_LIST, recordId).then((res) => {
    vdata.detailData = res
  })
  vdata.open = true
  console.log(vdata.open, 'vdata.open')
}

function onChange(date, dateString) {
  vdata.searchData.createdStart = dateString[0] // 开始时间
  vdata.searchData.createdEnd = dateString[1] // 结束时间
}

function disabledDate(current) {
  // 今日之后日期不可选
  return current && current > moment().endOf('day')
}
function onClose() {
  vdata.open = false
}

function resendFunc(notifyId) {
  // 重发通知
  $infoBox.confirmPrimary('确认重发通知？', '', () => {
    mchNotifyResend(notifyId).then((res) => {
      $infoBox.message.success('任务更新成功，请稍后查看最新状态！')
      searchFunc()
    })
  })
}
</script>
