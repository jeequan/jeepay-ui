<template>
  <page-header-wrapper>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline" class="table-head-ground">
          <div class="table-layer">
            <a-range-picker
              v-model:value="vdata.date"
              class="table-head-layout"
              :show-time="{ format: 'HH:mm:ss' }"
              format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="disabledDate"
              @change="onChange"
            >
              <a-icon slot="suffixIcon" type="sync" />
            </a-range-picker>
            <jeepay-text-up
              v-model:value="vdata.searchData.unionOrderId"
              :placeholder="'支付/商户/渠道订单号'"
              :msg="vdata.searchData.unionOrderId"
            />
            <!--            <jeepay-text-up :placeholder="'支付订单号'" :msg="searchData.payOrderId" v-model:value="searchData.payOrderId" />-->
            <!--            <jeepay-text-up :placeholder="'商户订单号'" :msg="searchData.mchOrderNo" v-model:value="searchData.mchOrderNo" />-->
            <jeepay-text-up v-model:value="vdata.searchData.mchNo" :placeholder="'商户号'" />
            <jeepay-text-up v-model:value="vdata.searchData.isvNo" :placeholder="'服务商号'" />
            <jeepay-text-up v-model:value="vdata.searchData.appId" :placeholder="'应用AppId'" />

            <a-select
              v-model:value="vdata.searchData.wayCode"
              placeholder="支付方式"
              v-if="$access('ENT_PAY_ORDER_SEARCH_PAY_WAY')"
              class="table-head-layout"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option
                v-for="item in vdata.payWayList"
                :key="item.wayCode"
                :value="item.wayCode"
              >
                {{ item.wayName }}
              </a-select-option>
            </a-select>
            <a-select
              v-model:value="vdata.searchData.state"
              placeholder="支付状态"
              class="table-head-layout"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="0">订单生成</a-select-option>
              <a-select-option value="1">支付中</a-select-option>
              <a-select-option value="2">支付成功</a-select-option>
              <a-select-option value="3">支付失败</a-select-option>
              <a-select-option value="4">已撤销</a-select-option>
              <a-select-option value="5">已退款</a-select-option>
              <a-select-option value="6">订单关闭</a-select-option>
            </a-select>
            <a-select
              v-model:value="vdata.searchData.notifyState"
              placeholder="回调状态"
              class="table-head-layout"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="0">未发送</a-select-option>
              <a-select-option value="1">已发送</a-select-option>
            </a-select>
            <a-select
              v-model:value="vdata.searchData.divisionState"
              placeholder="分账状态"
              class="table-head-layout"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="0">未发生分账</a-select-option>
              <a-select-option value="1">等待分账任务处理</a-select-option>
              <a-select-option value="2">分账处理中</a-select-option>
              <a-select-option value="3">分账任务已结束（状态请看分账记录）</a-select-option>
            </a-select>
            <span class="table-page-search-submitButtons">
              <a-button type="primary" :loading="vdata.btnLoading" @click="queryFunc">
                搜索
              </a-button>
              <a-button
                style="margin-left: 8px"
                @click="
                  () => {
                    vdata.searchData = {}
                    vdata.date = ''
                  }
                "
              >
                重置
              </a-button>
            </span>
          </div>
        </a-form>
      </div>

      <!-- 列表渲染 -->
      <JeepayTable
        ref="infoTable"
        :init-data="true"
        :req-table-data-func="reqTableDataFunc"
        :table-columns="vdata.tableColumns"
        :search-data="vdata.searchData"
        row-key="payOrderId"
        :table-row-cross-color="true"
        @btnLoadClose="vdata.btnLoading = false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'mchFeeAmount'">
            ￥{{ (record.mchFeeAmount / 100).toFixed(2) }}
          </template>

          <template v-if="column.key === 'amount'">
            <b>￥{{ record.amount / 100 }}</b>
          </template>
          <!-- 自定义插槽 -->
          <template v-if="column.key === 'refundAmount'">
            ￥{{ record.refundAmount / 100 }}
          </template>
          <!-- 自定义插槽 -->
          <template v-if="column.key === 'state'">
            <a-tag
              :key="record.state"
              :color="
                record.state === 0
                  ? 'blue'
                  : record.state === 1
                    ? 'orange'
                    : record.state === 2
                      ? 'green'
                      : record.state === 6
                        ? ''
                        : 'volcano'
              "
            >
              {{
                record.state === 0
                  ? '订单生成'
                  : record.state === 1
                    ? '支付中'
                    : record.state === 2
                      ? '支付成功'
                      : record.state === 3
                        ? '支付失败'
                        : record.state === 4
                          ? '已撤销'
                          : record.state === 5
                            ? '已退款'
                            : record.state === 6
                              ? '订单关闭'
                              : '未知'
              }}
            </a-tag>
          </template>
          <template v-if="column.key === 'divisionState'">
            <span v-if="record.divisionState == 0">-</span>
            <a-tag v-else-if="record.divisionState == 1" color="orange">待分账</a-tag>
            <a-tag v-else-if="record.divisionState == 2" color="red">分账处理中</a-tag>
            <a-tag v-else-if="record.divisionState == 3" color="green">任务已结束</a-tag>
            <span v-else>未知</span>
          </template>
          <template v-if="column.key === 'notifyState'">
            <a-badge
              :status="record.notifyState === 1 ? 'processing' : 'error'"
              :text="record.notifyState === 1 ? '已发送' : '未发送'"
            />
          </template>
          <template v-if="column.key === 'orderNo'">
            <div class="order-list">
              <p>
                <span style="color: #729ed5; background: #e7f5f7">支付</span>
                {{ record.payOrderId }}
              </p>
              <p style="margin-bottom: 0">
                <span style="color: #56cf56; background: #d8eadf">商户</span>
                <a-tooltip
                  v-if="record.mchOrderNo.length > record.payOrderId.length"
                  placement="bottom"
                  style="font-weight: normal"
                >
                  <template #title>
                    <span>{{ record.mchOrderNo }}</span>
                  </template>
                  {{ changeStr2ellipsis(record.mchOrderNo, record.payOrderId.length) }}
                </a-tooltip>
                <span v-else style="font-weight: normal">{{ record.mchOrderNo }}</span>
              </p>
              <p v-if="record.channelOrderNo" style="margin-bottom: 0; margin-top: 10px">
                <span style="color: #fff; background: #e09c4d">渠道</span>
                <a-tooltip
                  v-if="record.channelOrderNo.length > record.payOrderId.length"
                  placement="bottom"
                  style="font-weight: normal"
                >
                  <template #title>
                    <span>{{ record.channelOrderNo }}</span>
                  </template>
                  {{ changeStr2ellipsis(record.channelOrderNo, record.payOrderId.length) }}
                </a-tooltip>
                <span v-else style="font-weight: normal">{{ record.channelOrderNo }}</span>
              </p>
            </div>
          </template>
          <template v-if="column.key === 'op'">
            <!-- 操作列插槽 -->
            <JeepayTableColumns>
              <a-button
                v-if="$access('ENT_PAY_ORDER_VIEW')"
                type="link"
                @click="detailFunc(record.payOrderId)"
              >
                详情
              </a-button>
              <a-button
                v-if="$access('ENT_PAY_ORDER_REFUND')"
                v-show="record.state === 2 && record.refundState !== 2"
                type="link"
                style="color: red"
                @click="openFunc(record, record.payOrderId)"
              >
                退款
              </a-button>
            </JeepayTableColumns>
          </template>
        </template>
      </JeepayTable>
    </a-card>
    <!-- 退款弹出框 -->
    <refund-modal ref="refundModalInfo" :callback-func="searchFunc" />
    <!-- 日志详情抽屉 -->
    <template>
      <a-drawer
        width="50%"
        placement="right"
        :closable="true"
        v-model:open="vdata.visible"
        :title="vdata.visible === true ? '订单详情' : ''"
        @close="onClose"
      >
        <a-row justify="space-between" type="flex">
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="所属系统">
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
              <a-descriptions-item label="服务商号">
                {{ vdata.detailData.isvNo }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="支付订单号">
                <a-tag color="purple">
                  {{ vdata.detailData.payOrderId }}
                </a-tag>
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
              <a-descriptions-item label="商户订单号">
                {{ vdata.detailData.mchOrderNo }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="商户名称">
                {{ vdata.detailData.mchName }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="支付金额">
                <a-tag color="green">
                  {{ vdata.detailData.amount / 100 }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="手续费">
                <a-tag color="pink">
                  {{ vdata.detailData.mchFeeAmount / 100 }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="商家费率">
                {{ (vdata.detailData.mchFeeRate * 100).toFixed(2) }}%
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
                          : vdata.detailData.state === 6
                            ? ''
                            : 'volcano'
                  "
                >
                  {{
                    vdata.detailData.state === 0
                      ? '订单生成'
                      : vdata.detailData.state === 1
                        ? '支付中'
                        : vdata.detailData.state === 2
                          ? '支付成功'
                          : vdata.detailData.state === 3
                            ? '支付失败'
                            : vdata.detailData.state === 4
                              ? '已撤销'
                              : vdata.detailData.state === 5
                                ? '已退款'
                                : vdata.detailData.state === 6
                                  ? '订单关闭'
                                  : '未知'
                  }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="回调状态">
                <a-tag :color="vdata.detailData.notifyState === 1 ? 'green' : 'volcano'">
                  {{
                    vdata.detailData.notifyState === 0
                      ? '未发送'
                      : vdata.detailData.notifyState === 1
                        ? '已发送'
                        : '未知'
                  }}
                </a-tag>
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
              <a-descriptions-item label="支付错误码">
                {{ vdata.detailData.errCode }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="支付错误描述">
                {{ vdata.detailData.errMsg }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="订单失效时间">
                {{ vdata.detailData.expiredTime }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="支付成功时间">
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
              <a-descriptions-item label="商品标题">
                {{ vdata.detailData.subject }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="商品描述">
                {{ vdata.detailData.body }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="接口代码">
                {{ vdata.detailData.ifCode }}
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
              <a-descriptions-item label="支付方式">
                {{ vdata.detailData.wayCode }}
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
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="用户标识">
                {{ vdata.detailData.channelUser }}
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
              <a-descriptions-item label="异步通知地址">
                {{ vdata.detailData.notifyUrl }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="页面跳转地址">
                {{ vdata.detailData.returnUrl }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="退款状态">
                <a-tag
                  :color="
                    vdata.detailData.refundState === 0
                      ? 'blue'
                      : vdata.detailData.refundState === 1
                        ? 'orange'
                        : vdata.detailData.refundState === 2
                          ? 'green'
                          : 'volcano'
                  "
                >
                  {{
                    vdata.detailData.refundState === 0
                      ? '未发起'
                      : vdata.detailData.refundState === 1
                        ? '部分退款'
                        : vdata.detailData.refundState === 2
                          ? '全额退款'
                          : '未知'
                  }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="退款次数">
                {{ vdata.detailData.refundTimes }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="退款总额">
                <a-tag v-if="vdata.detailData.refundAmount" color="cyan">
                  {{ vdata.detailData.refundAmount / 100 }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-divider />
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="订单分账模式">
                <span v-if="vdata.detailData.divisionMode == 0">该笔订单不允许分账</span>
                <span v-else-if="vdata.detailData.divisionMode == 1">
                  支付成功按配置自动完成分账
                </span>
                <span v-else-if="vdata.detailData.divisionMode == 2">
                  商户手动分账(解冻商户金额)
                </span>
                <span v-else>未知</span>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="分账状态">
                <a-tag v-if="vdata.detailData.divisionState == 0" color="blue">未发生分账</a-tag>
                <a-tag v-else-if="vdata.detailData.divisionState == 1" color="orange">待分账</a-tag>
                <a-tag v-else-if="vdata.detailData.divisionState == 2" color="red">
                  分账处理中
                </a-tag>
                <a-tag v-else-if="vdata.detailData.divisionState == 3" color="green">
                  任务已结束
                </a-tag>
                <a-tag v-else color="#f50">未知</a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="最新分账发起时间">
                {{ vdata.detailData.divisionLastTime }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>
        <a-divider />

        <a-row justify="start" type="flex">
          <a-col :sm="24">
            <a-form layout="vertical">
              <a-form-item label="扩展参数:">
                <a-input
                  v-model:value="vdata.detailData.extParam"
                  type="textarea"
                  disabled="disabled"
                  style="height: 100px; color: black"
                />
              </a-form-item>
            </a-form>
          </a-col>
        </a-row>
      </a-drawer>
    </template>
  </page-header-wrapper>
</template>
<script setup lang="ts">
import RefundModal from './RefundModal.vue' // 退款弹出框
import { API_URL_PAY_ORDER_LIST, API_URL_PAYWAYS_LIST, req } from '@/api/manage'
import moment from 'moment'
import { reactive, ref, getCurrentInstance, onMounted } from 'vue'

const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  {
    key: 'amount',
    title: '支付金额',
    ellipsis: true,
    width: 108,
    fixed: 'left',
    scopedSlots: { customRender: 'amountSlot' },
  },
  {
    key: 'refundAmount',
    title: '退款金额',
    width: 108,
    scopedSlots: { customRender: 'refundAmountSlot' },
  },
  {
    key: 'mchFeeAmount',
    dataIndex: 'mchFeeAmount',
    title: '手续费',
    width: 100,
  },
  { key: 'mchName', title: '商户名称', dataIndex: 'mchName', ellipsis: true, width: 100 },
  { key: 'orderNo', title: '订单号', scopedSlots: { customRender: 'orderSlot' }, width: 210 },
  // { key: 'payOrderId', title: '支付订单号', dataIndex: 'payOrderId' },
  // { key: 'mchOrderNo', title: '商户订单号', dataIndex: 'mchOrderNo' },
  { key: 'wayName', title: '支付方式', dataIndex: 'wayName', width: 120 },
  { key: 'state', title: '支付状态', scopedSlots: { customRender: 'stateSlot' }, width: 100 },
  {
    key: 'notifyState',
    title: '回调状态',
    scopedSlots: { customRender: 'notifySlot' },
    width: 100,
  },
  {
    key: 'divisionState',
    title: '分账状态',
    scopedSlots: { customRender: 'divisionStateSlot' },
    width: 100,
  },
  { key: 'createdAt', dataIndex: 'createdAt', title: '创建日期', width: 120 },
  {
    key: 'op',
    title: '操作',
    width: 120,
    fixed: 'right',
    align: 'center',
    scopedSlots: { customRender: 'opSlot' },
  },
]

const infoTable = ref()
const refundModalInfo = ref()

const vdata: any = reactive({
  date: '',

  btnLoading: false,
  tableColumns: tableColumns,
  searchData: {},
  createdStart: '', // 选择开始时间
  createdEnd: '', // 选择结束时间
  visible: false,
  detailData: {},
  payWayList: [],
})

onMounted(() => {
  if ($access('ENT_PAY_ORDER_SEARCH_PAY_WAY')) {
    initPayWay()
  }
})

function queryFunc() {
  vdata.btnLoading = true
  infoTable.value.refTable(true)
}
// 请求table接口数据
function reqTableDataFunc(params) {
  return req.list(API_URL_PAY_ORDER_LIST, params)
}

function searchFunc() {
  // 点击【查询】按钮点击事件
  infoTable.value.refTable(false)
}

// 打开退款弹出框
function openFunc(record, recordId) {
  if (record.refundState === 2) {
    $infoBox.message.modalError('订单无可退款金额', '')
  }
  refundModalInfo.value.show(recordId)
}
function detailFunc(recordId) {
  req.getById(API_URL_PAY_ORDER_LIST, recordId).then((res) => {
    vdata.detailData = res
  })
  vdata.visible = true
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
  vdata.visible = false
}
function initPayWay() {
  req.list(API_URL_PAYWAYS_LIST, { pageSize: -1 }).then((res) => {
    // 支付方式下拉列表
    vdata.payWayList = res.records
  })
}
function changeStr2ellipsis(orderNo, baseLength) {
  const halfLengh = Math.floor(baseLength / 2)
  return (
    orderNo.substring(0, halfLengh - 1) +
    '...' +
    orderNo.substring(orderNo.length - halfLengh, orderNo.length)
  )
}
</script>
<style lang="less" scoped>
.order-list {
  -webkit-text-size-adjust: none;
  font-size: 12px;
  display: flex;
  flex-direction: column;

  p {
    white-space: nowrap;
    span {
      display: inline-block;
      font-weight: 800;
      height: 16px;
      line-height: 16px;
      width: 35px;
      border-radius: 5px;
      text-align: center;
      margin-right: 2px;
    }
  }
}
</style>
