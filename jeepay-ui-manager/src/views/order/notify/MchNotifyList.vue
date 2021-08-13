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
            <jeepay-text-up :placeholder="'订单ID'" :msg="searchData.orderId" v-model="searchData.orderId" />
            <jeepay-text-up :placeholder="'商户订单号'" :msg="searchData.mchOrderNo" v-model="searchData.mchOrderNo" />
            <jeepay-text-up :placeholder="'商户号'" :msg="searchData.mchNo" v-model="searchData.mchNo" />
            <jeepay-text-up :placeholder="'服务商号'" :msg="searchData.isvNo" v-model="searchData.isvNo" />
            <jeepay-text-up :placeholder="'应用AppId'" :msg="searchData.appId" v-model="searchData.appId"/>
            <a-form-item label="" class="table-head-layout">
              <a-select v-model="searchData.state" placeholder="通知状态" default-value="">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="1">通知中</a-select-option>
                <a-select-option value="2">通知成功</a-select-option>
                <a-select-option value="3">通知失败</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="" class="table-head-layout">
              <a-select v-model="searchData.orderType" placeholder="订单类型" default-value="">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="1">支付</a-select-option>
                <a-select-option value="2">退款</a-select-option>
                <a-select-option value="3">转账</a-select-option>
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
        :closable="true"
        :initData="true"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="tableColumns"
        :searchData="searchData"
        :rowSelection="rowSelection"
        rowKey="orderId"
        :scrollX="1050"
      >
        <template slot="stateSlot" slot-scope="{record}">
          <a-tag
            :key="record.state"
            :color="record.state === 1?'orange':record.state === 2?'green':'volcano'"
          >
            {{ record.state === 1?'通知中':record.state === 2?'通知成功':record.state === 3?'通知失败':'未知' }}
          </a-tag>
        </template>
        <template slot="orderTypeSlot" slot-scope="{record}">
          <a-tag
            :key="record.orderType"
            :color="record.orderType === 1?'green':record.orderType === 2?'volcano': record.orderType === 3? 'blue': 'orange'"
          >
            {{ record.orderType === 1?'支付':record.orderType === 2?'退款':record.orderType === 3? '转账':'未知' }}
          </a-tag>
        </template>
        <template slot="opSlot" slot-scope="{record}">  <!-- 操作列插槽 -->
          <JeepayTableColumns>
            <a-button type="link" v-if="$access('ENT_MCH_NOTIFY_VIEW')" @click="detailFunc(record.notifyId)">详情</a-button>
            <a-button type="link" v-if="$access('ENT_MCH_NOTIFY_RESEND') && record.state === 3" @click="resendFunc(record.notifyId)">重发通知</a-button>
          </JeepayTableColumns>
        </template>
      </JeepayTable>
    </a-card>
    <!-- 日志详情抽屉 -->
    <template>
      <a-drawer
        width="40%"
        placement="right"
        :closable="true"
        :visible="visible"
        :title="visible === true? '商户通知详情':''"
        @close="onClose"
      >
        <a-row justify="space-between" type="flex">
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="订单ID">
                <a-tag color="purple">
                  {{ detailData.orderId }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="服务商号">
                {{ detailData.isvNo }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="商户订单号">
                {{ detailData.mchOrderNo }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="商户号">
                {{ detailData.mchNo }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="订单类型">
                <a-tag :color="detailData.orderType === 1?'green':detailData.orderType === 2?'volcano': detailData.orderType === 3? 'blue' : 'orange'">
                  {{ detailData.orderType === 1?'支付':detailData.orderType === 2?'退款':detailData.orderType === 3 ? '转账': '未知' }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="应用APPID">
                {{ detailData.appId }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="通知状态">
                <a-tag :color="detailData.state === 1?'orange':detailData.state === 2?'green':'volcano'">
                  {{ detailData.state === 1?'通知中':detailData.state === 2?'通知成功':detailData.state === 3?'通知失败':'未知' }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="通知次数">
                {{ detailData.notifyCount }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="24">
            <a-descriptions>
              <a-descriptions-item label="最后通知时间">
                {{ detailData.lastNotifyTime }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="创建时间">
                {{ detailData.createdAt }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="更新时间">
                {{ detailData.updatedAt }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="24">
            <a-form-model-item label="通知地址">
              <a-input
                type="textarea"
                disabled="disabled"
                style="height: 100px;color: black"
                v-model="detailData.notifyUrl"
              />
            </a-form-model-item>
          </a-col>
          <a-col :sm="24">
            <a-form-model-item label="响应结果">
              <a-input
                type="textarea"
                disabled="disabled"
                style="height: 100px;color: black"
                v-model="detailData.resResult"
              />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-drawer>
    </template>
  </page-header-wrapper>
</template>
<script>
  import JeepayTable from '@/components/JeepayTable/JeepayTable'
  import JeepayTextUp from '@/components/JeepayTextUp/JeepayTextUp' // 文字上移组件
  import JeepayTableColumns from '@/components/JeepayTable/JeepayTableColumns'
  import { API_URL_MCH_NOTIFY_LIST, req, mchNotifyResend } from '@/api/manage'
  import moment from 'moment'

  // eslint-disable-next-line no-unused-vars
  const tableColumns = [
    { key: 'orderId', title: '订单ID', fixed: 'left', dataIndex: 'orderId' },
    { key: 'mchOrderNo', title: '商户订单号', dataIndex: 'mchOrderNo' },
    { key: 'state', title: '通知状态', width: '130px', scopedSlots: { customRender: 'stateSlot' } },
    { key: 'orderType', title: '订单类型', width: '130px', scopedSlots: { customRender: 'orderTypeSlot' } },
    { key: 'createdAt', dataIndex: 'createdAt', title: '创建日期' },
    { key: 'op', title: '操作', fixed: 'right', align: 'center', scopedSlots: { customRender: 'opSlot' } }
  ]

  export default {
    name: 'IsvListPage',
    components: { JeepayTable, JeepayTableColumns, JeepayTextUp },
    data () {
      return {
        btnLoading: true,
        tableColumns: tableColumns,
        searchData: {},
        selectedIds: [], // 选中的数据
        createdStart: '', // 选择开始时间
        createdEnd: '', // 选择结束时间
        visible: false,
        detailData: {}
      }
    },
    computed: {
      rowSelection () {
        const that = this
        return {
          onChange: (selectedRowKeys, selectedRows) => {
            that.selectedIds = [] // 清空选中数组
            selectedRows.forEach(function (data) { // 赋值选中参数
              that.selectedIds.push(data.payOrderId)
            })
          }
        }
      }
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
        return req.list(API_URL_MCH_NOTIFY_LIST, params)
      },
      searchFunc: function () { // 点击【查询】按钮点击事件
        this.$refs.infoTable.refTable(true)
      },
      detailFunc: function (recordId) {
        const that = this
        req.getById(API_URL_MCH_NOTIFY_LIST, recordId).then(res => {
          that.detailData = res
        })
        this.visible = true
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
      },
      resendFunc (notifyId) { // 重发通知
        const that = this

        this.$infoBox.confirmPrimary('确认重发通知？', '', () => {
          mchNotifyResend(notifyId).then(res => {
            that.$message.success('任务更新成功，请稍后查看最新状态！')
            that.searchFunc()
          })
        })
      }
    }
  }
</script>
