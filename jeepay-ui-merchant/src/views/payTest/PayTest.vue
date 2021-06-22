<template>
  <div>
    <a-card style="box-sizing:border-box;border-radius:15px;padding:30px">
      <a-form >
        <div style="display:flex;flex-direction:row">
          <p style="margin-top:9px;margin-right:10px;">应用APPID</p>
          <a-form-item label="" class="table-head-layout">
            <a-select v-model="appId" default-value="this.appId" @change="selectChange" style="width:300px">
              <a-select-option v-for="(item) in appIdList" :key="item.appId" >{{ item.appId }}</a-select-option>
            </a-select>
          </a-form-item>
        </div>
      </a-form>

      <div style="width: 100%;" class="paydemo " v-if="hasAppId">
        <div class="paydemo-type-content">
          <div class="paydemo-type-name">微信支付</div>
          <div class="paydemo-type-body" >
            <div class="paydemo-type color-change" code="WX_NATIVE" @click="payMentHandle('WX_NATIVE')" :class="{this:(payMent === 'WX_NATIVE')}" v-show="payMentShow('WX_NATIVE')">
              <img src="@/assets/payTestImg/wx_native.svg" class="paydemo-type-img">
              <span class="color-change">微信二维码</span>
            </div>
            <div class="paydemo-type color-change" code="WX_BAR" @click="payMentHandle('WX_BAR')" :class="{this:(payMent === 'WX_BAR')}" v-show="payMentShow('WX_BAR')">
              <img src="@/assets/payTestImg/wx_bar.svg" class="paydemo-type-img">
              <span class="color-change">微信条码</span>
            </div>
            <div class="paydemo-type color-change " code="WX_QR_CASHIER" @click="payMentHandle('WX_QR_CASHIER')" :class="{this:(payMent === 'WX_QR_CASHIER')}" v-show="payMentShow('WX_QR_CASHIER')">
              <img src="@/assets/payTestImg/wx_jsapi.svg" class="paydemo-type-img">
              <span class="color-change ">公众号/小程序</span>
            </div>
            <div style="position: relative">
              <div class="paydemo-type-h5" code="WX_H5" @mouseover="wx_h5=true" @mouseleave="wx_h5=false" v-show="payMentShow('WX_H5')">
                <img src="@/assets/payTestImg/wx_h5.svg" class="paydemo-type-img">
                <span>微信H5</span>
              </div>
              <div class="paydemo-type-h5 codeImg_wx_h5 " v-show="wx_h5" >
                <img style="width: 120px;height: 120px;padding-bottom: 10px" src="@/assets/payTestImg/pay_h5.png">
                <span>请使用手机浏览器扫码</span>
              </div>
            </div>
          </div>

          <div class="paydemo-type-name">支付宝支付</div>
          <div class="paydemo-type-body">
            <div class="paydemo-type color-change" code="ALI_QR" @click="payMentHandle('ALI_QR')" :class="{this:(payMent === 'ALI_QR')}" v-show="payMentShow('ALI_QR')">
              <img src="@/assets/payTestImg/ali_qr.svg" class="paydemo-type-img">
              <span class="color-change">支付宝二维码</span>
            </div>
            <div class="paydemo-type color-change" code="ALI_BAR" @click="payMentHandle('ALI_BAR')" :class="{this:(payMent === 'ALI_BAR')}" v-show="payMentShow('ALI_BAR')">
              <img src="@/assets/payTestImg/ali_bar.svg" class="paydemo-type-img">
              <span class="color-change">支付宝条码</span>
            </div>
            <div class="paydemo-type color-change" code="ALI_JSAPI" @click="payMentHandle('ALI_JSAPI')" :class="{this:(payMent === 'ALI_JSAPI')}" v-show="payMentShow('ALI_JSAPI')">
              <img src="@/assets/payTestImg/ali_jsapi.svg" class="paydemo-type-img">
              <span class="color-change">支付宝生活号</span>
            </div>
            <div class="paydemo-type color-change" code="ALI_PC" @click="payMentHandle('ALI_PC')" :class="{this:(payMent === 'ALI_PC')}" v-show="payMentShow('ALI_PC')">
              <img src="@/assets/payTestImg/ali_pc.svg" class="paydemo-type-img">
              <span class="color-change">支付宝PC网站</span>
            </div>
            <div style="position: relative">
              <div class="paydemo-type-h5" code="ALI_WAP" @mouseover="zfb_wap=true" @mouseleave="zfb_wap=false" v-show="payMentShow('ALI_WAP')">
                <img src="@/assets/payTestImg/ali_wap.svg" class="paydemo-type-img">
                <span>支付宝WAP</span>
              </div>
              <div class="paydemo-type-h5 codeImg_wx_h5" v-show="zfb_wap">
                <img style="width: 120px;height: 120px;padding-bottom: 10px" src="@/assets/payTestImg/pay_h5.png">
                <span>请使用手机浏览器扫码</span>
              </div>
            </div>
          </div>

          <div class="paydemo-type-name">聚合支付</div>
          <div class="paydemo-type-body">
            <div class="paydemo-type color-change" code="QR_CASHIER" @click="payMentHandle('QR_CASHIER')" :class="{this:(payMent === 'QR_CASHIER')}" v-show="payMentShow('QR_CASHIER')">
              <img src="@/assets/payTestImg/qr_cashier.svg" class="paydemo-type-img">
              <span class="color-change">聚合扫码(用户扫商家)</span>
            </div>
            <div class="paydemo-type color-change" code="AUTO_BAR" @click="payMentHandle('AUTO_BAR')" :class="{this:(payMent === 'AUTO_BAR')}" v-show="payMentShow('AUTO_BAR')">
              <img src="@/assets/payTestImg/auto_bar.svg" class="paydemo-type-img">
              <span class="color-change">聚合条码(商家扫用户)</span>
            </div>
          </div>

        </div>

        <div class="paydemo-type-content">
          <div class="paydemo-type-name">支付信息</div>
          <form class="layui-form">
            <div class="paydemo-form-item">
              <label>订单编号：</label><span id="payMchOrderNo">{{ orderNo }}</span>
              <span id="randomOrderNo" @click="randomOrderNo" class=" paydemo-btn" style="padding:0 3px">刷新订单号</span>
            </div>
            <div class="paydemo-form-item">
              <label>商品名称：</label>
              <span id="paySubject">支付接口演示</span>
            </div>
            <div class="paydemo-form-item">
              <span>支付金额(元)：</span>
              <label>￥0.01<input type="radio" value="0.01" v-model="payMentAmount" /></label>
              <label>￥0.15<input type="radio" value="0.15" v-model="payMentAmount" /></label>
              <label>￥0.21<input type="radio" value="0.21" v-model="payMentAmount" /></label>
              <label>￥0.29<input type="radio" value="0.29" v-model="payMentAmount" /></label>
              <label>￥0.64<input type="radio" value="0.64" v-model="payMentAmount" /></label>
              <label><span style="margin-right:3px">自定义金额</span><a-input-number type="radio" value="0.64" v-model="payMentAmount" :precision="2"/></label>
            </div>
            <div style="margin-top:20px;text-align: right">
              <span style="color: #FD482C;font-size: 18px;padding-right: 10px;" id="amountShow">{{ payMentAmount }}</span>
              <a-button @click="immediatelyPay" lay-filter="payTest" style="padding:5px 20px;background-color: #1953ff;border-radius: 5px;color:#fff">立即支付</a-button>
            </div>
          </form>
        </div>
      </div>
    </a-card>
    <pay-test-modal ref="payTestModal" :codeUr="codeUr"></pay-test-modal>
  </div>
</template>

<script>
import { API_URL_MCH_APP, req, payTest, payTestOrder, getWebSocketPrefix } from '@/api/manage' // 接口
import PayTestModal from './PayTestModal' // 对话框组件
import ReconnectingWebSocket from 'reconnectingwebsocket' // WebSocket

export default {
  props: {},
  components: { PayTestModal },
  data () {
    return {
      payMent: '', // 以何种方式进行支付，默认是微信二维码
      payMentAmount: '0.01', // 支付金额，默认为0.01
      hasAppId: false, // 如果没有选择appid 默认为false，则支付板块不显示
      orderNo: '', // 订单号
      appIdList: [], // appid列表
      appId: '请选择appId', // 下拉框的默认值
      wx_h5: false, // 微信h5 扫码
      zfb_wap: false, // 支付宝wap 扫码
      amountInputNum: '', // 自定义金额的值
      amountInput: false, // 自定金额输入框是否展示
      payMentList: [], // 支付方式列表（根据appId动态展示）
      authCode: '', // 条码地址
      codeUr: '', // 二维码地址
      payOrderId: ''
    }
  },
  methods: {
    // 切换支付方式
    payMentHandle (mode) {
      console.log(mode)
      this.payMent = mode
    },

    // 自定义金额输入框展示
    amountRadio () {
      this.amountInput = true
    },

    // appId下拉框
    selectChange (value) {
      this.payMentListHandle(value) // 根据appId的值，动态显示支付方式
    },

    // 刷新订单号
    randomOrderNo () {
       this.orderNo = 'M' + new Date().getTime() + Math.floor(Math.random() * (9999 - 1000) + 1000)
    },

    // 根据不同的appId展示不同的支付方式(在下拉框切换时和在携带参数进入页面时调用)
    payMentListHandle (value) {
      const that = this
      payTest(value).then(res => {
        that.payMentList = res
        console.log(that.payMentList)
        this.hasAppId = true // 支付板块显示
      }).catch(err => {
        this.$message.error('请求失败')
        this.hasAppId = false // 支付板块不显示
        console.error(err)
      })
    },
    // 立即支付按钮
    immediatelyPay () {
      // 判断是否选择支付方式
      if (this.payMent === '') {
        return this.$message.error('请选择支付方式')
      }

      const that = this
      payTestOrder({ // 六个参数 1订单号 2appid 3金额 4支付方式 5payDataType(二维码，条码) 6条码的值
        wayCode: this.payMent, amount: this.payMentAmount, appId: this.appId, mchOrderNo: this.orderNo, payDataType: 'codeImgUrl', authCode: this.authCode
      }).then(res => {
        that.codeUr = res.payData
        that.payOrderId = res.payOrderId
        that.$refs.payTestModal.showModal(this.payMent) // 打开弹窗
        // 此处加入 webSocket
        const socket = new ReconnectingWebSocket(getWebSocketPrefix() + '/api/anon/ws/payOrder/' + res.payOrderId + '/' + new Date().getTime())
        socket.onopen = () => {}
        socket.onmessage = (msgObject) => {
          if (JSON.parse(msgObject.data).state === 2) {
            this.$refs.payTestModal.handleClose()
            this.$message.success('支付成功')
          } else {
            this.$refs.payTestModal.handleClose()
            this.$message.error('支付失败')
          }
        }
      }).catch(err => {
        this.$message.error('请求失败')
        console.error(err)
      })
    },

    // 该支付方式是否显示
    payMentShow (payMent) {
      if (this.payMentList.indexOf(payMent) !== -1) {
        return true
      } else {
        return false
      }
    }
  },
  created () {
    // 获取传入的参数，如果参数存在，则为appid 重新赋值
    const appId = this.$route.query.appid
    if (appId) {
      this.appId = appId // appId赋值
      this.hasAppId = true // 支付板块显示
      this.payMentListHandle(appId) // 调用payMentListHandle，展示支付方式
    }

    const that = this // 提前保留this
    // 请求接口，获取所有的appid，只有此处进行pageSize=-1传参
    req.list(API_URL_MCH_APP + '?pageSize=-1').then(res => {
      that.appIdList = res.records
    })

    // 在进入页面时刷新订单号
    this.randomOrderNo()
  },
  mounted () {

  }
}
</script>

<style scoped lang="css">
  @import './payTest.css';
</style>
