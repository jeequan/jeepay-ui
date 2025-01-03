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
            <jeepay-text-up
              placeholder="分账接受者ID"
              v-model:value="vdata.searchData.receiverId"
            />
            <jeepay-text-up
              placeholder="分账账号组ID"
              v-model:value="vdata.searchData.receiverGroupId"
            />
            <jeepay-text-up placeholder="应用AppId" v-model:value="vdata.searchData.appId" />
            <jeepay-text-up placeholder="支付订单号" v-model:value="vdata.searchData.payOrderId" />
            <jeepay-text-up placeholder="分账接收账号" v-model:value="vdata.searchData.accNo" />

            <a-select
              v-model:value="vdata.searchData.state"
              placeholder="分账状态"
              class="table-head-layout"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="0">待分账</a-select-option>
              <a-select-option value="1">分账成功</a-select-option>
              <a-select-option value="2">分账失败</a-select-option>
              <a-select-option value="3">已受理</a-select-option>
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
        :initData="true"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="vdata.tableColumns"
        :searchData="vdata.searchData"
        rowKey="recordId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'calDivisionAmount'">
            <b>￥{{ record.calDivisionAmount / 100 }}</b>
          </template>
          <!-- 自定义插槽 -->
          <template v-if="column.key === 'state'">
            <a-tag v-if="record.state === 0" :key="record.state" color="orange">分账中</a-tag>
            <a-tag v-if="record.state === 1" :key="record.state" color="blue">分账成功</a-tag>
            <a-tag v-if="record.state === 2" :key="record.state" color="volcano">分账失败</a-tag>
            <a-tag v-if="record.state === 3" :key="record.state" color="purple">已受理</a-tag>
          </template>
          <template v-if="column.key === 'op'">
            <!-- 操作列插槽 -->
            <JeepayTableColumns>
              <a-button
                type="link"
                v-if="$access('ENT_DIVISION_RECORD_VIEW')"
                @click="detailFunc(record.recordId)"
              >
                详情
              </a-button>
              <a-button
                type="link"
                v-if="record.state == 2 && $access('ENT_DIVISION_RECORD_RESEND')"
                @click="redivFunc(record.recordId)"
              >
                重试
              </a-button>
            </JeepayTableColumns>
          </template>
        </template>
      </JeepayTable>
    </a-card>

    <Detail ref="recordDetail" />
  </page-header-wrapper>
</template>
<script setup lang="ts">
import { API_URL_PAY_ORDER_DIVISION_RECORD_LIST, req, resendDivision } from '@/api/manage'
import Detail from './Detail.vue'
import { reactive, ref, getCurrentInstance } from 'vue'
import dayjs from 'dayjs'

const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  { key: 'calDivisionAmount', title: '分账金额', scopedSlots: { customRender: 'amountSlot' } },
  { key: 'batchOrderId', title: '分账批次号', dataIndex: 'batchOrderId' },
  { key: 'payOrderId', title: '支付订单号', dataIndex: 'payOrderId' },
  { key: 'ifCode', title: '接口代码', dataIndex: 'ifCode' },
  {
    key: 'payOrderAmount',
    dataIndex: 'payOrderAmount',
    title: '订单金额',
    customRender: ({ text }) => '￥' + (text / 100).toFixed(2),
  },
  {
    key: 'payOrderDivisionAmount',
    dataIndex: 'payOrderDivisionAmount',
    title: '分账基数',
    customRender: ({ text }) => '￥' + (text / 100).toFixed(2),
  },
  { key: 'receiverAlias', title: '账号别名', dataIndex: 'receiverAlias' },
  { key: 'accNo', title: '接收账号', dataIndex: 'accNo' },
  { key: 'accName', title: '账号姓名', dataIndex: 'accName' },
  { key: 'relationTypeName', title: '分账关系类型', dataIndex: 'relationTypeName' },
  {
    key: 'divisionProfit',
    dataIndex: 'divisionProfit',
    title: '分账比例',
    customRender: ({ text }) => (text * 100).toFixed(2) + '%',
  },
  { key: 'state', title: '分账状态', scopedSlots: { customRender: 'stateSlot' } },
  { key: 'createdAt', dataIndex: 'createdAt', title: '创建日期' },
  {
    key: 'op',
    title: '操作',
    width: '100px',
    fixed: 'right',
    align: 'center',
    scopedSlots: { customRender: 'opSlot' },
  },
]

const vdata: any = reactive({
  btnLoading: false,
  tableColumns: tableColumns,
  searchData: {},
  createdStart: '', // 选择开始时间
  createdEnd: '', // 选择结束时间
})

const infoTable = ref()
const recordDetail = ref()

function queryFunc() {
  vdata.btnLoading = true
  infoTable.value.refTable(true)
}
// 请求table接口数据
function reqTableDataFunc(params) {
  return req.list(API_URL_PAY_ORDER_DIVISION_RECORD_LIST, params)
}
function searchFunc() {
  // 点击【查询】按钮点击事件
  infoTable.value.refTable(true)
}
function detailFunc(recordId) {
  recordDetail.value.show(recordId)
}
// 重新发起分账
function redivFunc(recordId) {
  $infoBox.confirmPrimary(
    '确认重新分账?',
    '重新分账将按照订单维度重新发起（仅限分账失败订单）。',
    () => {
      resendDivision(recordId).then((res) => {
        infoTable.value.refTable(false)
        $infoBox.message.warning('请等待接口最新状态')
      })
    }
  )
}
function onChange(date, dateString) {
  vdata.searchData.createdStart = dateString[0] // 开始时间
  vdata.searchData.createdEnd = dateString[1] // 结束时间
}
function disabledDate(current) {
  // 今日之后日期不可选
  return current && current > dayjs().endOf('day')
}
function onClose() {
  vdata.visible = false
}
</script>
