<template>
  <div>
    <a-modal v-model="visible" title="等待支付" @ok="handleClose" :footer="null" :width="300">
      <div style="width:100%;margin-bottom:20px;text-align:center">
        <img v-if="apiRes.payDataType == 'codeImgUrl'" :src="apiRes.payData" alt="">
        <span v-if="apiRes.payDataType == 'payurl'">等待用户支付 <hr> 如浏览器未正确跳转请点击： <a :href="apiRes.payData" target="_blank">支付地址</a></span>
      </div>
      <p class="describe">
        <img src="@/assets/payTestImg/wx_app.svg" alt="" v-show="wxApp"><!-- 微信图标 -->
        <img src="@/assets/payTestImg/ali_app.svg" alt="" v-show="aliApp"><!-- 支付宝图标 -->
        <span>{{ payText }}</span>
      </p>
    </a-modal>

  </div>
</template>
<script>
import ReconnectingWebSocket from 'reconnectingwebsocket'
import { getWebSocketPrefix } from '@/api/manage'

export default {
  name: 'PayTestModal',
  data () {
    return {
      visible: false,
      payText: '', // 二维码底部描述文字
      wxApp: false, // 微信二维码图片是否展示
      aliApp: false, // 支付宝二维码图片是否展示
      apiRes: {}, // 接口返回数据包
      payOrderWebSocket: null // 支付订单webSocket对象
    }
  },
  methods: {
    // 二维码以及条码弹窗
    showModal (wayCode, apiRes) {
      const that = this
      // 关闭上一个webSocket监听
      if (this.payOrderWebSocket) {
        this.payOrderWebSocket.close()
      }

      this.apiRes = apiRes
      this.wxApp = false
      this.aliApp = false
      this.visible = true // 打开弹窗

      // 根据不同的支付方式，展示不同的信息
      if (wayCode === 'WX_NATIVE' || wayCode === 'WX_JSAPI') { // 微信二维码
        this.wxApp = true
        this.payText = '请使用微信"扫一扫"扫码支付'
      } else if (wayCode === 'ALI_QR' || wayCode === 'ALI_JSAPI') { // 支付宝二维码
        this.aliApp = true
        this.payText = '请使用支付宝"扫一扫"扫码支付'
      } else if (wayCode === 'QR_CASHIER') { // 聚合支付二维码
        this.wxApp = true
        this.aliApp = true
        this.payText = '支持微信、支付宝扫码'
      }

      // 跳转到PC网站
      if (apiRes.payDataType === 'payurl') {
        window.open(apiRes.payData)
      }

      // 监听响应结果
      this.payOrderWebSocket = new ReconnectingWebSocket(getWebSocketPrefix() + '/api/anon/ws/payOrder/' + apiRes.payOrderId + '/' + new Date().getTime())
      this.payOrderWebSocket.onopen = () => {}
      this.payOrderWebSocket.onmessage = (msgObject) => {
        const resMsgObject = JSON.parse(msgObject.data)
        if (resMsgObject.state === 2) {
          that.handleClose()
          that.$message.success('支付成功')
        } else {
          that.handleClose()
          that.$message.error('支付失败')
        }
      }
    },
    handleClose (e) {
      if (this.payOrderWebSocket) {
        this.payOrderWebSocket.close()
      }
      this.visible = false
    }
  }
}
</script>
<style lang="less" scoped>
.describe {
  img {
    width: 30px;
    height: 25px;
  }
}
</style>
