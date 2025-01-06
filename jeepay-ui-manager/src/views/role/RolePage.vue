<template>
  <page-header-wrapper>
    <a-card>
      <div v-if="$access('ENT_UR_ROLE_SEARCH')" class="table-page-search-wrapper">
        <a-form layout="inline" class="table-head-ground">
          <div class="table-layer">
            <jeepay-text-up :placeholder="'角色ID'" v-model="vdata.searchData.roleId" />
            <jeepay-text-up :placeholder="'角色名称'" v-model="vdata.searchData.roleName" />
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchFunc" :loading="vdata.btnLoading">
                查询
              </a-button>
              <a-button style="margin-left: 8px" @click="() => (vdata.searchData = {})">
                重置
              </a-button>
            </span>
          </div>
        </a-form>
      </div>

      <!-- 列表渲染 -->
      <JeepayTable
        ref="infoTable"
        :initData="true"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="vdata.tableColumns"
        :searchData="vdata.searchData"
        @btnLoadClose="vdata.btnLoading = false"
        rowKey="roleName"
      >
        <template #opRow>
          <a-button
            v-if="$access('ENT_UR_ROLE_ADD')"
            type="primary"
            @click="addFunc"
            class="mg-b-30"
          >
            新建
          </a-button>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'roleId'">
            <b>{{ record.roleId }}</b>
          </template>
          <!-- 自定义插槽 -->
          <template v-if="column.key === 'op'">
            <!-- 操作列插槽 -->
            <JeepayTableColumns>
              <a v-if="$access('ENT_UR_ROLE_EDIT')" @click="editFunc(record.roleId)">修改</a>
              <a
                style="color: red"
                v-if="$access('ENT_UR_ROLE_DEL')"
                @click="delFunc(record.roleId)"
              >
                删除
              </a>
            </JeepayTableColumns>
          </template>
        </template>
      </JeepayTable>
    </a-card>

    <!-- 新增 / 修改 页面组件  -->
    <InfoAddOrEdit ref="infoAddOrEdit" :callbackFunc="searchFunc" />
  </page-header-wrapper>
</template>
<script setup lang="ts">
import { API_URL_ROLE_LIST, req } from '@/api/manage'
import InfoAddOrEdit from './AddOrEdit.vue'
import { reactive, ref, getCurrentInstance } from 'vue'

const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  {
    key: 'roleId', // key为必填项，用于标志该列的唯一
    title: '角色ID',
    sorter: true,
    fixed: 'left',
    scopedSlots: { customRender: 'roleIdSlot' },
  },
  {
    key: 'roleName',
    title: '角色名称',
    dataIndex: 'roleName',
    sorter: true,
  },
  {
    key: 'op',
    title: '操作',
    width: '200px',
    fixed: 'right',
    align: 'center',
    scopedSlots: { customRender: 'opSlot' },
  },
]

const vdata: any = reactive({
  tableColumns: tableColumns,
  searchData: {},
  btnLoading: false,
})

const infoTable = ref()
const infoAddOrEdit = ref()

// 请求table接口数据
function reqTableDataFunc(params) {
  return req.list(API_URL_ROLE_LIST, params)
}

function searchFunc() {
  // 点击【查询】按钮点击事件
  vdata.btnLoading = true // 打开查询按钮上的loading
  infoTable.value.refTable(true)
}

function addFunc() {
  // 业务通用【新增】 函数
  infoAddOrEdit.value.show()
}

function editFunc(recordId) {
  // 业务通用【修改】 函数
  infoAddOrEdit.value.show(recordId)
}

function delFunc(recordId) {
  // 业务通用【删除】 函数
  $infoBox.confirmDanger('确认删除？', '', () => {
    // 需要【按钮】loading 请返回 promise对象， 不需要请直接返回null
    return req.delById(API_URL_ROLE_LIST, recordId).then((res) => {
      $infoBox.message.success('删除成功！')
      infoTable.value.refTable(false)
    })
  })
}
</script>
