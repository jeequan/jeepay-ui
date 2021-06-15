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
            <jeepay-text-up :placeholder="'用户ID'" :msg="searchData.userId" v-model="searchData.userId" />
            <jeepay-text-up :placeholder="'用户名'" :msg="searchData.userName" v-model="searchData.userName" />
            <a-form-item label="" class="table-head-layout">
              <a-select v-model="searchData.sysType" placeholder="所属系统" default-value="">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="MGR">运营平台</a-select-option>
                <a-select-option value="MCH">商户系统</a-select-option>
              </a-select>
            </a-form-item>

            <span class="table-page-search-submitButtons">
              <a-button type="primary" icon="search" @click="queryhFunc" :loading="btnLoading">搜索</a-button>
              <a-button style="margin-left: 8px" icon="reload" @click="() => this.searchData = {}">重置</a-button>
            </span>
          </div>
        </a-form>
        <div>
          <a-button icon="delete" v-if="$access('ENT_SYS_LOG_DEL')" type="danger" @click="delFunc" class="mg-b-30">删除</a-button>
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
        :rowSelection="rowSelection"
        rowKey="sysLogId"
        :scrollX="1200"
      >
        <template slot="userNameSlot" slot-scope="{record}"><b>{{ record.userName }}</b></template> <!-- 自定义插槽 -->
        <template slot="sysTypeSlot" slot-scope="{record}">
          <a-tag :key="record.sysType" :color="record.sysType === 'MGR'?'green':record.sysType === 'MCH'?'geekblue':'loser'">
            {{ record.sysType === 'MGR'?'运营平台':record.sysType === 'MCH'?'商户系统':'其他' }}
          </a-tag>
        </template>
        <template slot="opSlot" slot-scope="{record}">  <!-- 操作列插槽 -->
          <JeepayTableColumns>
            <a-button type="link" v-if="$access('ENT_SYS_LOG_VIEW')" @click="detailFunc(record.sysLogId)">详情</a-button>
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
        :title="visible === true? '日志详情':''"
        @close="onClose"
      >
        <a-row justify="space-between" type="flex">
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="用户ID">
                {{ detailData.userId }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="用户IP">
                {{ detailData.userIp }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="用户名">
                <b>
                  {{ detailData.userName }}
                </b>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="12">
            <a-descriptions>
              <a-descriptions-item label="所属系统">
                <a-tag :key="detailData.sysType" :color="detailData.sysType === 'MGR'?'green':detailData.sysType === 'MCH'?'geekblue':'loser'">
                  {{ detailData.sysType === 'MGR'?'运营平台':detailData.sysType === 'MCH'?'商户系统':'其他' }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>
        <a-divider />
        <a-row justify="space-between" type="flex">
          <a-col :sm="24">
            <a-descriptions>
              <a-descriptions-item label="操作描述">
                {{ detailData.methodRemark }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="24">
            <a-descriptions>
              <a-descriptions-item label="请求方法">
                {{ detailData.methodName }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :sm="24">
            <a-descriptions>
              <a-descriptions-item label="请求地址">
                {{ detailData.reqUrl }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>
        <a-row justify="start" type="flex">
          <a-col :sm="24">
            <a-form-model-item label="请求参数">
              <a-input
                type="textarea"
                disabled="disabled"
                style="background-color: black;color: #FFFFFF;height: 100px"
                v-model="detailData.optReqParam"
              />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row justify="start" type="flex">
          <a-col :sm="24">
            <a-form-model-item label="响应参数">
              <a-input
                type="textarea"
                disabled="disabled"
                style="background-color: black;color: #FFFFFF;height: 150px"
                v-model="detailData.optResInfo"
              />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-drawer>
    </template>
  </page-header-wrapper>
</template>
<script>
import JeepayTextUp from '@/components/JeepayTextUp/JeepayTextUp' // 文字上移组件
import JeepayTable from '@/components/JeepayTable/JeepayTable'
import JeepayTableColumns from '@/components/JeepayTable/JeepayTableColumns'
import { API_URL_SYS_LOG, req } from '@/api/manage'
import moment from 'moment'
import { message, Modal } from 'ant-design-vue'

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  { key: 'userName', title: '用户名', fixed: 'left', scopedSlots: { customRender: 'userNameSlot' } },
  { key: 'userId', title: '用户ID', dataIndex: 'userId' },
  { key: 'userIp', title: '用户IP', dataIndex: 'userIp' },
  { key: 'sysType', title: '所属系统', scopedSlots: { customRender: 'sysTypeSlot' } },
  { key: 'methodRemark', title: '操作描述', ellipsis: true, dataIndex: 'methodRemark' },
  { key: 'createdAt', dataIndex: 'createdAt', title: '创建日期' },
  { key: 'op', title: '操作', width: '100px', fixed: 'right', align: 'center', scopedSlots: { customRender: 'opSlot' } }
]

export default {
  name: 'IsvListPage',
  components: { JeepayTable, JeepayTableColumns, JeepayTextUp },
  data () {
    return {
      tableColumns: tableColumns,
      searchData: {},
      selectedIds: [], // 选中的数据
      createdStart: '', // 选择开始时间
      createdEnd: '', // 选择结束时间
      visible: false,
      detailData: {},
      btnLoading: false
    }
  },
  computed: {
    rowSelection () {
      const that = this
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          that.selectedIds = [] // 清空选中数组
          selectedRows.forEach(function (data) { // 赋值选中参数
            that.selectedIds.push(data.sysLogId)
          })
        }
      }
    }
  },
  mounted () {
  },
  methods: {
    // 请求table接口数据
    reqTableDataFunc: (params) => {
      return req.list(API_URL_SYS_LOG, params)
    },
    delFunc: function () {
      const that = this
      if (that.selectedIds.length === 0) {
        message.error('请选择要删除的日志')
        return false
      }
      Modal.confirm({
        title: '确认删除' + that.selectedIds.length + '条日志吗？',
        okType: 'danger',
        onOk () {
          req.delById(API_URL_SYS_LOG, that.selectedIds).then(res => {
            that.selectedIds = [] // 清空选中数组
            that.$refs.infoTable.refTable(true)
            that.$message.success('删除成功')
          })
        },
        onCance () {
        }
      })
    },
    searchFunc: function () { // 点击【查询】按钮点击事件
      this.$refs.infoTable.refTable(true)
    },
    detailFunc: function (recordId) {
      const that = this
      req.getById(API_URL_SYS_LOG, recordId).then(res => {
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
    queryhFunc () {
      this.btnLoading = true
      this.$refs.infoTable.refTable(true)
    }
  }
}
</script>
