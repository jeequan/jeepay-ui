<template>
  <a-modal
    v-model:open="vdata.isShow"
    title="支付宝子商户扫码授权"
    @ok="handleOkFunc"
    @cancel="handleOkFunc"
  >
    <div style="text-align: center">
      <p>方式1： <br>  请商家登录【支付宝】APP, 扫描如下二维码, 按提示授权： </p>
      <img style="margin-bottom: 10px" :src="vdata.apiResData.authQrImgUrl">
      <hr>

      <p style="margin-top: 10px">
        方式2： <br> <a-button v-clipboard:copy="vdata.apiResData.authUrl" v-clipboard:success="onCopySuccess" size="small" class="copy-btn">点击复制</a-button>
        链接并发送给商户，商户进入链接，按照页面提示自主授权：
      </p>
      <a target="_blank" :href="vdata.apiResData.authUrl">{{ vdata.apiResData.authUrl }}</a>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { queryAlipayIsvsubMchAuthUrl } from '@/api/manage'
import { reactive, getCurrentInstance } from 'vue'

const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

  const props = defineProps({
    callbackFunc: { type: Function, default: () => {} }
  })

  const vdata:any = reactive({
    isShow: false, // 是否显示弹层/抽屉
    appId: '',
    apiResData: {}
  })
  
  function show (appId) { // 弹层打开事件
    vdata.apiResData = {}
    vdata.appId = appId
    queryAlipayIsvsubMchAuthUrl(appId).then(res => {
      vdata.apiResData = res
      vdata.isShow = true
    })
  }

  function onCopySuccess () {
    $infoBox.message.success('复制成功')
  }

  function handleOkFunc() { // 点击【确认】按钮事件
    vdata.isShow = false
    if (props.callbackFunc) {
      props.callbackFunc()
    }
  }

  defineExpose({ show })
</script>
