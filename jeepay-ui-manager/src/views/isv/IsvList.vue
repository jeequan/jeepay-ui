<template>
  <page-header-wrapper>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline" class="table-head-ground">
          <div class="table-layer">
            <jeepay-text-up :placeholder="'服务商号'" :msg="searchData.isvNo" v-model="searchData.isvNo" />
            <jeepay-text-up :placeholder="'服务商名称'" :msg="searchData.isvName" v-model="searchData.isvName" />
            <a-form-item label="" class="table-head-layout">
              <a-select v-model="searchData.state" placeholder="服务商状态" default-value="">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="0">禁用</a-select-option>
                <a-select-option value="1">启用</a-select-option>
              </a-select>
            </a-form-item>
            <span class="table-page-search-submitButtons">
              <a-button type="primary" icon="search" @click="queryFunc" :loading="btnLoading">搜索</a-button>
              <a-button style="margin-left: 8px" icon="reload" @click="() => this.searchData = {}">重置</a-button>
            </span>
          </div>
        </a-form>
        <div>
          <a-button icon="plus" v-if="$access('ENT_ISV_INFO_ADD')" type="primary" @click="addFunc" class="mg-b-30">新建</a-button>
        </div>
      </div>

      <!-- 列表渲染 -->
      <JeepayTable
        @btnLoadClose="btnLoading=false"
        ref="infoTable"
        :initData="true"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="tableColumns"
        :searchData="searchData"
        :scrollX="1100"
        rowKey="isvNo"
      >
        <template slot="isvNameSlot" slot-scope="{record}"><b>{{ record.isvName }}</b></template> <!-- 自定义插槽 -->
        <template slot="stateSlot" slot-scope="{record}">
          <a-badge :status="record.state === 0?'error':'processing'" :text="record.state === 0?'禁用':'启用'" />
        </template>
        <template slot="opSlot" slot-scope="{record}">  <!-- 操作列插槽 -->
          <JeepayTableColumns>
            <a-button type="link" v-if="$access('ENT_ISV_INFO_EDIT')" @click="editFunc(record.isvNo)">修改</a-button>
            <a-button type="link" v-if="$access('ENT_ISV_PAY_CONFIG_LIST')" @click="showPayIfConfigList(record.isvNo)">支付配置</a-button>
            <a-button type="link" v-if="$access('ENT_ISV_INFO_DEL')" style="color: red" @click="delFunc(record.isvNo)">删除</a-button>
          </JeepayTableColumns>
        </template>
      </JeepayTable>
    </a-card>
    <!-- 新增页面组件  -->
    <InfoAddOrEdit ref="infoAddOrEdit" :callbackFunc="searchFunc"/>
    <!-- 支付参数配置页面组件  -->
    <IsvPayIfConfigList ref="isvPayIfConfigList" />
  </page-header-wrapper>
</template>
<script>
import JeepayTable from '@/components/JeepayTable/JeepayTable'
import JeepayTextUp from '@/components/JeepayTextUp/JeepayTextUp' // 文字上移组件
import JeepayTableColumns from '@/components/JeepayTable/JeepayTableColumns'
import { API_URL_ISV_LIST, req } from '@/api/manage'
import InfoAddOrEdit from './AddOrEdit'
import IsvPayIfConfigList from './IsvPayIfConfigList'

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  { key: 'isvName', width: '200px', title: '服务商名称', fixed: 'left', scopedSlots: { customRender: 'isvNameSlot' } },
  { key: 'isvNo', title: '服务商号', dataIndex: 'isvNo' },
  { key: 'state', title: '服务商状态', scopedSlots: { customRender: 'stateSlot' } },
  { key: 'createdAt', dataIndex: 'createdAt', title: '创建日期' },
  { key: 'op', title: '操作', width: '260px', fixed: 'right', align: 'center', scopedSlots: { customRender: 'opSlot' } }
]

export default {
  name: 'IsvListPage',
  components: { JeepayTable, JeepayTableColumns, InfoAddOrEdit, IsvPayIfConfigList, JeepayTextUp },
  data () {
    return {
      btnLoading: false,
      tableColumns: tableColumns,
      searchData: {}
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
      return req.list(API_URL_ISV_LIST, params)
    },
    delFunc: function (recordId) {
      const that = this
      this.$infoBox.confirmDanger('确认删除？', '请确认该服务商下未分配商户', () => {
        req.delById(API_URL_ISV_LIST, recordId).then(res => {
          that.$refs.infoTable.refTable(false)
          this.$message.success('删除成功')
        })
      })
    },
    searchFunc: function () { // 点击【查询】按钮点击事件
      this.$refs.infoTable.refTable(true)
    },
    addFunc: function () { // 业务通用【新增】 函数
      this.$refs.infoAddOrEdit.show()
    },
    editFunc: function (recordId) { // 业务通用【修改】 函数
      this.$refs.infoAddOrEdit.show(recordId)
    },
    showPayIfConfigList: function (recordId) { // 支付参数配置
      this.$refs.isvPayIfConfigList.show(recordId)
    }
  }
}
</script>
