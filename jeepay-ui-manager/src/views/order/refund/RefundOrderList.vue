<template>
  <page-header-wrapper>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline" class="table-head-ground">
          <div class="table-layer">
            <a-range-picker
              @change="onChange"
              v-model:value="vdata.date"
              :show-time="{ format: 'HH:mm:ss' }"
              format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="disabledDate"
              class="table-head-layout"
            >
              <a-icon slot="suffixIcon" type="sync" />
            </a-range-picker>
            <jeepay-text-up
              :placeholder="'支付/退款列订单号'"
              v-model:value="vdata.searchData.unionOrderId"
            />
            <!--            <jeepay-text-up :placeholder="'退款订单号'" :msg="searchData.refundOrderId" v-model:value="searchData.refundOrderId" />-->
            <!--            <jeepay-text-up :placeholder="'支付订单号'" :msg="searchData.payOrderId" v-model:value="searchData.payOrderId" />-->
            <!--            <jeepay-text-up :placeholder="'渠道支付订单号'" :msg="searchData.channelPayOrderNo" v-model:value="searchData.channelPayOrderNo" />-->
            <jeepay-text-up :placeholder="'商户号'" v-model:value="vdata.searchData.mchNo" />
            <jeepay-text-up :placeholder="'服务商号'" v-model:value="vdata.searchData.isvNo" />
            <jeepay-text-up :placeholder="'应用AppId'" v-model:value="vdata.searchData.appId" />
            <a-select
              class="table-head-layout"
              v-model:value="vdata.searchData.state"
              placeholder="退款状态"
              default-value=""
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="0">订单生成</a-select-option>
              <a-select-option value="1">退款中</a-select-option>
              <a-select-option value="2">退款成功</a-select-option>
              <a-select-option value="3">退款失败</a-select-option>
            </a-select>
            <a-select
              class="table-head-layout"
              v-model:value="vdata.searchData.mchType"
              placeholder="商户类型"
              default-value=""
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="1">普通商户</a-select-option>
              <a-select-option value="2">特约商户</a-select-option>
            </a-select>

            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="queryFunc" :loading="vdata.btnLoading">
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
        @btnLoadClose="vdata.btnLoading = false"
        ref="infoTable"
        :initData="true"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="vdata.tableColumns"
        :searchData="vdata.searchData"
        rowKey="refundOrderId"
        :tableRowCrossColor="true"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'payAmount'">
            <b>￥{{ record.payAmount / 100 }}</b>
          </template>
          <!-- 自定义插槽 -->
          <template v-if="column.key === 'refundAmount'">
            <b>￥{{ record.refundAmount / 100 }}</b>
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
                      : 'volcano'
              "
            >
              {{
                record.state === 0
                  ? '订单生成'
                  : record.state === 1
                    ? '退款中'
                    : record.state === 2
                      ? '退款成功'
                      : record.state === 3
                        ? '退款失败'
                        : record.state === 4
                          ? '任务关闭'
                          : '未知'
              }}
            </a-tag>
          </template>

          <template v-if="column.key === 'payOrder'">
            <div class="order-list">
              <p>
                <span style="color: #729ed5; background: #e7f5f7">支付</span>
                {{ record.payOrderId }}
              </p>
              <p v-if="record.channelPayOrderNo" style="margin-bottom: 0">
                <span style="color: #fff; background: #e09c4d">渠道</span>
                <a-tooltip
                  placement="bottom"
                  style="font-weight: normal"
                  v-if="record.channelPayOrderNo.length > record.payOrderId.length"
                >
                  <template slot="title">
                    <span>{{ record.channelPayOrderNo }}</span>
                  </template>
                  {{ changeStr2ellipsis(record.channelPayOrderNo, record.payOrderId.length) }}
                </a-tooltip>
                <span style="font-weight: normal" v-else>{{ record.channelPayOrderNo }}</span>
              </p>
            </div>
          </template>

          <template v-if="column.key === 'refund'">
            <div class="order-list">
              <p>
                <span style="color: #729ed5; background: #e7f5f7">退款</span>
                {{ record.refundOrderId }}
              </p>
              <p style="margin-bottom: 0">
                <span style="color: #56cf56; background: #d8eadf">商户</span>
                <a-tooltip
                  placement="bottom"
                  style="font-weight: normal"
                  v-if="record.mchRefundNo.length > record.payOrderId.length"
                >
                  <template slot="title">
                    <span>{{ record.mchRefundNo }}</span>
                  </template>
                  {{ changeStr2ellipsis(record.mchRefundNo, record.refundOrderId.length) }}
                </a-tooltip>
                <span style="font-weight: normal" v-else>{{ record.mchRefundNo }}</span>
              </p>
            </div>
          </template>
          <template v-if="column.key === 'op'">
            <!-- 操作列插槽 -->
            <JeepayTableColumns>
              <a-button
                type="link"
                v-if="$access('ENT_REFUND_ORDER_VIEW')"
                @click="detailFunc(record.refundOrderId)"
              >
                详情
              </a-button>
            </JeepayTableColumns>
          </template>
        </template>
      </JeepayTable>
    </a-card>
    <!-- 日志详情抽屉 -->
    <template>
      <a-drawer
        width="50%"
        placement="right"
        :closable="true"
        v-model:open="vdata.visible"
        :title="vdata.visible === true ? '退款订单详情' : ''"
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
              <a-descriptions-item label="退款订单号">
                <a-tag color="purple">
                  {{ vdata.detailData.refundOrderId }}
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
              <a-descriptions-item label="支付订单号">
                {{ vdata.detailData.payOrderId }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="商户退款单号">
                {{ vdata.detailData.mchRefundNo }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="渠道支付订单号">
                {{ vdata.detailData.channelPayOrderNo }}
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
              <a-descriptions-item label="支付金额">
                <a-tag color="green">
                  {{ vdata.detailData.payAmount / 100 }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="退款金额">
                <a-tag color="green">
                  {{ vdata.detailData.refundAmount / 100 }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="24">
            <a-descriptions>
              <a-descriptions-item label="退款原因">
                {{ vdata.detailData.refundReason }}
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
                        ? '退款中'
                        : vdata.detailData.state === 2
                          ? '退款成功'
                          : vdata.detailData.state === 3
                            ? '退款失败'
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
              <a-descriptions-item label="退款成功时间">
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
              <a-descriptions-item label="方式代码">
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
            <a-descriptions-item label="渠道错误码">
              {{ vdata.detailData.errCode }}
            </a-descriptions-item>
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
          <a-col :sm="24">
            <a-form-item label="备注:">
              <a-textarea
                disabled="disabled"
                style="height: 100px; color: black"
                v-model:value="vdata.detailData.remark"
              />
            </a-form-item>
          </a-col>
        </a-form>
      </a-drawer>
    </template>
  </page-header-wrapper>
</template>
<script setup lang="ts">
import { API_URL_REFUND_ORDER_LIST, req } from '@/api/manage'
import moment from 'moment'
import { reactive, ref, getCurrentInstance } from 'vue'

const { $infoBox, $access, $hasAgentEnt } = getCurrentInstance()!.appContext.config.globalProperties

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  {
    key: 'payAmount',
    title: '支付金额',
    ellipsis: true,
    fixed: 'left',
    scopedSlots: { customRender: 'payAmountSlot' },
    width: 100,
  },
  {
    key: 'refundAmount',
    title: '退款金额',
    ellipsis: true,
    width: 100,
  },
  {
    key: 'refund',
    title: '退款订单号',
    width: 220,
  },
  {
    key: 'payOrder',
    title: '支付订单号',
    width: 220,
  },
  // { key: 'payOrderId', title: '支付订单号', dataIndex: 'payOrderId' },
  // { key: 'mchRefundNo', title: '商户退款单号', dataIndex: 'mchRefundNo' },
  { key: 'state', title: '状态', scopedSlots: { customRender: 'stateSlot' }, width: 100 },
  { key: 'createdAt', dataIndex: 'createdAt', title: '创建日期', width: 120 },
  { key: 'op', title: '操作', width: 100, fixed: 'right', scopedSlots: { customRender: 'opSlot' } },
]

const infoTable = ref()

const vdata: any = reactive({
  date: '',

  btnLoading: false,
  tableColumns: tableColumns,
  searchData: {},
  selectedIds: [], // 选中的数据
  createdStart: '', // 选择开始时间
  createdEnd: '', // 选择结束时间
  visible: false,
  detailData: {},
})

function queryFunc() {
  vdata.btnLoading = true
  infoTable.value.refTable(true)
}
// 请求table接口数据
function reqTableDataFunc(params) {
  return req.list(API_URL_REFUND_ORDER_LIST, params)
}
function searchFunc() {
  // 点击【查询】按钮点击事件
  infoTable.value.refTable(true)
}
function detailFunc(recordId) {
  req.getById(API_URL_REFUND_ORDER_LIST, recordId).then((res) => {
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
