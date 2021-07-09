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
            <jeepay-text-up :placeholder="'退款订单号'" :msg="searchData.refundOrderId" v-model="searchData.refundOrderId" />
            <jeepay-text-up :placeholder="'支付订单号'" :msg="searchData.payOrderId" v-model="searchData.payOrderId" />
            <jeepay-text-up :placeholder="'渠道支付订单号'" :msg="searchData.channelPayOrderNo" v-model="searchData.channelPayOrderNo" />
            <jeepay-text-up :placeholder="'商户号'" :msg="searchData.mchNo" v-model="searchData.mchNo" />
            <jeepay-text-up :placeholder="'服务商号'" :msg="searchData.isvNo" v-model="searchData.isvNo" />
            <jeepay-text-up :placeholder="'应用AppId'" :msg="searchData.appId" v-model="searchData.appId"/>
            <a-form-item label="" class="table-head-layout">
              <a-select v-model="searchData.state" placeholder="退款状态" default-value="">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="0">订单生成</a-select-option>
                <a-select-option value="1">退款中</a-select-option>
                <a-select-option value="2">退款成功</a-select-option>
                <a-select-option value="3">退款失败</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="" class="table-head-layout">
              <a-select v-model="searchData.mchType" placeholder="商户类型" default-value="">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="1">普通商户</a-select-option>
                <a-select-option value="2">特约商户</a-select-option>
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
        :rowSelection="rowSelection"
        rowKey="refundOrderId"
        :scrollX="1350"
      >
        <template slot="payAmountSlot" slot-scope="{record}"><b>￥{{ record.payAmount/100 }}</b></template> <!-- 自定义插槽 -->
        <template slot="refundAmountSlot" slot-scope="{record}"><b>￥{{ record.refundAmount/100 }}</b></template> <!-- 自定义插槽 -->
        <template slot="stateSlot" slot-scope="{record}">
          <a-tag
            :key="record.state"
            :color="record.state === 0?'blue':record.state === 1?'orange':record.state === 2?'green':'volcano'"
          >
            {{ record.state === 0?'订单生成':record.state === 1?'退款中':record.state === 2?'退款成功':record.state === 3?'退款失败':record.state === 4?'任务关闭':'未知' }}
          </a-tag>
        </template>
        <template slot="opSlot" slot-scope="{record}">  <!-- 操作列插槽 -->
          <JeepayTableColumns>
            <a-button type="link" v-if="$access('ENT_REFUND_ORDER_VIEW')" @click="detailFunc(record.refundOrderId)">详情</a-button>
          </JeepayTableColumns>
        </template>
      </JeepayTable>
    </a-card>
    <!-- 日志详情抽屉 -->
    <template>
      <a-drawer
        width="50%"
        placement="right"
        :closable="true"
        :visible="visible"
        :title="visible === true? '退款订单详情':''"
        @close="onClose"
      >
        <a-row justify="space-between" type="flex">
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="所属系统">
                {{ detailData.mchType === 1?'普通商户':detailData.mchType === 2?'特约商户':'未知' }}
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
              <a-descriptions-item label="退款订单号">
                <a-tag color="purple">
                  {{ detailData.refundOrderId }}
                </a-tag>
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
              <a-descriptions-item label="支付订单号">
                {{ detailData.payOrderId }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="商户退款单号">
                {{ detailData.mchRefundNo }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="渠道支付订单号">
                {{ detailData.channelPayOrderNo }}
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
              <a-descriptions-item label="支付金额">
                <a-tag color="green">
                  {{ detailData.payAmount/100 }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="退款金额">
                <a-tag color="green">
                  {{ detailData.refundAmount/100 }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="订单状态">
                <a-tag :color="detailData.state === 0?'blue':detailData.state === 1?'orange':detailData.state === 2?'green':'volcano'">
                  {{ detailData.state === 0?'订单生成':detailData.state === 1?'退款中':detailData.state === 2?'退款成功':detailData.state === 3?'退款失败':detailData.state === 4?'任务关闭':'未知' }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="退款成功时间">
                {{ detailData.successTime }}
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
          <a-divider />
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="接口代码">
                {{ detailData.ifCode }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="货币代码">
                {{ detailData.currency }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="方式代码">
                {{ detailData.wayCode }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="客户端IP">
                {{ detailData.clientIp }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="24">
            <a-descriptions>
              <a-descriptions-item label="异步通知地址">
                {{ detailData.notifyUrl }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>
        <a-divider />
        <a-col :sm="12">
          <a-descriptions>
            <a-descriptions-item label="渠道订单号">
              {{ detailData.channelOrderNo }}
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
        <a-col :sm="12">
          <a-descriptions>
            <a-descriptions-item label="渠道错误码">
              {{ detailData.errCode }}
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
        <a-col :sm="12">
          <a-descriptions>
            <a-descriptions-item label="渠道错误描述">
              {{ detailData.errMsg }}
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
        <a-col :sm="24">
          <a-form-model-item label="渠道额外参数">
            <a-input
              type="textarea"
              disabled="disabled"
              style="height: 100px;color: black"
              v-model="detailData.channelExtra"
            />
          </a-form-model-item>
        </a-col>
        <a-divider />
        <a-col :sm="24">
          <a-form-model-item label="扩展参数">
            <a-input
              type="textarea"
              disabled="disabled"
              style="height: 100px;color: black"
              v-model="detailData.extParam"
            />
          </a-form-model-item>
        </a-col>
        <a-col :sm="24">
          <a-form-model-item label="备注">
            <a-input
              type="textarea"
              disabled="disabled"
              style="height: 100px;color: black"
              v-model="detailData.remark"
            />
          </a-form-model-item>
        </a-col>
      </a-drawer>
    </template>
  </page-header-wrapper>
</template>
<script>
  import JeepayTable from '@/components/JeepayTable/JeepayTable'
  import JeepayTextUp from '@/components/JeepayTextUp/JeepayTextUp' // 文字上移组件
  import JeepayTableColumns from '@/components/JeepayTable/JeepayTableColumns'
  import { API_URL_REFUND_ORDER_LIST, req } from '@/api/manage'
  import moment from 'moment'

  // eslint-disable-next-line no-unused-vars
  const tableColumns = [
    { key: 'payAmount', title: '支付金额', fixed: 'left', scopedSlots: { customRender: 'payAmountSlot' } },
    { key: 'refundAmount', title: '退款金额', scopedSlots: { customRender: 'refundAmountSlot' } },
    { key: 'refundOrderId', title: '退款订单号', dataIndex: 'refundOrderId' },
    { key: 'payOrderId', title: '支付订单号', dataIndex: 'payOrderId' },
    { key: 'mchRefundNo', title: '商户退款单号', dataIndex: 'mchRefundNo' },
    { key: 'state', title: '状态', scopedSlots: { customRender: 'stateSlot' }, width: 100 },
    { key: 'createdAt', dataIndex: 'createdAt', title: '创建日期' },
    { key: 'op', title: '操作', width: '100px', fixed: 'right', align: 'center', scopedSlots: { customRender: 'opSlot' } }
  ]

  export default {
    name: 'IsvListPage',
    components: { JeepayTable, JeepayTableColumns, JeepayTextUp },
    data () {
      return {
        btnLoading: false,
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
        return req.list(API_URL_REFUND_ORDER_LIST, params)
      },
      searchFunc: function () { // 点击【查询】按钮点击事件
        this.$refs.infoTable.refTable(true)
      },
      detailFunc: function (recordId) {
        const that = this
        req.getById(API_URL_REFUND_ORDER_LIST, recordId).then(res => {
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
      }
    }
  }
</script>
