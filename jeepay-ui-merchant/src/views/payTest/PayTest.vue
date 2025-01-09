<template>
  <div>
    <a-card style="box-sizing: border-box; padding: 30px">
      <!-- 选择下单的应用列表 -->
      <a-form>
        <div style="display: flex; flex-direction: row">
          <!-- <p style="margin-top:9px;margin-right:10px;"></p> -->
          <a-form-item label="" class="table-head-layout">
            <a-select v-model:value="vdata.appId" @change="changeAppId" style="width: 300px">
              <a-select-option key="">应用APPID</a-select-option>
              <a-select-option v-for="item in vdata.mchAppList" :key="item.appId">
                {{ item.appName }} [{{ item.appId }}]
              </a-select-option>
            </a-select>
          </a-form-item>
        </div>
      </a-form>

      <!-- 未配置支付方式提示框 -->
      <a-divider v-if="!vdata.appId">请选择应用APPID</a-divider>
      <a-divider v-else-if="vdata.noConfigText">您尚未配置任何支付方式</a-divider>
      <a-divider v-else></a-divider>

      <!-- 支付测试面板 v-if=""-->
      <div style="width: 100%" class="paydemo" v-if="payTestShow()">
        <div class="paydemo-type-content">
          <div class="paydemo-type-name article-title" v-show="showTitle('WX')">微信支付</div>
          <div class="paydemo-type-body">
            <div
              class="paydemo-type color-change"
              v-show="vdata.appPaywayList.indexOf('WX_NATIVE') >= 0"
              @click="changeCurrentWayCode('WX_NATIVE', 'codeImgUrl')"
              :class="{ this: vdata.currentWayCode === 'WX_NATIVE' }"
            >
              <img src="@/assets/payTestImg/wx_native.svg" class="paydemo-type-img" />
              <span class="color-change">微信二维码</span>
            </div>

            <div
              class="paydemo-type color-change"
              v-show="vdata.appPaywayList.indexOf('WX_BAR') >= 0"
              @click="changeCurrentWayCode('WX_BAR', '')"
              :class="{ this: vdata.currentWayCode === 'WX_BAR' }"
            >
              <img src="@/assets/payTestImg/wx_bar.svg" class="paydemo-type-img" />
              <span class="color-change">微信条码</span>
            </div>

            <div
              class="paydemo-type color-change"
              v-show="vdata.appPaywayList.indexOf('WX_JSAPI') >= 0"
              @click="changeCurrentWayCode('WX_JSAPI', 'codeImgUrl')"
              :class="{ this: vdata.currentWayCode === 'WX_JSAPI' }"
            >
              <img src="@/assets/payTestImg/wx_jsapi.svg" class="paydemo-type-img" />
              <span class="color-change">公众号/小程序</span>
            </div>

            <div
              class="paydemo-type-h5"
              v-show="vdata.appPaywayList.indexOf('WX_H5') >= 0"
              @click="changeCurrentWayCode('WX_H5', 'payurl')"
              :class="{ this: vdata.currentWayCode === 'WX_H5' }"
            >
              <img src="@/assets/payTestImg/wx_h5.svg" class="paydemo-type-img" />
              <span class="color-change">微信H5</span>
            </div>
          </div>

          <div class="paydemo-type-name article-title" v-show="showTitle('ALI')">支付宝支付</div>
          <div class="paydemo-type-body">
            <div
              class="paydemo-type color-change"
              v-show="vdata.appPaywayList.indexOf('ALI_QR') >= 0"
              @click="changeCurrentWayCode('ALI_QR', 'codeImgUrl')"
              :class="{ this: vdata.currentWayCode === 'ALI_QR' }"
            >
              <img src="@/assets/payTestImg/ali_qr.svg" class="paydemo-type-img" />
              <span class="color-change">支付宝二维码</span>
            </div>

            <div
              class="paydemo-type color-change"
              v-show="vdata.appPaywayList.indexOf('ALI_BAR') >= 0"
              @click="changeCurrentWayCode('ALI_BAR', '')"
              :class="{ this: vdata.currentWayCode === 'ALI_BAR' }"
            >
              <img src="@/assets/payTestImg/ali_bar.svg" class="paydemo-type-img" />
              <span class="color-change">支付宝条码</span>
            </div>

            <div
              class="paydemo-type color-change"
              v-show="vdata.appPaywayList.indexOf('ALI_JSAPI') >= 0"
              @click="changeCurrentWayCode('ALI_JSAPI', 'codeImgUrl')"
              :class="{ this: vdata.currentWayCode === 'ALI_JSAPI' }"
            >
              <img src="@/assets/payTestImg/ali_jsapi.svg" class="paydemo-type-img" />
              <span class="color-change">支付宝生活号</span>
            </div>

            <div
              class="paydemo-type color-change"
              v-show="vdata.appPaywayList.indexOf('ALI_PC') >= 0"
              @click="changeCurrentWayCode('ALI_PC', 'payurl')"
              :class="{ this: vdata.currentWayCode === 'ALI_PC' }"
            >
              <img src="@/assets/payTestImg/ali_pc.svg" class="paydemo-type-img" />
              <span class="color-change">支付宝PC网站</span>
            </div>

            <div>
              <div
                class="paydemo-type-h5"
                v-show="vdata.appPaywayList.indexOf('ALI_WAP') >= 0"
                @click="changeCurrentWayCode('ALI_WAP', 'payurl')"
                :class="{ this: vdata.currentWayCode === 'ALI_WAP' }"
              >
                <img src="@/assets/payTestImg/ali_wap.svg" class="paydemo-type-img" />
                <span class="color-change">支付宝WAP</span>
              </div>
            </div>
            <div>
              <div
                class="paydemo-type-h5"
                v-show="vdata.appPaywayList.indexOf('ALI_OC') >= 0"
                @click="changeCurrentWayCode('ALI_OC', 'codeImgUrl')"
                :class="{ this: vdata.currentWayCode === 'ALI_OC' }"
              >
                <img src="@/assets/payTestImg/ali_qr.svg" class="paydemo-type-img" />
                <span class="color-change">支付宝订单码</span>
              </div>
            </div>
          </div>

          <div class="paydemo-type-name article-title" v-show="showQtTitle()">其它支付</div>
          <div class="paydemo-type-body">
            <div
              class="paydemo-type color-change"
              v-show="
                vdata.appPaywayList.indexOf('WX_JSAPI') >= 0 ||
                vdata.appPaywayList.indexOf('ALI_JSAPI') >= 0
              "
              @click="changeCurrentWayCode('QR_CASHIER', 'codeImgUrl')"
              :class="{ this: vdata.currentWayCode === 'QR_CASHIER' }"
            >
              <img src="@/assets/payTestImg/qr_cashier.svg" class="paydemo-type-img" />
              <span class="color-change">聚合主扫</span>
            </div>

            <div
              class="paydemo-type color-change"
              v-show="
                vdata.appPaywayList.indexOf('WX_BAR') >= 0 ||
                vdata.appPaywayList.indexOf('ALI_BAR') >= 0
              "
              @click="changeCurrentWayCode('AUTO_BAR', 'codeImgUrl')"
              :class="{ this: vdata.currentWayCode === 'AUTO_BAR' }"
            >
              <img src="@/assets/payTestImg/auto_bar.svg" class="paydemo-type-img" />
              <span class="color-change">聚合被扫</span>
            </div>

            <div
              class="paydemo-type color-change"
              v-show="vdata.appPaywayList.indexOf('PP_PC') >= 0"
              @click="changeCurrentWayCode('PP_PC', 'payurl')"
              :class="{ this: vdata.currentWayCode === 'PP_PC' }"
            >
              <img src="@/assets/payTestImg/pp_pc.svg" class="paydemo-type-img" />
              <span class="color-change">PayPal支付</span>
            </div>
          </div>
        </div>

        <a-divider></a-divider>
        <!-- 订单信息 -->
        <div class="paydemo-type-content">
          <div class="paydemo-type-name article-title">支付信息</div>
          <form class="layui-form">
            <div class="paydemo-form-item">
              <label>订单编号：</label>
              <span id="payMchOrderNo">{{ vdata.mchOrderNo }}</span>
              <a-button @click="randomOrderNo" type="link">刷新订单号</a-button>
            </div>
            <div class="paydemo-form-item">
              <label>订单标题：</label>
              <a-input v-model:value="vdata.orderTitle" style="width: 200px" />
            </div>

            <div class="paydemo-form-item">
              <label>分账方式：</label>
              <a-radio-group v-model:value="vdata.divisionMode" style="display: flex">
                <div style="display: flex">
                  <a-radio :value="0">订单不分账</a-radio>
                  <a-radio :value="1">支付完成自动分账</a-radio>
                  <a-radio :value="2">手动分账（冻结商户资金， 只能通过API发起分账后解冻）</a-radio>
                </div>
              </a-radio-group>
            </div>

            <a-divider></a-divider>

            <div class="paydemo-form-item">
              <span>支付金额(元)：</span>

              <div style="display: flex" @click="vdata.amountInput = false">
                <a-radio
                  :checked="vdata.paytestAmount === '0.01'"
                  @click="vdata.paytestAmount = '0.01'"
                >
                  ￥0.01
                </a-radio>
                <a-radio
                  :checked="vdata.paytestAmount === '0.15'"
                  @click="vdata.paytestAmount = '0.15'"
                >
                  ￥0.15
                </a-radio>
                <a-radio
                  :checked="vdata.paytestAmount === '0.21'"
                  @click="vdata.paytestAmount = '0.21'"
                >
                  ￥0.21
                </a-radio>
                <a-radio
                  :checked="vdata.paytestAmount === '0.29'"
                  @click="vdata.paytestAmount = '0.29'"
                >
                  ￥0.29
                </a-radio>
                <a-radio
                  :checked="vdata.paytestAmount === '0.64'"
                  @click="vdata.paytestAmount = '0.64'"
                >
                  ￥0.64
                </a-radio>
              </div>
              <a-radio @click="amountInputShow" :checked="vdata.amountInput">
                <span style="margin-right: 3px">自定义金额</span>
                <a-input-number
                  ref="amountInputFocus"
                  :max="100000"
                  :min="0.01"
                  v-show="vdata.amountInput"
                  v-model:value="vdata.paytestAmount"
                  :precision="2"
                ></a-input-number>
              </a-radio>
            </div>

            <div style="margin-top: 20px; text-align: left">
              <!-- <span style="color: #FD482C;font-size: 18px;padding-right: 10px;" id="amountShow">{{ paytestAmount }}</span> -->
              <a-button @click="immediatelyPay" type="primary">立即支付</a-button>
            </div>
          </form>
        </div>
      </div>
    </a-card>
    <!-- 二维码弹窗 -->
    <pay-test-modal
      ref="payTestModal"
      @closeBarCode="payTestBarCodeRef.visible = false"
    ></pay-test-modal>

    <!-- 条码弹框 -->
    <pay-test-bar-code
      ref="payTestBarCodeRef"
      @barCodeValue="barCodeChange"
      @CodeAgainChange="testCodeChange"
    ></pay-test-bar-code>
  </div>
</template>

<script setup lang="ts">
import { API_URL_MCH_APP, req, payTest, payTestOrder } from '@/api/manage' // 接口
import PayTestModal from './PayTestModal.vue' // 二维码对话框组件
import PayTestBarCode from './PayTestBarCode.vue' // 条码对话框组件
import { reactive, ref, getCurrentInstance, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const vdata: any = reactive({
  mchAppList: [], // app列表
  appId: '', // 已选择的appId
  appPaywayList: [], // 商户app支持的支付方式
  currentWayCode: '', // 以何种方式进行支付，默认是微信二维码
  currentPayDataType: '', // 支付参数
  mchOrderNo: '', // 模拟商户订单号
  authCode: '', // 条码的值
  paytestAmount: '0.01', // 支付金额，默认为0.01
  amountInput: false, // 自定金额输入框是否展示
  noConfigText: false, // 尚无任何配置分割线提示文字
  divisionMode: 0, // 订单分账模式
  orderTitle: '接口调试', // 订单标题
})

const payTestBarCodeRef = ref()
const payTestModal = ref()
const amountInputFocus = ref()

onMounted(() => {
  // 获取传入的参数，如果参数存在，则为appId 重新赋值
  const appId = route.params.appId
  if (appId) {
    vdata.appId = appId // appId赋值
    appPaywayListHandle(appId) // 调用appPaywayListHandle，展示支付方式
  }

  const that = this // 提前保留this
  // 请求接口，获取所有的appid，只有此处进行pageSize=-1传参
  req.list(API_URL_MCH_APP, { pageSize: -1 }).then((res) => {
    vdata.mchAppList = res.records
    if (vdata.mchAppList.length > 0) {
      // 赋予默认值
      vdata.appId = vdata.mchAppList[0].appId
      // 根据appId的值，动态显示支付方式
      appPaywayListHandle(vdata.appId)
    }
  })

  // 在进入页面时刷新订单号
  randomOrderNo()
})

// 支付板块是否展示
function payTestShow() {
  // 如果未选择appid，或者支付方式列表为0，则不显示支付体验板块
  if (vdata.appId === '' || vdata.appPaywayList.length === 0) {
    return false
  } else {
    return true
  }
}

function changeCurrentWayCode(wayCode, currentPayDataType) {
  // 切换支付方式
  vdata.currentWayCode = wayCode
  vdata.currentPayDataType = currentPayDataType
}

// 变更 appId的事件
function changeAppId(value) {
  appPaywayListHandle(value) // 根据appId的值，动态显示支付方式
}

// 刷新订单号
function randomOrderNo() {
  vdata.mchOrderNo = 'M' + new Date().getTime() + Math.floor(Math.random() * (9999 - 1000) + 1000)
}

// 获取条码的值
function barCodeChange(value) {
  vdata.authCode = value
  immediatelyPay()
}

// 根据不同的appId展示不同的支付方式(在下拉框切换时和在携带参数进入页面时调用)
function appPaywayListHandle(value) {
  if (!value) {
    vdata.appPaywayList = []
    return false
  }
  payTest(value).then((res) => {
    vdata.appPaywayList = res
    if (res.length === 0) {
      vdata.noConfigText = true
    } else {
      vdata.noConfigText = false
    }
  })
}
// 立即支付按钮
function immediatelyPay() {
  // 判断支付金额是否为0
  if (!vdata.paytestAmount || vdata.paytestAmount == 0.0) {
    return $infoBox.message.error('请输入支付金额')
  }
  // 判断是否选择支付方式
  if (vdata.currentWayCode === '') {
    return $infoBox.message.error('请选择支付方式')
  }
  // 请输入订单标题
  if (!vdata.orderTitle || vdata.orderTitle.length > 20) {
    return $infoBox.message.error('请输入正确的订单标题[20字以内]')
  }

  // 判断是否为条码支付
  if (
    !payTestBarCodeRef.value.getVisible() &&
    (vdata.currentWayCode === 'WX_BAR' ||
      vdata.currentWayCode === 'ALI_BAR' ||
      vdata.currentWayCode === 'AUTO_BAR')
  ) {
    return payTestBarCodeRef.value.showModal()
  }

  payTestOrder({
    // jsapi 默认使用聚合二维码支付
    wayCode:
      vdata.currentWayCode === 'WX_JSAPI' || vdata.currentWayCode === 'ALI_JSAPI'
        ? 'QR_CASHIER'
        : vdata.currentWayCode, // 支付方式
    amount: parseFloat(vdata.paytestAmount), // 支付金额
    appId: vdata.appId, // appId
    mchOrderNo: vdata.mchOrderNo, // 订单编号
    payDataType: vdata.currentPayDataType, // 支付参数（二维码，条码）
    authCode: vdata.authCode,
    divisionMode: vdata.divisionMode,
    orderTitle: vdata.orderTitle,
  })
    .then((res) => {
      payTestModal.value.showModal(vdata.currentWayCode, res) // 打开弹窗
      randomOrderNo() // 刷新订单号
    })
    .catch(() => {
      payTestBarCodeRef.value.processCatch()
      randomOrderNo() // 刷新订单号
    })
}

// 此处判断，微信，支付宝，聚合码，哪种支付方式一个都没配置，如果未配置，则不显示该板块，若等于-1 则表示不存在
function showTitle(parameterA) {
  if (vdata.appPaywayList.toString().indexOf(parameterA) === -1) {
    return false
  } else {
    return true
  }
}
// 聚合支付标题显示
function showQtTitle() {
  if (
    vdata.appPaywayList.toString().indexOf('WX') !== -1 ||
    vdata.appPaywayList.toString().indexOf('ALI') !== -1 ||
    vdata.appPaywayList.toString().indexOf('PP_PC') !== -1
  ) {
    return true
  } else {
    return false
  }
}

// 自定义金额输入框是否展示
function amountInputShow() {
  nextTick(() => {
    // 输入框默认展示焦点
    amountInputFocus.value.focus()
  })
  vdata.amountInput = true
  vdata.paytestAmount = ''
}

// 条码弹窗点击x或者蒙版关闭
function testCodeChange() {
  randomOrderNo() // 刷新订单号
}

// handleCloseBarCode () {
//   this.$refs.payTestBarCode.visible = false
// }
</script>

<style scoped lang="css">
@import './payTest.css';
</style>
