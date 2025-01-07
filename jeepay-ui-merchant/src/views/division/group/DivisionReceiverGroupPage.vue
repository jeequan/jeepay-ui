<template>
  <page-header-wrapper>
    <a-card>
      <div v-if="$access('ENT_DIVISION_RECEIVER_GROUP_LIST')" class="table-page-search-wrapper">
        <a-form layout="inline" class="table-head-ground">
          <div class="table-layer">
            <jeepay-text-up
              :placeholder="'组ID'"
              v-model:value="vdata.searchData.receiverGroupId"
            />
            <jeepay-text-up
              :placeholder="'组名称'"
              v-model:value="vdata.searchData.receiverGroupName"
            />
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
        <div>
          <a-button
            v-if="$access('ENT_DIVISION_RECEIVER_GROUP_ADD')"
            type="primary"
            @click="addFunc"
            class="mg-b-30"
          >
            新建
          </a-button>
        </div>
      </div>

      <!-- 列表渲染 -->
      <JeepayTable
        ref="infoTable"
        :initData="true"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="vdata.tableColumns"
        :searchData="vdata.searchData"
        @btnLoadClose="vdata.btnLoading = false"
        rowKey="receiverGroupId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'op'">
            <!-- 操作列插槽 -->
            <JeepayTableColumns>
              <a
                v-if="$access('ENT_DIVISION_RECEIVER_GROUP_EDIT')"
                @click="editFunc(record.receiverGroupId)"
              >
                修改
              </a>
              <a
                style="color: red"
                v-if="$access('ENT_DIVISION_RECEIVER_GROUP_DELETE')"
                @click="delFunc(record.receiverGroupId)"
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
import { API_URL_DIVISION_RECEIVER_GROUP, req } from '@/api/manage'
import InfoAddOrEdit from './AddOrEdit.vue'
import { reactive, ref, getCurrentInstance } from 'vue'

const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  { key: 'receiverGroupId', dataIndex: 'receiverGroupId', title: '组ID' },
  { key: 'receiverGroupName', dataIndex: 'receiverGroupName', title: '组名称' },
  {
    key: 'autoDivisionFlag',
    dataIndex: 'autoDivisionFlag',
    title: '自动分账组',
    customRender: ({ text }) => (text === 1 ? '是' : '否'),
  },
  { key: 'createdBy', dataIndex: 'createdBy', title: '创建人' },
  { key: 'createdAt', dataIndex: 'createdAt', title: '创建时间' },
  {
    key: 'op',
    title: '操作',
    width: '200px',
    fixed: 'right',
    align: 'center',
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
  return req.list(API_URL_DIVISION_RECEIVER_GROUP, params)
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
    return req.delById(API_URL_DIVISION_RECEIVER_GROUP, recordId).then((res) => {
      $infoBox.message.success('删除成功！')
      infoTable.value.refTable(false)
    })
  })
}
</script>
