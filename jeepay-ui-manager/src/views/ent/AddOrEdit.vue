<template>
  <a-modal
    v-model:open="vdata.isShow"
    :title="vdata.isAdd ? '新增菜单' : '修改菜单'"
    @ok="handleOkFunc"
    :confirmLoading="vdata.confirmLoading"
  >
    <a-form
      ref="infoFormModel"
      :model="vdata.saveObject"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 15 }"
      :rules="vdata.rules"
    >
      <a-form-item label="资源名称：" name="entName">
        <a-input v-model:value="vdata.saveObject.entName" />
      </a-form-item>

      <a-form-item label="路径地址：" name="menuUri">
        <a-input v-model:value="vdata.saveObject.menuUri" />
      </a-form-item>

      <a-form-item label="排序（正序显示）：" name="entSort">
        <a-input v-model:value="vdata.saveObject.entSort" />
      </a-form-item>

      <a-form-item label="快速开始：" name="quickJump">
        <a-radio-group
          v-model:value="vdata.saveObject.quickJump"
          :disabled="vdata.saveObject.menuType == 'PB' || !vdata.saveObject.menuUri"
        >
          <a-radio :value="1">是</a-radio>
          <a-radio :value="0">否</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="状态：" name="state">
        <a-radio-group v-model:value="vdata.saveObject.state">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">停用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { API_URL_ENT_LIST, req, getEntBySysType } from '@/api/manage'
import { reactive, ref, getCurrentInstance } from 'vue'

const { $infoBox, $access, $hasAgentEnt } = getCurrentInstance()!.appContext.config.globalProperties

const props = defineProps({
  callbackFunc: { type: Function, default: () => {} },
})

const vdata: any = reactive({
  confirmLoading: false, // 显示确定按钮loading图标
  isAdd: true, // 新增 or 修改页面标识
  isShow: false, // 是否显示弹层/抽屉
  saveObject: {}, // 数据对象
  recordId: null, // 更新对象ID
  sysType: 'MGR', // 菜单类型
  rules: {
    entName: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
  },
})

const infoFormModel = ref()

function show(recordId, sysType) {
  // 弹层打开事件
  vdata.isAdd = !recordId
  vdata.sysType = sysType
  vdata.saveObject = {} // 数据清空
  vdata.confirmLoading = false // 关闭loading

  if (infoFormModel.value !== undefined) {
    infoFormModel.value.resetFields()
  }

  if (!vdata.isAdd) {
    // 修改信息 延迟展示弹层
    vdata.recordId = recordId
    getEntBySysType(recordId, sysType).then((res) => {
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

      vdata.confirmLoading = true // 显示loading

      if (vdata.isAdd) {
      } else {
        req
          .updateById(API_URL_ENT_LIST, vdata.recordId, vdata.saveObject)
          .then((res) => {
            $infoBox.message.success('修改成功')
            vdata.isShow = false
            props.callbackFunc() // 刷新列表
          })
          .catch((res) => {
            vdata.confirmLoading = false
          })
      }
    }
  })
}

defineExpose({ show })
</script>
