<template>
  <page-header-wrapper>
    <a-card>
      <div v-if="$access('ENT_UR_USER_SEARCH')" class="table-page-search-wrapper">
        <a-form layout="inline" class="table-head-ground">
          <div class="table-layer">
            <jeepay-text-up :placeholder="'用户ID'" :msg="searchData.sysUserId" v-model="searchData.sysUserId" />
            <jeepay-text-up :placeholder="'用户姓名'" :msg="searchData.realname" v-model="searchData.realname" />
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchFunc" icon="search" :loading="btnLoading">查询</a-button>
              <a-button style="margin-left: 8px;" @click="() => this.searchData = {}" icon="reload">重置</a-button>
            </span>
          </div>
        </a-form>

        <div>
          <a-button v-if="$access('ENT_UR_USER_ADD')" type="primary" icon="plus" @click="addFunc" class="mg-b-30">新建</a-button>
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
        rowKey="sysUserId"
        :scrollX="1350"
      >

        <template slot="avatarSlot" slot-scope="{record}">
          <a-avatar size="default" :src="record.avatarUrl" />
        </template>

        <template slot="stateSlot" slot-scope="{record}">
          <JeepayTableColState :state="record.state" :showSwitchType="$access('ENT_UR_USER_EDIT')" :onChange="(state) => { return updateState(record.sysUserId, state)}"/>
        </template>

        <template slot="opSlot" slot-scope="{record}">  <!-- 操作列插槽 -->
          <JeepayTableColumns>
            <a v-if="$access('ENT_UR_USER_UPD_ROLE')" @click="roleDist(record.sysUserId)" >变更角色</a>
            <a v-if="$access('ENT_UR_USER_EDIT')" @click="editFunc(record.sysUserId)">修改</a>
            <a v-if="$access('ENT_UR_USER_DELETE')" style="color: red" @click="delFunc(record.sysUserId)">删除</a>
          </JeepayTableColumns>
        </template>
      </JeepayTable>
    </a-card>

    <!-- 新增 / 修改 页面组件  -->
    <InfoAddOrEdit ref="infoAddOrEdit" :callbackFunc="searchFunc"/>

    <!-- 分配角色 页面组件  -->
    <RoleDist ref="roleDist"/>

  </page-header-wrapper>

</template>
<script>
import JeepayTable from '@/components/JeepayTable/JeepayTable'
import JeepayTableColumns from '@/components/JeepayTable/JeepayTableColumns'
import JeepayTableColState from '@/components/JeepayTable/JeepayTableColState'
import { API_URL_SYS_USER_LIST, req, reqLoad } from '@/api/manage'
import InfoAddOrEdit from './AddOrEdit'
import RoleDist from './RoleDist'
import JeepayTextUp from '@/components/JeepayTextUp/JeepayTextUp' // 文字上移组件

const tableColumns = [
  { title: '用户ID', dataIndex: 'sysUserId', fixed: 'left' },
  { title: '姓名', dataIndex: 'realname' },
  { title: '性别', dataIndex: 'sex', customRender: (text, record, index) => { return record.sex === 1 ? '男' : record.sex === 2 ? '女' : '未知' } },
  { title: '头像', scopedSlots: { customRender: 'avatarSlot' } },
  { title: '编号', dataIndex: 'userNo' },
  { title: '手机号', dataIndex: 'telphone' },
  { title: '超管', dataIndex: 'isAdmin', customRender: (text, record, index) => { return record.isAdmin === 1 ? '是' : '否' } },
  { title: '状态', scopedSlots: { customRender: 'stateSlot' }, align: 'center' },
  { title: '创建时间', dataIndex: 'createdAt' },
  { title: '修改时间', dataIndex: 'updatedAt' },
  {
    key: 'op',
    title: '操作',
    width: 200,
    fixed: 'right',
    align: 'center',
    scopedSlots: { customRender: 'opSlot' }
  }
]

export default {
  components: { JeepayTable, JeepayTableColumns, InfoAddOrEdit, RoleDist, JeepayTableColState, JeepayTextUp },
  data () {
    return {
      tableColumns: tableColumns,
      searchData: {},
      btnLoading: false
    }
  },
  mounted () {
  },
  methods: {

    // 请求table接口数据
    reqTableDataFunc: (params) => {
      return req.list(API_URL_SYS_USER_LIST, params)
    },

    searchFunc: function () { // 点击【查询】按钮点击事件
      this.btnLoading = true // 打开查询按钮的loading
      this.$refs.infoTable.refTable(true)
    },

    addFunc: function () { // 业务通用【新增】 函数
      this.$refs.infoAddOrEdit.show()
    },

    editFunc: function (recordId) { // 业务通用【修改】 函数
      this.$refs.infoAddOrEdit.show(recordId)
    },

    delFunc: function (recordId) { // 业务通用【删除】 函数
      const that = this
      this.$infoBox.confirmDanger('确认删除？', '', () => {
        return req.delById(API_URL_SYS_USER_LIST, recordId).then(res => {
          that.$message.success('删除成功！')
          that.$refs.infoTable.refTable(false)
        })
      })
    },

    roleDist: function (recordId) { // 【分配权限】 按钮点击事件
      this.$refs.roleDist.show(recordId)
    },
    updateState: function (recordId, state) { // 【更新状态】
      const that = this
      const title = state === 1 ? '确认[启用]该用户？' : '确认[停用]该用户？'
      const content = state === 1 ? '启用后用户可进行登陆等一系列操作' : '停用后该用户将立即退出系统并不可再次登陆'

      return new Promise((resolve, reject) => {
        that.$infoBox.confirmDanger(title, content, () => {
          return reqLoad.updateById(API_URL_SYS_USER_LIST, recordId, { state: state }).then(res => {
            that.searchFunc()
            resolve()
          }).catch(err => reject(err))
        },
          () => {
          reject(new Error())
        })
      })
    }
  }
}
</script>
