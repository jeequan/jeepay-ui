<template>
  <page-header-wrapper>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline" v-if="$access('ENT_PC_WAY_SEARCH')" class="table-head-ground">
          <div class="table-layer">
            <jeepay-text-up :placeholder="'支付方式代码'" :msg="searchData.wayCode" v-model="searchData.wayCode" />
            <jeepay-text-up :placeholder="'支付方式名称'" :msg="searchData.wayName" v-model="searchData.wayName" />
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchFunc(true)" icon="search" :loading="btnLoading">查询</a-button>
              <a-button style="margin-left: 8px;" @click="() => this.searchData = {}" icon="reload">重置</a-button>
            </span>
          </div>
        </a-form>
        <a-button v-if="$access('ENT_PC_WAY_ADD')" type="primary" icon="plus" @click="addFunc" class="mg-b-30">新建</a-button>
      </div>

      <!-- 列表渲染 -->
      <JeepayTable
        @btnLoadClose="btnLoading=false"
        ref="infoTable"
        :initData="true"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="tableColumns"
        :searchData="searchData"
        rowKey="wayCode"
        :scrollX="500"
      >
        <template slot="wayCodeSlot" slot-scope="{record}"><b>{{ record.wayCode }}</b></template> <!-- 自定义插槽 -->
        <template slot="opSlot" slot-scope="{record}">  <!-- 操作列插槽 -->
          <JeepayTableColumns>
            <a v-if="$access('ENT_PC_WAY_EDIT')" @click="editFunc(record.wayCode)">修改</a>
            <a style="color: red" v-if="$access('ENT_PC_WAY_DEL')" @click="delFunc(record.wayCode)">删除</a>
          </JeepayTableColumns>
        </template>
      </JeepayTable>
    </a-card>

    <!-- 新增页面组件  -->
    <InfoAddOrEdit ref="infoAddOrEdit" :callbackFunc="searchFunc"/>
  </page-header-wrapper>

</template>
<script>
import JeepayTable from '@/components/JeepayTable/JeepayTable'
import JeepayTableColumns from '@/components/JeepayTable/JeepayTableColumns'
import { API_URL_PAYWAYS_LIST, req } from '@/api/manage'
import InfoAddOrEdit from './AddOrEdit'
import JeepayTextUp from '@/components/JeepayTextUp/JeepayTextUp' // 文字上移组件
// eslint-disable-next-line no-unused-vars
const tableColumns = [
  {
    key: 'wayCode', // key为必填项，用于标志该列的唯一
    fixed: 'left',
    title: '支付方式代码',
    scopedSlots: { customRender: 'wayCodeSlot' }
  },
  {
    key: 'wayName',
    title: '支付方式名称',
    dataIndex: 'wayName'
  },
  {
    key: 'op',
    title: '操作',
    width: '200px',
    fixed: 'right',
    align: 'center',
    scopedSlots: { customRender: 'opSlot' }
  }
]

export default {
  name: 'PayWayPage',
  components: { JeepayTable, JeepayTableColumns, InfoAddOrEdit, JeepayTextUp },
  data () {
    return {
      tableColumns: tableColumns,
      searchData: {},
      btnLoading: false
    }
  },
  methods: {

    // 请求table接口数据
    reqTableDataFunc: (params) => {
      return req.list(API_URL_PAYWAYS_LIST, params)
    },

    searchFunc (isToFirst = false) { // 点击【查询】按钮点击事件
      this.btnLoading = true
      this.$refs.infoTable.refTable(isToFirst)
    },

    addFunc: function () { // 业务通用【新增】 函数
      this.$refs.infoAddOrEdit.show()
    },

    editFunc: function (wayCode) { // 业务通用【修改】 函数
      this.$refs.infoAddOrEdit.show(wayCode)
    },

    delFunc: function (wayCode) {
      const that = this
      this.$infoBox.confirmDanger('确认删除？', '', () => {
        req.delById(API_URL_PAYWAYS_LIST, wayCode).then(res => {
          that.$message.success('删除成功！')
          that.$refs.infoTable.refTable(false)
        })
      })
    }
  }
}
</script>
