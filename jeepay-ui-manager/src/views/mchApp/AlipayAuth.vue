<template>
  <a-modal v-model="isShow" title="支付宝子商户扫码授权" @ok="handleOkFunc" @cancel="handleOkFunc">

    <div style="text-align: center">
      <p>方式1： <br/>  请商户扫码如下二维码, 按提示授权： </p>
      <img style="margin-bottom: 10px" :src="apiResData.authQrImgUrl">
      <hr/>

      <p style="margin-top: 10px">
        方式2： <br/> <a-button size="small" class="copy-btn" v-clipboard:copy="apiResData.authUrl" v-clipboard:success="onCopySuccess" >点击复制</a-button>
        链接并发送给商户，商户进入链接，按照页面提示自主授权：
      </p>
      <a target="_blank" :href="apiResData.authUrl">{{ apiResData.authUrl }}</a>
    </div>
  </a-modal>

</template>

<script>
import { queryAlipayIsvsubMchAuthUrl } from '@/api/manage'
export default {

  props: {
    callbackFunc: { type: Function }
  },

  data () {
    return {
      isShow: false, // 是否显示弹层/抽屉
      appId: '',
      apiResData: {}
    }
  },
  created () {
  },
  methods: {
    show: function (appId) { // 弹层打开事件
      this.apiResData = {}
      this.appId = appId
      const that = this
      queryAlipayIsvsubMchAuthUrl(appId).then(res => {
        that.apiResData = res
        this.isShow = true
      })
    },

    handleOkFunc: function () { // 点击【确认】按钮事件
        this.isShow = false
        if (this.callbackFunc) {
          this.callbackFunc()
        }
    },

    onCopySuccess () {
      this.$message.success('复制成功')
    }

  }
}
</script>
