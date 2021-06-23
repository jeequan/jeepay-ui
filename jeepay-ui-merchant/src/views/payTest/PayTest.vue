<template>
  <div>
    <a-card style="box-sizing:border-box;border-radius:15px;padding:30px">

      <!-- 选择下单的应用列表 -->
      <a-form>
        <div style="display:flex;flex-direction:row">
          <p style="margin-top:9px;margin-right:10px;">应用APPID</p>
          <a-form-item label="" class="table-head-layout">
            <a-select v-model="appId" @change="changeAppId" style="width:300px">
              <a-select-option key="" >请选择应用</a-select-option>
              <a-select-option v-for="(item) in mchAppList" :key="item.appId" >{{ item.appName }} [{{ item.appId }}]</a-select-option>
            </a-select>
          </a-form-item>
        </div>
      </a-form>

      <!-- 支付测试面板 v-if=""-->
      <div style="width: 100%;" class="paydemo" v-if="payTestShow()">
        <div class="paydemo-type-content">
          <div class="paydemo-type-name" v-show="showTitle('WX')" >微信支付</div>
          <div class="paydemo-type-body">

            <div class="paydemo-type color-change" v-show="appPaywayList.indexOf('WX_NATIVE') >= 0" @click="changeCurrentWayCode('WX_NATIVE', 'codeImgUrl')" :class="{this:(currentWayCode === 'WX_NATIVE')}">
              <img src="@/assets/payTestImg/wx_native.svg" class="paydemo-type-img"><span class="color-change">微信二维码</span>
            </div>

            <div class="paydemo-type color-change" v-show="appPaywayList.indexOf('WX_BAR') >= 0" @click="changeCurrentWayCode('WX_BAR', '')" :class="{this:(currentWayCode === 'WX_BAR')}">
              <img src="@/assets/payTestImg/wx_bar.svg" class="paydemo-type-img"><span class="color-change">微信条码</span>
            </div>

            <div class="paydemo-type color-change" v-show="appPaywayList.indexOf('WX_JSAPI') >= 0" @click="changeCurrentWayCode('WX_JSAPI', 'codeImgUrl')" :class="{this:(currentWayCode === 'WX_JSAPI')}">
              <img src="@/assets/payTestImg/wx_jsapi.svg" class="paydemo-type-img"><span class="color-change">公众号/小程序</span>
            </div>

            <div class="paydemo-type-h5" v-show="appPaywayList.indexOf('WX_H5') >= 0" @click="changeCurrentWayCode('WX_H5', 'payurl')" :class="{this:(currentWayCode === 'WX_H5')}">
              <img src="@/assets/payTestImg/wx_h5.svg" class="paydemo-type-img"><span class="color-change">微信H5</span>
            </div>

          </div>

          <div class="paydemo-type-name" v-show="showTitle('ALI')">支付宝支付</div>
          <div class="paydemo-type-body">
            <div class="paydemo-type color-change" v-show="appPaywayList.indexOf('ALI_QR') >= 0" @click="changeCurrentWayCode('ALI_QR', 'codeImgUrl')" :class="{this:(currentWayCode === 'ALI_QR')}">
              <img src="@/assets/payTestImg/ali_qr.svg" class="paydemo-type-img"><span class="color-change">支付宝二维码</span>
            </div>

            <div class="paydemo-type color-change" v-show="appPaywayList.indexOf('ALI_BAR') >= 0" @click="changeCurrentWayCode('ALI_BAR', '')" :class="{this:(currentWayCode === 'ALI_BAR')}">
              <img src="@/assets/payTestImg/ali_bar.svg" class="paydemo-type-img"><span class="color-change">支付宝条码</span>
            </div>

            <div class="paydemo-type color-change" v-show="appPaywayList.indexOf('ALI_JSAPI') >= 0" @click="changeCurrentWayCode('ALI_JSAPI', 'codeImgUrl')" :class="{this:(currentWayCode === 'ALI_JSAPI')}">
              <img src="@/assets/payTestImg/ali_jsapi.svg" class="paydemo-type-img"><span class="color-change">支付宝生活号</span>
            </div>

            <div class="paydemo-type color-change" v-show="appPaywayList.indexOf('ALI_PC') >= 0" @click="changeCurrentWayCode('ALI_PC', 'payurl')" :class="{this:(currentWayCode === 'ALI_PC')}">
              <img src="@/assets/payTestImg/ali_pc.svg" class="paydemo-type-img"><span class="color-change">支付宝PC网站</span>
            </div>

            <div>
              <div class="paydemo-type-h5" v-show="appPaywayList.indexOf('ALI_WAP') >= 0" @click="changeCurrentWayCode('ALI_WAP', 'payurl')" :class="{this:(currentWayCode === 'ALI_WAP')}">
                <img src="@/assets/payTestImg/ali_wap.svg" class="paydemo-type-img"><span class="color-change">支付宝WAP</span>
              </div>
            </div>
          </div>

          <div class="paydemo-type-name" v-show="showJhTitle()">聚合支付</div>
          <div class="paydemo-type-body">
            <div class="paydemo-type color-change" v-show="appPaywayList.indexOf('WX_JSAPI') >= 0 || appPaywayList.indexOf('ALI_JSAPI') >= 0" @click="changeCurrentWayCode('QR_CASHIER', 'codeImgUrl')" :class="{this:(currentWayCode === 'QR_CASHIER')}">
              <img src="@/assets/payTestImg/qr_cashier.svg" class="paydemo-type-img"><span class="color-change">聚合扫码(用户扫商家)</span>
            </div>

            <div class="paydemo-type color-change" v-show="appPaywayList.indexOf('WX_BAR') >= 0 || appPaywayList.indexOf('ALI_BAR') >= 0" @click="changeCurrentWayCode('AUTO_BAR', 'codeImgUrl')" :class="{this:(currentWayCode === 'AUTO_BAR')}">
              <img src="@/assets/payTestImg/auto_bar.svg" class="paydemo-type-img"><span class="color-change">聚合条码(商家扫用户)</span>
            </div>

          </div>
        </div>

        <!-- 订单信息 -->
        <div class="paydemo-type-content">
          <div class="paydemo-type-name">支付信息</div>
          <form class="layui-form">
            <div class="paydemo-form-item">
              <label>订单编号：</label><span id="payMchOrderNo">{{ mchOrderNo }}</span>
              <span @click="randomOrderNo" class=" paydemo-btn" style="padding:0 3px">刷新订单号</span>
            </div>
            <div class="paydemo-form-item">
              <label>商品名称：</label>
              <span id="paySubject">支付接口演示</span>
            </div>
            <div class="paydemo-form-item">
              <span>支付金额(元)：</span>

              <a-radio-group name="radioGroup" :default-value="0.01" style="display:flex">
                <div @click="amountInput=false" style="display:flex">
                  <a-radio :value="0.01" @click="paytestAmount=0.01">￥0.01</a-radio>
                  <a-radio :value="0.15" @click="paytestAmount=0.15">￥0.15</a-radio>
                  <a-radio :value="0.21" @click="paytestAmount=0.21">￥0.21</a-radio>
                  <a-radio :value="0.29" @click="paytestAmount=0.29">￥0.29</a-radio>
                  <a-radio :value="0.64" @click="paytestAmount=0.64">￥0.64</a-radio>
                </div>
                <a-radio @click="amountInputShow">
                  <span style="margin-right:3px">自定义金额</span>
                  <a-input-number
                    ref="amountInputFocus"
                    :max="100000"
                    :min="0.01"
                    v-show="amountInput"
                    v-model="paytestAmount"
                    :precision="2">
                  </a-input-number>
                </a-radio>
              </a-radio-group>

            </div>
            <div style="margin-top:20px;text-align: right">
              <span style="color: #FD482C;font-size: 18px;padding-right: 10px;" id="amountShow">{{ paytestAmount }}</span>
              <a-button @click="immediatelyPay" style="padding:5px 20px;background-color: #1953ff;border-radius: 5px;color:#fff">立即支付</a-button>
            </div>
          </form>
        </div>
      </div>
    </a-card>
    <!-- 二维码弹窗 @closeBarCode="handleCloseBarCode"-->
    <pay-test-modal ref="payTestModal" @closeBarCode="$refs.payTestBarCode.visible = false"></pay-test-modal>

    <!-- 条码弹框 -->
    <pay-test-bar-code ref="payTestBarCode" @barCodeValue="barCodeChange" @CodeAgainChange="testCodeChange"></pay-test-bar-code>
  </div>
</template>

<script>
import { API_URL_MCH_APP, req, payTest, payTestOrder } from '@/api/manage' // 接口
import PayTestModal from './PayTestModal' // 二维码对话框组件
import PayTestBarCode from './PayTestBarCode' // 条码对话框组件
export default {
  props: {},
  components: { PayTestModal, PayTestBarCode },
  data () {
    return {
      mchAppList: [], // app列表
      appId: '', // 已选择的appId
      appPaywayList: [], // 商户app支持的支付方式
      currentWayCode: '', // 以何种方式进行支付，默认是微信二维码
      currentPayDataType: '', // 支付参数
      mchOrderNo: '', // 模拟商户订单号
      authCode: '', // 条码的值
      paytestAmount: '0.01', // 支付金额，默认为0.01
      amountInput: false, // 自定金额输入框是否展示
      barCodeAgain: true // 判断条码是否为，第二次吊起支付按钮,默认为true
    }
  },

  mounted () {
    // 获取传入的参数，如果参数存在，则为appId 重新赋值
    const appId = this.$route.params.appId
    if (appId) {
      this.appId = appId // appId赋值
      this.appPaywayListHandle(appId) // 调用appPaywayListHandle，展示支付方式
    }

    const that = this // 提前保留this
    // 请求接口，获取所有的appid，只有此处进行pageSize=-1传参
    req.list(API_URL_MCH_APP, { pageSize: -1 }).then(res => {
      that.mchAppList = res.records
    })

    // 在进入页面时刷新订单号
    this.randomOrderNo()
  },
  methods: {
    // 支付板块是否展示
    payTestShow () {
      // 如果未选择appid，或者支付方式列表为0，则不显示支付体验板块
      if (this.appId === '' || this.appPaywayList.length === 0) {
        return false
      } else {
        return true
      }
    },

    changeCurrentWayCode (wayCode, currentPayDataType) { // 切换支付方式
      this.currentWayCode = wayCode
      this.currentPayDataType = currentPayDataType
    },

    // 变更 appId的事件
    changeAppId (value) {
      this.appPaywayListHandle(value) // 根据appId的值，动态显示支付方式
    },

    // 刷新订单号
    randomOrderNo () {
       this.mchOrderNo = 'M' + new Date().getTime() + Math.floor(Math.random() * (9999 - 1000) + 1000)
    },

    // 获取条码的值
    barCodeChange (value) {
      this.authCode = value
      this.immediatelyPay()
    },

    // 根据不同的appId展示不同的支付方式(在下拉框切换时和在携带参数进入页面时调用)
    appPaywayListHandle (value) {
      if (!value) {
        this.appPaywayList = []
        return false
      }
      const that = this
      payTest(value).then(res => {
        that.appPaywayList = res
      })
    },
    // 立即支付按钮
    immediatelyPay () {
      // 判断支付金额是否为0
      if (this.paytestAmount === 0.00 || this.paytestAmount === ' ' || this.paytestAmount === undefined) {
        return this.$message.error('请输入支付金额')
      }

      // 判断是否选择支付方式
      if (this.currentWayCode === '') {
        return this.$message.error('请选择支付方式')
      }

      // 判断是否为条码支付
      if (this.currentWayCode === 'WX_BAR' || this.currentWayCode === 'ALI_BAR' || this.currentWayCode === 'AUTO_BAR') {
        // 此处判断是否是条码支付，同时让条码弹窗的输入框处于焦点状态，当在点击提交，或者扫码盒自动提交时，返回条码信息
        // 此处返回一个值，代表他是条码要第二次吊起支付按钮，第二次吊起后，要将其清空
        if (this.barCodeAgain) {
          this.$refs.payTestBarCode.showModal()
          this.barCodeAgain = false
          return
        }
      }

      const that = this
      payTestOrder({
        // jsapi 默认使用聚合二维码支付
        wayCode: (this.currentWayCode === 'WX_JSAPI' || this.currentWayCode === 'ALI_JSAPI') ? 'QR_CASHIER' : this.currentWayCode, // 支付方式
        amount: this.paytestAmount, // 支付金额
        appId: this.appId, // appId
        mchOrderNo: this.mchOrderNo, // 订单编号
        payDataType: this.currentPayDataType, // 支付参数（二维码，条码）
        authCode: this.authCode
      }).then(res => {
        that.$refs.payTestModal.showModal(this.currentWayCode, res) // 打开弹窗
        that.barCodeAgain = true // 将条码的判断还原为true
        that.randomOrderNo() // 刷新订单号
      }).catch(err => {
        console.log(err)
        that.randomOrderNo() // 刷新订单号
      })
    },

    // 此处判断，微信，支付宝，聚合码，哪种支付方式一个都没配置，如果未配置，则不显示该板块，若等于-1 则表示不存在
    showTitle (parameterA) {
        if (this.appPaywayList.toString().indexOf(parameterA) === -1) {
          return false
        } else {
          return true
        }
    },
    // 聚合支付标题显示
    showJhTitle () {
      if (this.appPaywayList.toString().indexOf('WX') !== -1 || this.appPaywayList.toString().indexOf('ALI') !== -1) {
          return true
        } else {
          return false
        }
    },

    // 自定义金额输入框是否展示
    amountInputShow () {
      this.$nextTick(() => { // 输入框默认展示焦点
        this.$refs.amountInputFocus.focus()
      })
      this.amountInput = true
      this.paytestAmount = ''
    },

    // 条码弹窗点击x或者蒙版关闭
    testCodeChange () {
      this.barCodeAgain = true
      this.randomOrderNo() // 刷新订单号
    }

    // handleCloseBarCode () {
    //   this.$refs.payTestBarCode.visible = false
    // }
  }
}
</script>

<style scoped lang="css">
  @import './payTest.css';
</style>
