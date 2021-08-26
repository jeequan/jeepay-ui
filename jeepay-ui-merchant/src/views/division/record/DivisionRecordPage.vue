<template>
  <page-header-wrapper>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline" class="table-head-ground">
          <div class="table-layer">
            <a-form-item label="" class="table-head-layout" style="max-width:350px;min-width:300px">
              <a-range-picker
                @change="onChange"
                :show-time="{ format: 'HH:mm:ss' }"
                format="YYYY-MM-DD HH:mm:ss"
                :disabled-date="disabledDate"
              >
                <a-icon slot="suffixIcon" type="sync" />
              </a-range-picker>
            </a-form-item>
            <jeepay-text-up placeholder="分账接受者ID" :msg="searchData.receiverId" v-model="searchData.receiverId" />
            <jeepay-text-up placeholder="分账账号组ID" :msg="searchData.receiverGroupId" v-model="searchData.receiverGroupId" />
            <jeepay-text-up placeholder="应用AppId" :msg="searchData.appId" v-model="searchData.appId"/>
            <jeepay-text-up placeholder="支付订单号" :msg="searchData.payOrderId" v-model="searchData.payOrderId"/>
            <jeepay-text-up placeholder="分账接收账号" :msg="searchData.accNo" v-model="searchData.accNo"/>

            <a-form-item label="" class="table-head-layout">
              <a-select v-model="searchData.state" placeholder="分账状态" default-value="">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="0">待分账</a-select-option>
                <a-select-option value="1">分账成功</a-select-option>
                <a-select-option value="2">分账失败</a-select-option>
              </a-select>
            </a-form-item>

            <span class="table-page-search-submitButtons">
              <a-button type="primary" icon="search" @click="queryFunc" :loading="btnLoading">搜索</a-button>
              <a-button style="margin-left: 8px" icon="reload" @click="() => this.searchData = {}">重置</a-button>
            </span>
          </div>
        </a-form>
      </div>

      <!-- 列表渲染 -->
      <JeepayTable
        @btnLoadClose="btnLoading=false"
        ref="infoTable"
        :initData="true"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="tableColumns"
        :searchData="searchData"
        rowKey="recordId"
      >
        <template slot="amountSlot" slot-scope="{record}"><b>￥{{ record.calDivisionAmount/100 }}</b></template> <!-- 自定义插槽 -->
        <template slot="stateSlot" slot-scope="{record}">
          <a-tag
            :key="record.state"
            :color="record.state === 0?'orange':record.state === 1?'blue':record.state === 2?'volcano':'volcano'"
          >
            {{ record.state === 0?'分账中':record.state === 1?'分账成功':record.state === 2?'分账失败' : '未知' }}
          </a-tag>
        </template>
        <template slot="opSlot" slot-scope="{record}">  <!-- 操作列插槽 -->
          <JeepayTableColumns>
            <a-button type="link" v-if="$access('ENT_DIVISION_RECORD_VIEW')" @click="detailFunc(record.recordId)">详情</a-button>
          </JeepayTableColumns>
        </template>
      </JeepayTable>
    </a-card>

    <Detail ref="recordDetail" />

  </page-header-wrapper>
</template>
<script>
import JeepayTextUp from '@/components/JeepayTextUp/JeepayTextUp' // 文字上移组件
import JeepayTable from '@/components/JeepayTable/JeepayTable'
import JeepayTableColumns from '@/components/JeepayTable/JeepayTableColumns'
import { API_URL_PAY_ORDER_DIVISION_RECORD_LIST, req } from '@/api/manage'
import moment from 'moment'
import Detail from './Detail'

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  { key: 'calDivisionAmount', title: '分账金额', scopedSlots: { customRender: 'amountSlot' } },
  { key: 'batchOrderId', title: '分账批次号', dataIndex: 'batchOrderId' },
  { key: 'payOrderId', title: '支付订单号', dataIndex: 'payOrderId' },
  { key: 'ifCode', title: '接口代码', dataIndex: 'ifCode' },
  { key: 'payOrderAmount', dataIndex: 'payOrderAmount', title: '订单金额', customRender: (text) => (text / 100).toFixed(2) },
  { key: 'payOrderDivisionAmount', dataIndex: 'payOrderDivisionAmount', title: '订单商户入账金额', customRender: (text) => (text / 100).toFixed(2) },
  { key: 'receiverAlias', title: '账号别名', dataIndex: 'receiverAlias' },
  { key: 'accNo', title: '接收账号', dataIndex: 'accNo' },
  { key: 'accName', title: '账号姓名', dataIndex: 'accName' },
  { key: 'relationTypeName', title: '分账关系类型', dataIndex: 'relationTypeName' },
  { key: 'divisionProfit', dataIndex: 'divisionProfit', title: '分账比例', customRender: (text, record, index) => (text * 100).toFixed(2) + '%' },
  { key: 'state', title: '分账状态', scopedSlots: { customRender: 'stateSlot' } },
  { key: 'createdAt', dataIndex: 'createdAt', title: '创建日期' },
  { key: 'op', title: '操作', width: '100px', fixed: 'right', align: 'center', scopedSlots: { customRender: 'opSlot' } }
]

export default {
  components: { JeepayTable, JeepayTableColumns, JeepayTextUp, Detail },
  data () {
    return {
      btnLoading: false,
      tableColumns: tableColumns,
      searchData: {},
      createdStart: '', // 选择开始时间
      createdEnd: '' // 选择结束时间
    }
  },
  computed: {
  },
  mounted () {
  },
  methods: {
    queryFunc () {
      this.btnLoading = true
      this.$refs.infoTable.refTable(true)
    },
    // 请求table接口数据
    reqTableDataFunc: (params) => {
      return req.list(API_URL_PAY_ORDER_DIVISION_RECORD_LIST, params)
    },
    searchFunc: function () { // 点击【查询】按钮点击事件
      this.$refs.infoTable.refTable(true)
    },
    detailFunc: function (recordId) {
      this.$refs.recordDetail.show(recordId)
    },
    moment,
    onChange (date, dateString) {
      this.searchData.createdStart = dateString[0] // 开始时间
      this.searchData.createdEnd = dateString[1] // 结束时间
    },
    disabledDate (current) { // 今日之后日期不可选
      return current && current > moment().endOf('day')
    },
    onClose () {
      this.visible = false
    }
  }
}
</script>
