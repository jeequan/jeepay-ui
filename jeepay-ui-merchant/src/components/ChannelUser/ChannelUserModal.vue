<template>
  <div>
    <a-modal
      v-model:open="vdata.open"
      title="自动获取渠道用户ID"
      @ok="handleClose"
      :footer="null"
      :width="300"
    >
      <div style="width: 100%; margin-bottom: 20px; text-align: center">
        <div style="display: flex; justify-content: center" class="qrcode" id="qrCodeUrl">
          <a-qrcode value="vdata.qrImgUrl" size="200" />
        </div>
        <hr />
        <span>{{ vdata.payText }}</span>
      </div>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import ReconnectingWebSocket from 'reconnectingwebsocket'
import { getWebSocketPrefix, getChannelUserQrImgUrl } from '@/api/manage'
import { reactive } from 'vue'

const emit = defineEmits(['changeChannelUserId'])

const vdata: any = reactive({
  open: false,
  qrImgUrl: '',
  payText: '', // 二维码底部描述文字
  transferOrderWebSocket: null, // 支付订单webSocket对象
  extObject: null, // 扩展对象， 将原样返回。
})

function handleClose(e?) {
  if (vdata.transferOrderWebSocket) {
    vdata.transferOrderWebSocket.close()
  }
  vdata.open = false
}

// show
function showModal(appId, ifCode, extObject) {
  vdata.extObject = extObject
  // 关闭上一个webSocket监听
  if (vdata.transferOrderWebSocket) {
    vdata.transferOrderWebSocket.close()
  }

  // 根据不同的支付方式，展示不同的信息
  vdata.payText = ''
  if (ifCode === 'wxpay') {
    vdata.payText = '请使用微信客户端"扫一扫"'
  } else if (ifCode === 'alipay') {
    vdata.payText = '请使用支付宝客户端"扫一扫"'
  }

  // 当前客户端CID
  const cid = appId + new Date().getTime()
  // 获取二维码地址
  getChannelUserQrImgUrl(ifCode, appId, cid).then((res) => {
    vdata.qrImgUrl = res

    vdata.open = true // 打开弹窗

    // 监听响应结果
    vdata.transferOrderWebSocket = new ReconnectingWebSocket(
      getWebSocketPrefix() + '/api/anon/ws/channelUserId/' + appId + '/' + cid
    )
    vdata.transferOrderWebSocket.onopen = () => {}
    vdata.transferOrderWebSocket.onmessage = (msgObject) => {
      emit('changeChannelUserId', {
        channelUserId: msgObject.data,
        extObject: vdata.extObject,
      }) // 上层赋值
      handleClose()
    }
  })
}

defineExpose({ showModal })
</script>
<style lang="less" scoped>
.describe {
  img {
    width: 30px;
    height: 25px;
  }
}
</style>
