<template>
  <page-header-wrapper>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline" class="table-head-ground">
          <div class="table-layer">
            <jeepay-text-up :placeholder="'商户号'" :msg="searchData.mchNo" v-model="searchData.mchNo"/>
            <jeepay-text-up :placeholder="'服务商号'" :msg="searchData.isvNo" v-model="searchData.isvNo"/>
            <jeepay-text-up :placeholder="'商户名称'" :msg="searchData.mchName" v-model="searchData.mchName"/>
            <a-form-item label="" class="table-head-layout">
              <a-select v-model="searchData.state" placeholder="商户状态" default-value="">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="0">禁用</a-select-option>
                <a-select-option value="1">启用</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="" class="table-head-layout">
              <a-select v-model="searchData.type" placeholder="商户类型" default-value="">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="1">普通商户</a-select-option>
                <a-select-option value="2">特约商户</a-select-option>
              </a-select>
            </a-form-item>
            <span class="table-page-search-submitButtons" style="flex-grow: 0; flex-shrink: 0;">
              <a-button type="primary" icon="search" @click="queryFunc" :loading="btnLoading">查询</a-button>
              <a-button style="margin-left: 8px" icon="reload" @click="() => this.searchData = {}">重置</a-button>
            </span>
          </div>
        </a-form>
        <div>
          <a-button v-if="$access('ENT_MCH_INFO_ADD')" type="primary" icon="plus" @click="addFunc" class="mg-b-30">新建</a-button>
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
        :scrollX="1200"
        rowKey="mchName"
      >
        <template slot="mchNameSlot" slot-scope="{record}">
          <b v-if="!$access('ENT_MCH_INFO_VIEW')">{{ record.mchName }}</b>
          <a v-if="$access('ENT_MCH_INFO_VIEW')" @click="detailFunc(record.mchNo)">{{ record.mchName }}</a>
        </template> <!-- 自定义插槽 -->
        <template slot="stateSlot" slot-scope="{record}">
          <a-badge :status="record.state === 0?'error':'processing'" :text="record.state === 0?'禁用':'启用'" />
        </template>
        <template slot="typeSlot" slot-scope="{record}">
          <a-tag :color="record.type === 1 ? 'green' : 'orange'">
            {{ record.type === 1 ? '普通商户':'特约商户' }}
          </a-tag>
        </template>
        <template slot="opSlot" slot-scope="{record}">  <!-- 操作列插槽 -->
          <JeepayTableColumns>
            <a-button type="link" v-if="$access('ENT_MCH_INFO_EDIT')" @click="editFunc(record.mchNo)">修改</a-button>
            <a-button type="link" v-if="$access('ENT_MCH_APP_CONFIG')" @click="mchAppConfig(record.mchNo)">应用配置</a-button>
            <a-button type="link" v-if="$access('ENT_MCH_INFO_DEL')" style="color: red" @click="delFunc(record.mchNo)">删除</a-button>
          </JeepayTableColumns>
        </template>
      </JeepayTable>
    </a-card>
    <!-- 新增页面组件  -->
    <InfoAddOrEdit ref="infoAddOrEdit" :callbackFunc="searchFunc"/>
    <!-- 新增页面组件  -->
    <InfoDetail ref="infoDetail" :callbackFunc="searchFunc"/>
  </page-header-wrapper>
</template>
<script>
import JeepayTable from '@/components/JeepayTable/JeepayTable'
import JeepayTextUp from '@/components/JeepayTextUp/JeepayTextUp' // 文字上移组件
import JeepayTableColumns from '@/components/JeepayTable/JeepayTableColumns'
import { API_URL_MCH_LIST, req, reqLoad } from '@/api/manage'
import InfoAddOrEdit from './AddOrEdit'
import InfoDetail from './Detail'

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  { key: 'mchName', fixed: 'left', width: '200px', title: '商户名称', scopedSlots: { customRender: 'mchNameSlot' } },
  { key: 'mchNo', title: '商户号', dataIndex: 'mchNo' },
  { key: 'isvNo', title: '服务商号', dataIndex: 'isvNo' },
  { key: 'state', title: '状态', width: '130px', scopedSlots: { customRender: 'stateSlot' } },
  { key: 'type', title: '商户类型', width: '130px', scopedSlots: { customRender: 'typeSlot' } },
  { key: 'createdAt', dataIndex: 'createdAt', title: '创建日期' },
  { key: 'op', title: '操作', width: '260px', fixed: 'right', align: 'center', scopedSlots: { customRender: 'opSlot' } }
]

export default {
  name: 'MchListPage',
  components: { JeepayTable, JeepayTableColumns, InfoAddOrEdit, InfoDetail, JeepayTextUp },
  data () {
    return {
      btnLoading: false,
      tableColumns: tableColumns,
      searchData: {},
      value: "''"
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
      return req.list(API_URL_MCH_LIST, params)
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
    detailFunc: function (recordId) { // 商户详情页
      this.$refs.infoDetail.show(recordId)
    },
    // 删除商户
    delFunc: function (recordId) {
      const that = this
      this.$infoBox.confirmDanger('确认删除？', '该操作将删除商户下所有配置及用户信息', () => {
        reqLoad.delById(API_URL_MCH_LIST, recordId).then(res => {
          that.$refs.infoTable.refTable(true)
          this.$message.success('删除成功')
        })
      })
    },
    mchAppConfig: function (recordId) { // 应用配置
      this.$router.push({
        path: '/apps',
        query: { mchNo: recordId }
      })
    }
  }
}
</script>
