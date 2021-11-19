<template>
  <page-header-wrapper>
    <a-card>
      <div v-if="$access('ENT_DIVISION_RECEIVER_LIST')" class="table-page-search-wrapper">

        <a-form layout="inline" class="table-head-ground">

          <div class="table-layer">

            <a-form-item label="" class="table-head-layout" :wrapper-col="{span: 16}">
              <a-select v-model="searchData.appId" placeholder="选择应用">
                <a-select-option key="" >全部应用</a-select-option>
                <a-select-option v-for="(item) in mchAppList" :key="item.appId" >{{ item.appName }} [{{ item.appId }}]</a-select-option>
              </a-select>
            </a-form-item>

            <jeepay-text-up placeholder="分账接收者ID[精准]" :msg="searchData.receiverId" v-model="searchData.receiverId" />
            <jeepay-text-up placeholder="接收者账号别名[模糊]" :msg="searchData.receiverAlias" v-model="searchData.receiverAlias" />
            <jeepay-text-up placeholder="组ID[精准]" :msg="searchData.receiverGroupId" v-model="searchData.receiverGroupId" />

            <a-form-item label="" class="table-head-layout">
              <a-select v-model="searchData.state" placeholder="账号状态（本系统）" default-value="">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="1">正常分账</a-select-option>
                <a-select-option value="0">暂停分账</a-select-option>
              </a-select>
            </a-form-item>

            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchFunc" icon="search" :loading="btnLoading">查询</a-button>
              <a-button style="margin-left: 8px;" @click="() => this.searchData = {}" icon="reload">重置</a-button>
            </span>
          </div>
        </a-form>
        <div>
          <a-button v-if="$access('ENT_DIVISION_RECEIVER_ADD')" type="danger" icon="plus" @click="addFunc" class="mg-b-30">新建</a-button>
        </div>
      </div>

      <!-- 列表渲染 -->
      <JeepayTable
        ref="infoTable"
        :initData="false"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="tableColumns"
        :searchData="searchData"
        @btnLoadClose="btnLoading=false"
        rowKey="receiverId"
      >

        <!-- 渠道类型 -->
        <template slot="ifCodeSlot" slot-scope="{record}">
          <template v-if="record.ifCode === 'wxpay'" ><span style="color: green"><a-icon type="wechat" /> 微信</span></template>
          <template v-else-if="record.ifCode == 'alipay'" ><span style="color: dodgerblue"><a-icon type="alipay-circle" /> 支付宝</span></template>
          <template v-else >{{record.ifCode}}</template>
        </template>

        <!-- 状态（本系统） -->
        <template slot="stateSlot" slot-scope="{record}">
          <div v-if="record.state == 0" ><a-badge status="error" text="暂停分账" /></div>
          <div v-else-if="record.state == 1" ><a-badge status="processing" text="正常分账" /></div>
          <div v-else ><a-badge status="warning" text="未知" /></div>
        </template>

        <template slot="opSlot" slot-scope="{record}">  <!-- 操作列插槽 -->
          <JeepayTableColumns>
            <a v-if="$access('ENT_DIVISION_RECEIVER_EDIT')" @click="editFunc(record.receiverId)">修改</a>
          </JeepayTableColumns>
        </template>
      </JeepayTable>

      <!-- 新增收款账号页面  -->
      <ReceiverAdd ref="receiverAdd" :callbackFunc="searchFunc"/>

      <!-- 修改 页面组件  -->
      <ReceiverEdit ref="receiverEdit" :callbackFunc="searchFunc"/>
    </a-card>

  </page-header-wrapper>

</template>
<script>
import JeepayTable from '@/components/JeepayTable/JeepayTable'
import JeepayTableColumns from '@/components/JeepayTable/JeepayTableColumns'
import { API_URL_DIVISION_RECEIVER, API_URL_MCH_APP, req } from '@/api/manage'
import JeepayTextUp from '@/components/JeepayTextUp/JeepayTextUp' // 文字上移组件
import ReceiverAdd from './ReceiverAdd'
import ReceiverEdit from './ReceiverEdit'

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  { key: 'receiverId', dataIndex: 'receiverId', title: '绑定ID' },
  { key: 'ifCode', title: '渠道类型', scopedSlots: { customRender: 'ifCodeSlot' } },
  { key: 'receiverAlias', dataIndex: 'receiverAlias', title: '账号别名' },
  { key: 'receiverGroupName', dataIndex: 'receiverGroupName', title: '组名称' },
  { key: 'accNo', dataIndex: 'accNo', title: '分账接收账号' },
  { key: 'accName', dataIndex: 'accName', title: '分账接收账号名称' },
  { key: 'relationTypeName', dataIndex: 'relationTypeName', title: '分账关系类型' },
  { title: '状态', scopedSlots: { customRender: 'stateSlot' }, align: 'center' },
  { key: 'bindSuccessTime', dataIndex: 'bindSuccessTime', title: '绑定成功时间' },
  { key: 'divisionProfit', dataIndex: 'divisionProfit', title: '默认分账比例', customRender: (text, record, index) => (text * 100).toFixed(2) + '%' },
  { key: 'op', title: '操作', width: '200px', fixed: 'right', align: 'center', scopedSlots: { customRender: 'opSlot' } }
]

export default {
  components: { JeepayTable, JeepayTableColumns, JeepayTextUp, ReceiverAdd, ReceiverEdit },
  data () {
    return {
      tableColumns: tableColumns,
      searchData: { appId: '' },
      btnLoading: false,

      mchAppList: [] // 商户app列表
    }
  },
  mounted () {
    const that = this // 提前保留this
    // 请求接口，获取所有的appid，只有此处进行pageSize=-1传参
    req.list(API_URL_MCH_APP, { pageSize: -1 }).then(res => {
      that.mchAppList = res.records

      // 默认选中第一个 & 更新列表
      if (that.mchAppList && that.mchAppList.length > 0) {
        that.searchData.appId = that.mchAppList[0].appId + ''
        that.searchFunc()
      }
    })
  },
  methods: {

    // 请求table接口数据
    reqTableDataFunc: (params) => {
      return req.list(API_URL_DIVISION_RECEIVER, params)
    },

    searchFunc: function () { // 点击【查询】按钮点击事件
      this.btnLoading = true // 打开查询按钮上的loading
      this.$refs.infoTable.refTable(true)
    },

    addFunc: function () { // 业务通用【新增】 函数
      if (this.mchAppList.length <= 0) {
        return this.$message.error('当前商户无任何应用，请先创建应用后再试。')
      }
      if (!this.searchData.appId) {
        return this.$message.error('请先选择应用。')
      }

      // 打开弹层
      this.$refs.receiverAdd.show(this.mchAppList.filter((item) => item.appId === this.searchData.appId)[0])
    },

    editFunc: function (recordId) { // 业务通用【修改】 函数
      this.$refs.receiverEdit.show(recordId)
    }

  }
}
</script>
