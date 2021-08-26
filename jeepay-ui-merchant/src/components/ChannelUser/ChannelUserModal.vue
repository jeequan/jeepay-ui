<template>
  <div>
    <a-modal v-model="visible" title="自动获取渠道用户ID" @ok="handleClose" :footer="null" :width="300">
      <div style="width:100%;margin-bottom:20px;text-align:center">
        <div style="width: 300px" class="qrcode" id="qrCodeUrl"></div>
        <vueQr :text="qrImgUrl"/>
        <hr/>
        <span>{{ payText }}</span>
      </div>
    </a-modal>

  </div>
</template>
<script>
import ReconnectingWebSocket from 'reconnectingwebsocket'
import vueQr from 'vue-qr'
import { getWebSocketPrefix, getChannelUserQrImgUrl } from '@/api/manage'

export default {
  components: { vueQr },
  data () {
    return {
      visible: false,
      qrImgUrl: '',
      payText: '', // 二维码底部描述文字
      transferOrderWebSocket: null, // 支付订单webSocket对象
      extObject: null // 扩展对象， 将原样返回。
    }
  },
  methods: {

    // show
    showModal (appId, ifCode, extObject) {
      const that = this
      that.extObject = extObject
      // 关闭上一个webSocket监听
      if (this.transferOrderWebSocket) {
        this.transferOrderWebSocket.close()
      }

      // 根据不同的支付方式，展示不同的信息
      this.payText = ''
      if (ifCode === 'wxpay') {
        this.payText = '请使用微信客户端"扫一扫"'
      } else if (ifCode === 'alipay') {
        this.payText = '请使用支付宝客户端"扫一扫"'
      }

      // 当前客户端CID
      const cid = appId + new Date().getTime()
      // 获取二维码地址
      getChannelUserQrImgUrl(ifCode, appId, cid).then(res => {
        that.qrImgUrl = res

        that.visible = true // 打开弹窗

        // 监听响应结果
        that.transferOrderWebSocket = new ReconnectingWebSocket(getWebSocketPrefix() + '/api/anon/ws/channelUserId/' + appId + '/' + cid)
        that.transferOrderWebSocket.onopen = () => {}
        that.transferOrderWebSocket.onmessage = (msgObject) => {
          that.$emit('changeChannelUserId', { channelUserId: msgObject.data, extObject: that.extObject }) // 上层赋值
          that.handleClose()
        }
      })
    },
    handleClose (e) {
      if (this.transferOrderWebSocket) {
        this.transferOrderWebSocket.close()
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
