<template>
  <div>
    <a-modal
      v-model:open="vdata.open"
      title="条码支付"
      @cancel="handleChose"
      :footer="null"
      :width="350"
    >
      <div>
        <p>请输入用户条形码:</p>
        <div style="display: flex; flex-direction: row; margin-bottom: 14px">
          <a-input
            v-model:value="vdata.barCodeValue"
            ref="barCodeInput"
            @keyup.enter="handleOk"
          ></a-input>
          <a-button
            @click="handleOk"
            type="primary"
            style="margin-left: 10px"
            :loading="vdata.loading"
          >
            确认支付
          </a-button>
        </div>
        <p>或者使用(扫码枪/扫码盒)扫码:</p>
        <div style="text-align: center">
          <img src="@/assets/payTestImg/scan.svg" alt="" />
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import { reactive, nextTick, ref } from 'vue'

const vdata: any = reactive({
  open: false,
  barCodeValue: '', // 条码的值
  loading: false, // 按钮的loading状态
})

const emit = defineEmits(['barCodeValue', 'CodeAgainChange'])

const barCodeInput = ref()

function showModal() {
  vdata.loading = false
  vdata.barCodeValue = '' // 清空条码的值
  vdata.open = true
  nextTick(() => {
    // 弹窗展示后，输入框默认展示焦点
    barCodeInput.value.focus()
  })
}

// 按钮的点击事件，当使用扫码设备扫码后，也会自动吊起该事件
function handleOk() {
  if (vdata.barCodeValue === '') return

  // 传递条码值给父组件
  vdata.loading = true
  emit('barCodeValue', vdata.barCodeValue)
}
function handleChose() {
  // 点击×关闭，或者点击蒙版关闭时，设置父组件barCodeAgain的值为false
  emit('CodeAgainChange')
}
function getVisible() {
  return vdata.open
}

function getopen() {
  return vdata.open
}
function processCatch() {
  vdata.loading = false
}

function closeVisible(){
  vdata.open = false
}

defineExpose({ showModal, getVisible, processCatch, getopen, closeVisible })
</script>
