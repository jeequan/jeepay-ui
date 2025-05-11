<template>
  <a-modal
    v-model:open="vdata.isShow"
    :title="vdata.isAdd ? '新增支付方式' : '修改支付方式'"
    @ok="handleOkFunc"
  >
    <a-form
      ref="infoFormModel"
      :model="vdata.saveObject"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 15 }"
      :rules="vdata.rules"
    >
      <a-form-item label="支付方式代码：" name="wayCode">
        <a-input v-model:value="vdata.saveObject.wayCode" :disabled="!vdata.isAdd" />
      </a-form-item>
      <a-form-item label="支付方式名称：" name="wayName">
        <a-input v-model:value="vdata.saveObject.wayName" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup lang="ts">
import { API_URL_PAYWAYS_LIST, req } from '@/api/manage'
import { reactive, ref, getCurrentInstance } from 'vue'
const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const props = defineProps({
  callbackFunc: { type: Function, default: () => () => ({}) },
})

const vdata: any = reactive({
  isAdd: true, // 新增 or 修改页面标志
  isShow: false, // 是否显示弹层/抽屉
  saveObject: {}, // 数据对象
  wayCode: null, // 更新对象ID
  rules: {
    wayCode: [{ required: true, message: '请输入支付方式代码', trigger: 'blur' }],
    wayName: [{ required: true, message: '请输入支付方式名称', trigger: 'blur' }],
  },
})

const infoFormModel = ref()

function show(wayCode) {
  // 弹层打开事件
  vdata.isAdd = !wayCode
  vdata.saveObject = {} // 数据清空

  if (infoFormModel.value) {
    infoFormModel.value.resetFields()
  }

  if (!vdata.isAdd) {
    // 修改信息 延迟展示弹层
    vdata.wayCode = wayCode
    req.getById(API_URL_PAYWAYS_LIST, wayCode).then((res) => {
      vdata.saveObject = res
    })
    vdata.isShow = true
  } else {
    vdata.isShow = true // 立马展示弹层信息
  }
}

function handleOkFunc() {
  // 点击【确认】按钮事件
  infoFormModel.value.validate().then((valid) => {
    if (valid) {
      // 验证通过
      // 请求接口
      if (vdata.isAdd) {
        req.add(API_URL_PAYWAYS_LIST, vdata.saveObject).then((res) => {
          $infoBox.message.success('新增成功')
          vdata.isShow = false
          props.callbackFunc() // 刷新列表
        })
      } else {
        req.updateById(API_URL_PAYWAYS_LIST, vdata.wayCode, vdata.saveObject).then((res) => {
          $infoBox.message.success('修改成功')
          vdata.isShow = false
          props.callbackFunc() // 刷新列表
        })
      }
    }
  })
}

defineExpose({ show })
</script>
