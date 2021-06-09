<template>
  <page-header-wrapper>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline" class="table-head-ground">
          <div class="table-layer">
            <jeepay-text-up :placeholder="'支付方式代码'" :msg="searchData2.wayCode" v-model="searchData2.wayCode" />

            <jeepay-text-up :placeholder="'支付方式名称'" :msg="searchData2.wayName" v-model="searchData2.wayName" />

            <span class="table-page-search-submitButtons" >
              <a-button type="primary" icon="search" @click="searchFunc(true)">查询</a-button>
              <a-button style="margin-left: 8px" icon="reload" @click="() => this.searchData2 = {}">重置</a-button>
            </span>
          </div>
        </a-form>
      </div>

      <!-- 列表渲染 -->
      <JeepayTable
        ref="infoTable"
        :initData="true"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="tableColumns"
        :searchData="searchData2"
        :scrollX="600"
        rowKey="wayCode"
      >
        <template slot="stateSlot" slot-scope="{record}">
          <a-badge :status="record.passageState === 0?'error':'processing'" :text="record.passageState === 0?'禁用':'启用'" />
        </template>
        <template slot="opSlot" slot-scope="{record}">  <!-- 操作列插槽 -->
          <JeepayTableColumns>
            <a-button type="link" v-if="$access('ENT_MCH_PAY_PASSAGE_CONFIG')" @click="editFunc(record)">配置</a-button>
          </JeepayTableColumns>
        </template>
      </JeepayTable>
    </a-card>
    <!-- 配置通道页面组件  -->
    <MchPayPassageAddOrEdit ref="mchPayPassageAddOrEdit" :callbackFunc="searchFunc"/>
  </page-header-wrapper>
</template>
<script>
import JeepayTable from '@/components/JeepayTable/JeepayTable'
import JeepayTableColumns from '@/components/JeepayTable/JeepayTableColumns'
import { API_URL_MCH_PAYPASSAGE_LIST, req, getAvailablePayInterfaceList } from '@/api/manage'
import MchPayPassageAddOrEdit from './MchPayPassageAddOrEdit'
import JeepayTextUp from '@/components/JeepayTextUp/JeepayTextUp' // 文字上移组件

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  { key: 'wayCode', title: '支付方式代码', dataIndex: 'wayCode' },
  { key: 'wayName', title: '支付方式名称', dataIndex: 'wayName' },
  { key: 'passageState', title: '状态', scopedSlots: { customRender: 'stateSlot' } },
  { key: 'op', title: '操作', width: '100px', fixed: 'right', align: 'center', scopedSlots: { customRender: 'opSlot' } }
]

export default {
  name: 'MchPassageList',
  components: { JeepayTable, JeepayTableColumns, MchPayPassageAddOrEdit, JeepayTextUp },
  data () {
    return {
      tableColumns: tableColumns,
      searchData2: {},
      visible: false // 抽屉开关
    }
  },
  methods: {
    // 请求table接口数据
    reqTableDataFunc (params) {
      return req.list(API_URL_MCH_PAYPASSAGE_LIST, params)
    },
    searchFunc (isToFirst = false) { // 点击【查询】按钮点击事件
      this.$refs.infoTable.refTable(isToFirst)
    },
    editFunc: function (record) { // 配置通道
      const that = this
      getAvailablePayInterfaceList(record.wayCode).then(resData => {
        if (!resData || resData.length === 0) {
          that.$error({
            title: '提示',
            content: '暂无可用支付接口配置'
          })
        } else {
          that.$refs.mchPayPassageAddOrEdit.show(record.wayCode)
        }
      })
    },
    // 抽屉关闭
    onClose () {
      this.visible = false
    }
  }
}
</script>
