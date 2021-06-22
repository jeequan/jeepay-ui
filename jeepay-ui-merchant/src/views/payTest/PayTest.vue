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

      <!-- 支付测试面板 -->
      <div style="width: 100%;" class="paydemo" v-if="appId != ''">
        <div class="paydemo-type-content">
          <div class="paydemo-type-name">微信支付</div>
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

          <div class="paydemo-type-name">支付宝支付</div>
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

          <div class="paydemo-type-name">聚合支付</div>
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
              <label>￥0.01<input type="radio" value="0.01" v-model="paytestAmount" /></label>
              <label>￥0.15<input type="radio" value="0.15" v-model="paytestAmount" /></label>
              <label>￥0.21<input type="radio" value="0.21" v-model="paytestAmount" /></label>
              <label>￥0.29<input type="radio" value="0.29" v-model="paytestAmount" /></label>
              <label>￥0.64<input type="radio" value="0.64" v-model="paytestAmount" /></label>
              <label><span style="margin-right:3px">自定义金额</span><a-input-number type="radio" value="0.64" v-model="paytestAmount" :precision="2"/></label>
            </div>
            <div style="margin-top:20px;text-align: right">
              <span style="color: #FD482C;font-size: 18px;padding-right: 10px;" id="amountShow">{{ paytestAmount }}</span>
              <a-button @click="immediatelyPay" style="padding:5px 20px;background-color: #1953ff;border-radius: 5px;color:#fff">立即支付</a-button>
            </div>
          </form>
        </div>
      </div>
    </a-card>
    <pay-test-modal ref="payTestModal"></pay-test-modal>
  </div>
</template>

<script>
import { API_URL_MCH_APP, req, payTest, payTestOrder } from '@/api/manage' // 接口
import PayTestModal from './PayTestModal' // 对话框组件

export default {
  props: {},
  components: { PayTestModal },
  data () {
    return {

      mchAppList: [], // app列表
      appId: '', // 已选择的appId
      appPaywayList: [], // 商户app支持的支付方式

      currentWayCode: '', // 以何种方式进行支付，默认是微信二维码
      currentPayDataType: '', // 支付参数
      mchOrderNo: '', // 模拟商户订单号
      paytestAmount: '0.01', // 支付金额，默认为0.01
      amountInput: false // 自定金额输入框是否展示
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
      // 判断是否选择支付方式
      if (this.currentWayCode === '') {
        return this.$message.error('请选择支付方式')
      }

      const that = this
      payTestOrder({
        // jsapi 默认使用聚合二维码支付
        wayCode: (this.currentWayCode === 'WX_JSAPI' || this.currentWayCode === 'ALI_JSAPI') ? 'QR_CASHIER' : this.currentWayCode,
        amount: this.paytestAmount,
        appId: this.appId,
        mchOrderNo: this.mchOrderNo,
        payDataType: this.currentPayDataType
        // authCode: this.authCode
      }).then(res => {
        that.$refs.payTestModal.showModal(this.currentWayCode, res) // 打开弹窗
      })
    }
  }
}
</script>

<style scoped lang="css">
  @import './payTest.css';
</style>
