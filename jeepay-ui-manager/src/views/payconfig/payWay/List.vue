<template>
  <page-header-wrapper>
    <a-card>
      <div class="table-page-search-wrapper">
        <a-form layout="inline" v-if="$access('ENT_PC_WAY_SEARCH')" class="table-head-ground">
          <div class="table-layer">
            <jeepay-text-up
              :placeholder="'支付方式代码'"
              v-model:value="vdata.searchData.wayCode"
            />
            <jeepay-text-up
              :placeholder="'支付方式名称'"
              v-model:value="vdata.searchData.wayName"
            />
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchFunc(true)" :loading="vdata.btnLoading">
                查询
              </a-button>
              <a-button style="margin-left: 8px" @click="() => (vdata.searchData = {})">
                重置
              </a-button>
            </span>
          </div>
        </a-form>
        <a-button v-if="$access('ENT_PC_WAY_ADD')" type="primary" @click="addFunc" class="mg-b-30">
          新建
        </a-button>
      </div>

      <!-- 列表渲染 -->
      <JeepayTable
        @btnLoadClose="vdata.btnLoading = false"
        ref="infoTable"
        :initData="true"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="tableColumns"
        :searchData="vdata.searchData"
        rowKey="wayCode"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'wayCode'">
            <b>{{ record.wayCode }}</b>
          </template>
          <!-- 自定义插槽 -->
          <template v-if="column.key === 'op'">
            <!-- 操作列插槽 -->
            <JeepayTableColumns>
              <a v-if="$access('ENT_PC_WAY_EDIT')" @click="editFunc(record.wayCode)">修改</a>
              <a type="danger" v-if="$access('ENT_PC_WAY_DEL')" @click="delFunc(record.wayCode)">
                删除
              </a>
            </JeepayTableColumns>
          </template>
        </template>
      </JeepayTable>
    </a-card>

    <!-- 新增页面组件  -->
    <InfoAddOrEdit ref="infoAddOrEdit" :callbackFunc="searchFunc" />
  </page-header-wrapper>
</template>
<script setup lang="ts">
import { API_URL_PAYWAYS_LIST, req } from '@/api/manage'
import InfoAddOrEdit from './AddOrEdit.vue'
import { reactive, ref, nextTick, getCurrentInstance } from 'vue'

const { $infoBox, $access, $hasAgentEnt } = getCurrentInstance()!.appContext.config.globalProperties

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  {
    key: 'wayCode', // key为必填项，用于标志该列的唯一
    fixed: 'left',
    title: '支付方式代码',
    scopedSlots: { customRender: 'wayCodeSlot' },
  },
  {
    key: 'wayName',
    title: '支付方式名称',
    dataIndex: 'wayName',
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
  return req.list(API_URL_PAYWAYS_LIST, params)
}

function searchFunc(isToFirst = false) {
  // 点击【查询】按钮点击事件
  vdata.btnLoading = true
  infoTable.value.refTable(isToFirst)
}

function addFunc() {
  // 业务通用【新增】 函数
  infoAddOrEdit.value.show()
}

function editFunc(wayCode) {
  // 业务通用【修改】 函数
  infoAddOrEdit.value.show(wayCode)
}

function delFunc(wayCode) {
  $infoBox.confirmDanger('确认删除？', '', () => {
    req.delById(API_URL_PAYWAYS_LIST, wayCode).then((res) => {
      $infoBox.message.success('删除成功！')
      infoTable.value.refTable(false)
    })
  })
}
</script>
