<template>
  <page-header-wrapper>
    <a-card>

      <div class="table-page-search-wrapper">
        <a-form layout="inline" style="margin-bottom:30px">
          <a-row :gutter="16">
            <a-col :sm="18">
              <a-row :gutter="16">
                <a-col :md="6">
                  <a-form-item label="">
                    <a-select v-model="querySysType" placeholder="选择系统菜单" @change="refTable" class="table-head-layout">
                      <a-select-option value="MGR">显示菜单：运营平台</a-select-option>
                      <a-select-option value="MCH">显示菜单：商户系统</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <a-table
        :columns="tableColumns"
        :data-source="dataSource"
        :pagination="false"
        :loading="loading"
        rowKey="entId"
        :scroll="{ x: 1450 }">
        <template slot="stateSlot" slot-scope="record">
          <JeepayTableColState :state="record.state" :showSwitchType="$access('ENT_UR_ROLE_ENT_EDIT')" :onChange="(state) => { return updateState(record.entId, state)}"/>
        </template>
        <template slot="opSlot" slot-scope="record">  <!-- 操作列插槽 -->
          <JeepayTableColumns>
            <a v-if="$access('ENT_UR_ROLE_ENT_EDIT')" @click="editFunc(record.entId)">修改</a>
          </JeepayTableColumns>
        </template>
      </a-table>
    </a-card>

    <!-- 新增 / 修改 页面组件  -->
    <InfoAddOrEdit ref="infoAddOrEdit" :callbackFunc="refTable" />

  </page-header-wrapper>

</template>
<script>
import { getEntTree, API_URL_ENT_LIST, reqLoad } from '@/api/manage'
import JeepayTableColState from '@/components/JeepayTable/JeepayTableColState'
import JeepayTableColumns from '@/components/JeepayTable/JeepayTableColumns'
import InfoAddOrEdit from './AddOrEdit'

const tableColumns = [
  { title: '资源权限ID', dataIndex: 'entId' }, // key为必填项，用于标志该列的唯一
  { title: '资源名称', dataIndex: 'entName' },
  { title: '图标', dataIndex: 'menuIcon' },
  { title: '路径', dataIndex: 'menuUri' },
  { title: '组件名称', dataIndex: 'componentName' },
  { title: '类型', dataIndex: 'entType' },
  { title: '状态', scopedSlots: { customRender: 'stateSlot' }, align: 'center' },
  { title: '排序', dataIndex: 'entSort' },
  { title: '修改时间', dataIndex: 'updatedAt' },
  { title: '操作', width: '100px', fixed: 'right', align: 'center', scopedSlots: { customRender: 'opSlot' } }
]

export default {
  name: 'EntPage',
  components: { JeepayTableColState, JeepayTableColumns, InfoAddOrEdit },
  data () {
    return {
      querySysType: 'MGR', // 默认查询运营平台
      tableColumns: tableColumns,
      dataSource: [],
      loading: false
    }
  },
  mounted () {
    this.refTable() // 刷新页面
  },
  methods: {

    refTable: function () {
      const that = this
      that.loading = true
      getEntTree(that.querySysType).then(res => {
        that.dataSource = res
        that.loading = false
      })
    },

    updateState: function (recordId, state) {
      const that = this
      return reqLoad.updateById(API_URL_ENT_LIST, recordId, { state: state, sysType: that.querySysType }).then(res => {
        that.$message.success('更新成功')
        that.refTable() // 刷新页面
      })
    },

    editFunc: function (recordId) { // 业务通用【修改】 函数
      this.$refs.infoAddOrEdit.show(recordId, this.querySysType)
    }
  }
}
</script>
