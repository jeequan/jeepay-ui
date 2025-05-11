<template>
  <page-header-wrapper>
    <a-card>
      <div v-if="$access('ENT_DIVISION_RECEIVER_LIST')" class="table-page-search-wrapper">
        <a-form layout="inline" class="table-head-ground">
          <div class="table-layer">
            <a-select
              v-model:value="vdata.searchData.appId"
              placeholder="选择应用"
              class="table-head-layout"
            >
              <a-select-option key="">全部应用</a-select-option>
              <a-select-option v-for="item in vdata.mchAppList" :key="item.appId">
                {{ item.appName }} [{{ item.appId }}]
              </a-select-option>
            </a-select>

            <jeepay-text-up
              placeholder="分账接收者ID[精准]"
              v-model:value="vdata.searchData.receiverId"
            />
            <jeepay-text-up
              placeholder="接收者账号别名[模糊]"
              v-model:value="vdata.searchData.receiverAlias"
            />
            <jeepay-text-up
              placeholder="组ID[精准]"
              v-model:value="vdata.searchData.receiverGroupId"
            />

            <a-select
              class="table-head-layout"
              v-model:value="vdata.searchData.state"
              placeholder="账号状态（本系统）"
              default-value=""
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="1">正常分账</a-select-option>
              <a-select-option value="0">暂停分账</a-select-option>
            </a-select>

            <span class="table-page-search-submitButtons table-head-layout">
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
        :initData="false"
        :reqTableDataFunc="reqTableDataFunc"
        :tableColumns="vdata.tableColumns"
        :searchData="vdata.searchData"
        @btnLoadClose="vdata.btnLoading = false"
        rowKey="receiverId"
      >
        <template #opRow>
          <a-button v-if="$access('ENT_DIVISION_RECEIVER_ADD')" type="primary" @click="addFunc">
            新建
          </a-button>
        </template>

        <!-- 渠道类型 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ifCode'">
            <template v-if="record.ifCode === 'wxpay'">
              <span style="color: green">
                <a-icon type="wechat" />
                微信
              </span>
            </template>
            <template v-else-if="record.ifCode == 'alipay'">
              <span style="color: dodgerblue">
                <a-icon type="alipay-circle" />
                支付宝
              </span>
            </template>
            <template v-else>{{ record.ifCode }}</template>
          </template>

          <!-- 状态（本系统） -->
          <template template v-if="column.key === 'state'">
            <div v-if="record.state == 0"><a-badge status="error" text="暂停分账" /></div>
            <div v-else-if="record.state == 1"><a-badge status="processing" text="正常分账" /></div>
            <div v-else><a-badge status="warning" text="未知" /></div>
          </template>

          <template v-if="column.key === 'op'">
            <!-- 操作列插槽 -->
            <JeepayTableColumns>
              <a-button
                type="link"
                v-if="$access('ENT_DIVISION_RECEIVER_EDIT')"
                @click="editFunc(record.receiverId)"
              >
                修改
              </a-button>
            </JeepayTableColumns>
          </template>
        </template>
      </JeepayTable>

      <!-- 新增收款账号页面  -->
      <ReceiverAdd ref="receiverAdd" :callbackFunc="searchFunc" />

      <!-- 修改 页面组件  -->
      <ReceiverEdit ref="receiverEdit" :callbackFunc="searchFunc" />
    </a-card>
  </page-header-wrapper>
</template>
<script setup lang="ts">
import { API_URL_DIVISION_RECEIVER, API_URL_MCH_APP, req } from '@/api/manage'
import ReceiverAdd from './ReceiverAdd.vue'
import ReceiverEdit from './ReceiverEdit.vue'
import { reactive, ref, onMounted, getCurrentInstance } from 'vue'

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  { key: 'receiverId', dataIndex: 'receiverId', title: '绑定ID' },
  { key: 'ifCode', title: '渠道类型', scopedSlots: { customRender: 'ifCodeSlot' } },
  { key: 'receiverAlias', dataIndex: 'receiverAlias', title: '账号别名' },
  { key: 'receiverGroupName', dataIndex: 'receiverGroupName', title: '组名称' },
  { key: 'accNo', dataIndex: 'accNo', title: '分账接收账号' },
  { key: 'accName', dataIndex: 'accName', title: '分账接收账号名称' },
  { key: 'relationTypeName', dataIndex: 'relationTypeName', title: '分账关系类型' },
  { title: '状态', key: 'state', scopedSlots: { customRender: 'stateSlot' }, align: 'center' },
  { key: 'bindSuccessTime', dataIndex: 'bindSuccessTime', title: '绑定成功时间' },
  {
    key: 'divisionProfit',
    dataIndex: 'divisionProfit',
    title: '默认分账比例',
    customRender: ({ text }) => {
      return (text * 100).toFixed(2) + '%'
    },
  },
  {
    key: 'op',
    title: '操作',
    width: '100px',
    fixed: 'right',
    align: 'center',
    scopedSlots: { customRender: 'opSlot' },
  },
]

const vdata: any = reactive({
  tableColumns: tableColumns,
  searchData: { appId: '' },
  btnLoading: false,

  mchAppList: [], // 商户app列表
})

const infoTable = ref()
const receiverAdd = ref()
const receiverEdit = ref()

const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

onMounted(() => {
  const that = this // 提前保留this
  // 请求接口，获取所有的appid，只有此处进行pageSize=-1传参
  req.list(API_URL_MCH_APP, { pageSize: -1 }).then((res) => {
    vdata.mchAppList = res.records

    // 默认选中第一个 & 更新列表
    if (vdata.mchAppList && vdata.mchAppList.length > 0) {
      vdata.searchData.appId = vdata.mchAppList[0].appId + ''
      searchFunc()
    }
  })
})
// 请求table接口数据
function reqTableDataFunc(params) {
  return req.list(API_URL_DIVISION_RECEIVER, params)
}

function searchFunc() {
  // 点击【查询】按钮点击事件
  vdata.btnLoading = true // 打开查询按钮上的loading
  infoTable.value.refTable(true)
}

function addFunc() {
  // 业务通用【新增】 函数
  if (vdata.mchAppList.length <= 0) {
    return $infoBox.message.error('当前商户无任何应用，请先创建应用后再试。')
  }
  if (!vdata.searchData.appId) {
    return $infoBox.message.error('请先选择应用。')
  }

  // 打开弹层
  receiverAdd.value.show(
    vdata.mchAppList.filter((item) => item.appId === vdata.searchData.appId)[0]
  )
}

function editFunc(recordId) {
  // 业务通用【修改】 函数
  receiverEdit.value.show(recordId)
}
</script>
