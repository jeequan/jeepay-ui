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
            <jeepay-text-up :placeholder="'转账订单号'" :msg="searchData.transferId" v-model="searchData.transferId" />
            <jeepay-text-up :placeholder="'商户订单号'" :msg="searchData.mchOrderNo" v-model="searchData.mchOrderNo" />
            <jeepay-text-up :placeholder="'渠道支付订单号'" :msg="searchData.channelOrderNo" v-model="searchData.channelOrderNo" />
            <jeepay-text-up :placeholder="'商户号'" :msg="searchData.mchNo" v-model="searchData.mchNo" />
            <jeepay-text-up :placeholder="'应用AppId'" :msg="searchData.appId" v-model="searchData.appId"/>
            <a-form-item label="" class="table-head-layout">
              <a-select v-model="searchData.state" placeholder="转账状态" default-value="">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="0">订单生成</a-select-option>
                <a-select-option value="1">转账中</a-select-option>
                <a-select-option value="2">转账成功</a-select-option>
                <a-select-option value="3">转账失败</a-select-option>
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
        rowKey="transferId"
        :scrollX="1350"
      >
        <template slot="transferAmountSlot" slot-scope="{record}"><b>￥{{ record.amount/100 }}</b></template> <!-- 自定义插槽 -->
        <template slot="stateSlot" slot-scope="{record}">
          <a-tag
            :key="record.state"
            :color="record.state === 0?'blue':record.state === 1?'orange':record.state === 2?'green':'volcano'"
          >
            {{ record.state === 0?'订单生成':record.state === 1?'转账中':record.state === 2?'转账成功':record.state === 3?'转账失败':record.state === 4?'任务关闭':'未知' }}
          </a-tag>
        </template>
        <template slot="opSlot" slot-scope="{record}">  <!-- 操作列插槽 -->
          <JeepayTableColumns>
            <a-button type="link" v-if="$access('ENT_TRANSFER_ORDER_VIEW')" @click="detailFunc(record.transferId)">详情</a-button>
          </JeepayTableColumns>
        </template>
      </JeepayTable>
    </a-card>

    <!-- 订单详情 页面组件  -->
    <TransferOrderDetail ref="transferOrderDetail" />

  </page-header-wrapper>
</template>
<script>
  import JeepayTable from '@/components/JeepayTable/JeepayTable'
  import JeepayTextUp from '@/components/JeepayTextUp/JeepayTextUp' // 文字上移组件
  import JeepayTableColumns from '@/components/JeepayTable/JeepayTableColumns'
  import TransferOrderDetail from './TransferOrderDetail'
  import { API_URL_TRANSFER_ORDER_LIST, req } from '@/api/manage'
  import moment from 'moment'

  // eslint-disable-next-line no-unused-vars
  const tableColumns = [
    { title: '转账金额', scopedSlots: { customRender: 'transferAmountSlot' } },
    { title: '商户名称', dataIndex: 'mchName' },
    { title: '转账订单号', dataIndex: 'transferId' },
    { title: '商户转账单号', dataIndex: 'mchOrderNo' },
    { title: '渠道订单号', dataIndex: 'channelOrderNo' },
    { title: '收款账号', dataIndex: 'accountNo' },
    { title: '收款人姓名', dataIndex: 'accountName' },
    { title: '转账备注', dataIndex: 'transferDesc' },
    { title: '状态', scopedSlots: { customRender: 'stateSlot' }, width: 100 },
    { title: '创建日期', dataIndex: 'createdAt' },
    { title: '操作', width: '100px', fixed: 'right', align: 'center', scopedSlots: { customRender: 'opSlot' } }
  ]

  export default {
    name: 'IsvListPage',
    components: { JeepayTable, JeepayTableColumns, JeepayTextUp, TransferOrderDetail },
    data () {
      return {
        btnLoading: false,
        tableColumns: tableColumns,
        searchData: {},
        createdStart: '', // 选择开始时间
        createdEnd: '' // 选择结束时间
      }
    },
    methods: {
      queryFunc () {
        this.btnLoading = true
        this.$refs.infoTable.refTable(true)
      },
      // 请求table接口数据
      reqTableDataFunc: (params) => {
        return req.list(API_URL_TRANSFER_ORDER_LIST, params)
      },
      searchFunc: function () { // 点击【查询】按钮点击事件
        this.$refs.infoTable.refTable(true)
      },
      detailFunc: function (recordId) {
        this.$refs.transferOrderDetail.show(recordId)
      },
      moment,
      onChange (date, dateString) {
        this.searchData.createdStart = dateString[0] // 开始时间
        this.searchData.createdEnd = dateString[1] // 结束时间
      },
      disabledDate (current) { // 今日之后日期不可选
        return current && current > moment().endOf('day')
      }
    }
  }
</script>
