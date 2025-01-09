<template>
  <a-drawer
    v-model:open="vdata.open"
    :closable="true"
    :body-style="{ paddingBottom: '80px' }"
    :drawer-style="{ backgroundColor: '#f0f2f5' }"
    width="80%"
    @close="onClose"
  >
    <template #title>
      <a-steps :current="vdata.currentStep" type="navigation" style="width: 80%">
        <a-step title="支付参数配置" @click="stepChange(0)" />
        <a-step title="支付通道配置" @click="stepChange(1)" />
      </a-steps>
    </template>

    <div v-if="vdata.currentStep === 0">
      <JeepayCard
        ref="infoCard"
        :req-card-list-func="reqCardListFunc"
        :span="vdata.jeepayCard.span"
        :height="vdata.jeepayCard.height"
      >
        <template #cardContentSlot="{ record }">
          <div :style="{ height: vdata.jeepayCard.height + 'px' }" class="jeepay-card-content">
            <!-- 卡片自定义样式 -->
            <div
              class="jeepay-card-content-header"
              :style="{
                backgroundColor: record.bgColor,
                height: vdata.jeepayCard.height / 2 + 'px',
              }"
            >
              <img
                v-if="record.icon"
                :src="record.icon"
                :style="{ height: vdata.jeepayCard.height / 5 + 'px' }"
              />
            </div>
            <div
              class="jeepay-card-content-body"
              :style="{ height: vdata.jeepayCard.height / 2 - 50 + 'px' }"
            >
              <div class="title">
                {{ record.ifName }}
              </div>
              <a-badge
                :status="record.ifConfigState === 1 ? 'processing' : 'error'"
                :text="record.ifConfigState === 1 ? '启用' : '未开通'"
              />
            </div>
            <!-- 卡片底部操作栏 -->
            <div class="jeepay-card-ops">
              <a
                v-if="
                  record.mchType == 2 &&
                  record.ifCode == 'alipay' &&
                  $access('ENT_MCH_PAY_CONFIG_ADD')
                "
                @click="toAlipayAuthPageFunc(record)"
              >
                扫码授权
                <a-icon key="right" type="right" style="font-size: 13px" />
              </a>

              <a v-if="$access('ENT_MCH_PAY_CONFIG_ADD')" @click="editPayIfConfigFunc(record)">
                填写参数
                <a-icon key="right" type="right" style="font-size: 13px" />
              </a>
              <a v-else>暂无操作</a>
            </div>
          </div>
        </template>
      </JeepayCard>
    </div>
    <div v-else-if="vdata.currentStep === 1">
      <a-card>
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="4">
              <a-col :md="9">
                <a-form-item label="">
                  <a-input v-model:value="vdata.searchData2.wayCode" placeholder="支付方式代码" />
                </a-form-item>
              </a-col>
              <a-col :md="9">
                <a-form-item label="">
                  <a-input v-model:value="vdata.searchData2.wayName" placeholder="支付方式名称" />
                </a-form-item>
              </a-col>
              <a-col :sm="6">
                <span class="table-page-search-submitButtons">
                  <a-button type="primary" @click="searchFunc(true)">查询</a-button>
                  <a-button style="margin-left: 8px" @click="() => (vdata.searchData2 = {})">
                    重置
                  </a-button>
                </span>
              </a-col>
            </a-row>
          </a-form>
        </div>

        <!-- 列表渲染 -->
        <JeepayTable
          ref="infoTable"
          :init-data="true"
          :req-table-data-func="reqTableDataFunc"
          :table-columns="tableColumns"
          :search-data="vdata.searchData2"
          row-key="wayCode"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'passageState'">
              <a-badge
                :status="record.passageState === 0 ? 'error' : 'processing'"
                :text="record.passageState === 0 ? '禁用' : '启用'"
              />
            </template>
            <template v-if="column.key === 'op'">
              <!-- 操作列插槽 -->
              <JeepayTableColumns>
                <a-button
                  v-if="$access('ENT_MCH_PAY_PASSAGE_CONFIG')"
                  type="link"
                  @click="editPayPassageFunc(record)"
                >
                  配置
                </a-button>
              </JeepayTableColumns>
            </template>
          </template>
        </JeepayTable>
      </a-card>
    </div>
    <div class="drawer-btn-center">
      <a-button :style="{ marginRight: '8px' }" @click="onClose">关闭</a-button>
      <a-button
        v-if="$access('ENT_MCH_PAY_CONFIG_LIST') && vdata.currentStep === 1"
        type="primary"
        @click="stepChange(0)"
      >
        上一步
      </a-button>
      <a-button
        v-if="$access('ENT_MCH_PAY_PASSAGE_LIST') && vdata.currentStep === 0"
        type="primary"
        @click="stepChange(1)"
      >
        下一步
      </a-button>
    </div>

    <!-- 支付参数配置JSON渲染页面组件  -->
    <MchPayConfigAddOrEdit ref="mchPayConfigAddOrEdit" :callback-func="refCardList" />
    <!-- 支付参数配置自定义页面组件 wxpay  -->
    <WxpayPayConfig ref="wxpayPayConfig" :callback-func="refCardList" />
    <!-- 支付参数配置自定义页面组件 alipay  -->
    <AlipayPayConfig ref="alipayPayConfig" :callback-func="refCardList" />
    <!-- 支付通道配置页面组件  -->
    <MchPayPassageAddOrEdit ref="mchPayPassageAddOrEdit" :callback-func="searchFunc" />
    <!-- 支付宝授权弹层  -->
    <AlipayAuth ref="alipayAuthPage" :callback-func="refCardList" />
  </a-drawer>
</template>

<script setup lang="ts">
import {
  API_URL_MCH_PAYCONFIGS_LIST,
  API_URL_MCH_PAYPASSAGE_LIST,
  req,
  getAvailablePayInterfaceList,
} from '@/api/manage'
import MchPayConfigAddOrEdit from './MchPayConfigAddOrEdit.vue'
import MchPayPassageAddOrEdit from './MchPayPassageAddOrEdit.vue'
import WxpayPayConfig from './custom/WxpayPayConfig.vue'
import AlipayPayConfig from './custom/AlipayPayConfig.vue'
import AlipayAuth from './AlipayAuth.vue'
import { reactive, ref, getCurrentInstance } from 'vue'
const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

// eslint-disable-next-line no-unused-vars
const tableColumns = [
  { key: 'wayCode', title: '支付方式代码', dataIndex: 'wayCode' },
  { key: 'wayName', title: '支付方式名称', dataIndex: 'wayName' },
  { key: 'passageState', title: '状态', scopedSlots: { customRender: 'stateSlot' } },
  {
    key: 'op',
    title: '操作',
    width: '200px',
    fixed: 'right',
    align: 'center',
    scopedSlots: { customRender: 'opSlot' },
  },
]

const infoCard = ref()
const infoTable = ref()
const mchPayConfigAddOrEdit = ref()
const mchPayPassageAddOrEdit = ref()
const wxpayPayConfig = ref()
const alipayPayConfig = ref()
const alipayAuthPage = ref()

const vdata: any = reactive({
  currentStep: 0, // 当前步骤条index
  btnLoading: false,
  appId: null, // 应用appId
  open: false, // 抽屉开关
  jeepayCard: {
    // 卡片配置
    height: 300,
    span: { xxl: 6, xl: 4, lg: 4, md: 3, sm: 2, xs: 1 },
  },
  tableColumns: tableColumns,
  searchData2: {},
})

// 弹层打开事件
function show(appId) {
  vdata.appId = appId
  vdata.ifCode = null
  vdata.currentStep = 0
  vdata.open = true
  refCardList()
}
// 步骤条切换
function stepChange(current) {
  vdata.currentStep = current
}
// 请求支付接口定义数据
function reqCardListFunc() {
  return req.list(API_URL_MCH_PAYCONFIGS_LIST, { appId: vdata.appId })
}
// 刷新支付接口card列表
function refCardList() {
  if (infoCard.value) {
    infoCard.value.refCardList()
  }
}
// 请求支付通道数据
function reqTableDataFunc(params) {
  return req.list(API_URL_MCH_PAYPASSAGE_LIST, Object.assign(params, { appId: vdata.appId }))
}
function searchFunc(isToFirst = false) {
  // 点击【查询】按钮点击事件
  infoTable.value.refTable(isToFirst)
}

// 支付参数配置
function editPayIfConfigFunc(record) {
  if (!record) return

  console.log(record.configPageType, 'record.configPageType')

  if (record.subMchIsvConfig === 0) {
    $infoBox.message.error({
      title: '提示',
      content: '当前应用所属商户为特约商户，请先配置服务商支付参数！',
    })
  } else if (record.configPageType === 1) {
    mchPayConfigAddOrEdit.value.show(vdata.appId, record)
  } else if (record.configPageType === 2) {
    if (record.ifCode == 'wxpay') {
      wxpayPayConfig.value.show(vdata.appId, record)
    } else if (record.ifCode == 'alipay') {
      alipayPayConfig.value.show(vdata.appId, record)
    }
  }
}
// 支付通道配置
function editPayPassageFunc(record) {
  getAvailablePayInterfaceList(vdata.appId, record.wayCode).then((resData) => {
    if (!resData || resData.length === 0) {
      $infoBox.message.error({
        title: '提示',
        content: '暂无可用支付接口配置',
      })
    } else {
      mchPayPassageAddOrEdit.value.show(vdata.appId, record.wayCode)
    }
  })
}
// 抽屉关闭
function onClose() {
  vdata.open = false
}

// 支付宝子商户 扫码授权
function toAlipayAuthPageFunc(record) {
  if (!record) return
  if (record.subMchIsvConfig === 0) {
    return $infoBox.message.error({
      title: '提示',
      content: '当前应用所属商户为特约商户，请先配置服务商支付参数！',
    })
  }
  alipayAuthPage.value.show(vdata.appId)
}

defineExpose({ show })
</script>

<style lang="less" scoped>
.jeepay-card-content {
  width: 100%;
  position: relative;
  background-color: @jee-card-back;
  border-radius: 6px;
  overflow: hidden;
}
.jeepay-card-ops {
  width: 100%;
  height: 50px;
  background-color: @jee-card-back;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid @jee-back;
  position: absolute;
  bottom: 0;
}
.jeepay-card-content-header {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.jeepay-card-content-body {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}
.title {
  font-size: 16px;
  font-family:
    PingFang SC,
    PingFang SC-Bold;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 1px;
}
</style>
