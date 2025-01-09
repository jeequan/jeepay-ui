<template>
  <a-modal v-model:open="vdata.isShow" title="新增角色" @ok="handleOkFunc">
    <a-form
      ref="infoFormModel"
      :model="vdata.saveObject"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 15 }"
      :rules="vdata.rules"
    >
      <a-form-item label="角色名称：" name="roleName">
        <a-input v-model:value="vdata.saveObject.roleName" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { API_URL_ROLE_LIST, req } from '@/api/manage'
import { reactive, ref, getCurrentInstance } from 'vue'

const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const props = defineProps({
  callbackFunc: { type: Function, default: () => {} },
})

const vdata: any = reactive({
  isShow: false, // 是否显示弹层/抽屉
  saveObject: {}, // 数据对象

  rules: {
    roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  },
})

const infoFormModel = ref()

function show() {
  // 弹层打开事件
  vdata.saveObject = {} // 数据清空
  if (infoFormModel.value !== undefined) {
    infoFormModel.value.resetFields()
  }
  vdata.isShow = true
}

function handleOkFunc() {
  // 点击【确认】按钮事件
  infoFormModel.value.validate((valid) => {
    if (valid) {
      // 验证通过
      // 请求接口
      req.add(API_URL_ROLE_LIST, vdata.saveObject).then((res) => {
        $infoBox.message.success('新增成功')
        vdata.isShow = false
        // 刷新列表
        props.callbackFunc()
      })
    }
  })
}

defineExpose({
  show,
})
</script>
