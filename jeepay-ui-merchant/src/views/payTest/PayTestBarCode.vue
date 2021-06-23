<template>
  <div>
    <a-modal v-model="visible" title="条码支付" @cancel="handleChose" :footer="null" :width="350">
      <div>
        <p>请输入用户条形码:</p>
        <div style="display:flex;flex-direction:row;margin-bottom:14px;">
          <a-input v-model="barCodeValue" ref="barCodeInput" @keyup.enter="handleOk"></a-input>
          <a-button @click="handleOk" type="primary" style="margin-left:10px;" >确认支付</a-button>
        </div>
        <p>或者使用(扫码枪/扫码盒)扫码:</p>
        <div style="text-align:center">
          <img src="@/assets/payTestImg/scan.svg" alt="">
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script>
export default {
  data () {
    return {
      visible: false,
      barCodeValue: '' // 条码的值
    }
  },
  methods: {
    showModal () {
      this.barCodeValue = ''// 清空条码的值
      this.visible = true
      this.$nextTick(() => { // 弹窗展示后，输入框默认展示焦点
        this.$refs.barCodeInput.focus()
      })
    },

    // 按钮的点击事件，当使用扫码设备扫码后，也会自动吊起该事件
    handleOk () {
      // 传递条码值给父组件
      this.$emit('barCodeValue', this.barCodeValue)
    },
    handleChose () {
      // 点击×关闭，或者点击蒙版关闭时，设置父组件barCodeAgain的值为false
      this.$emit('CodeAgainChange')
    }
  }
}
</script>
