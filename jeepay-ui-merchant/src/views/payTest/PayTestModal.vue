<template>
  <div>
    <a-modal v-model="visible" :title="payTitle" @ok="handleClose" :footer="null" :width="300">
      <div style="width:100%;margin-bottom:20px;text-align:center">
        <img :src="codeUr" alt="">
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
export default {
  name: 'PayTestModal',
  data () {
    return {
      visible: false,
      payTitle: '扫码支付', // 弹窗标题文字默认为 扫码支付
      payText: '', // 二维码底部描述文字
      wxApp: false, // 微信二维码图片是否展示
      aliApp: false // 支付宝二维码图片是否展示
    }
  },
  props: {
    codeUr: { type: String, default: '404' }
  },
  methods: {
    // 二维码以及条码弹窗
    showModal (payMent) {
      this.visible = true // 打开弹窗

      // 图片展示重置
      this.wxApp = false
      this.aliApp = false

      // 根据不同的支付方式，展示不同的信息
      if (payMent === 'WX_NATIVE' || payMent === 'WX_QR_CASHIER') { // 微信二维码
        this.wxApp = true
        this.payText = '请使用微信"扫一扫"扫码支付'
      } else if (payMent === 'ALI_QR' || payMent === 'ALI_QR_CASHIER') { // 支付宝二维码
        this.aliApp = true
        this.payText = '请使用支付宝"扫一扫"扫码支付'
      } else if (payMent === 'QR_CASHIER') { // 聚合支付二维码
        this.wxApp = true
        this.aliApp = true
        this.payText = '支持微信、支付宝扫码'
      }
    },
    handleClose (e) {
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
