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
      <a-form-item label="组名称：" name="receiverGroupName">
        <a-input v-model:value="vdata.saveObject.receiverGroupName" />
      </a-form-item>

      <a-form-item label="自动分账组" name="autoDivisionFlag">
        <a-radio-group v-model:value="vdata.saveObject.autoDivisionFlag">
          <a-radio :value="1">是</a-radio>
          <a-radio :value="0">否</a-radio>
        </a-radio-group>
        <hr />
        <p style="color: indianred">
          1. 自动分账组: 当订单分账模式为自动分账，该组下的所有正常分账状态的账号将作为订单分账对象
        </p>
        <p style="color: indianred">
          2. 每个商户仅有一个默认分账组， 当该组更新为自动分账时，其他组将改为否
        </p>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { API_URL_DIVISION_RECEIVER_GROUP, req } from '@/api/manage'
import { reactive, ref, getCurrentInstance } from 'vue'
const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const props = defineProps({
  callbackFunc: { type: Function, default: () => {} },
})

const vdata: any = reactive({
  confirmLoading: false, // 显示确定按钮loading图标
  isAdd: true, // 新增 or 修改页面标识
  isShow: false, // 是否显示弹层/抽屉
  saveObject: { autoDivisionFlag: 0 }, // 数据对象
  recordId: null, // 更新对象ID
  rules: {
    receiverGroupName: [{ required: true, message: '请输入组名称', trigger: 'blur' }],
  },
})

const infoFormModel = ref()

function show(recordId) {
  // 弹层打开事件
  vdata.isAdd = !recordId
  vdata.saveObject = { autoDivisionFlag: 0 } // 数据清空
  vdata.confirmLoading = false // 关闭loading

  if (infoFormModel.value) {
    infoFormModel.value.resetFields()
  }

  if (!vdata.isAdd) {
    // 修改信息 延迟展示弹层
    vdata.recordId = recordId
    req.getById(API_URL_DIVISION_RECEIVER_GROUP, recordId).then((res) => {
      vdata.saveObject = res
      vdata.isShow = true
    })
  } else {
    vdata.isShow = true // 立马展示弹层信息
  }
}

function handleOkFunc() {
  // 点击【确认】按钮事件
  infoFormModel.value.validate().then((valid) => {
    if (valid) {
      vdata.confirmLoading = true // 显示loading

      if (vdata.isAdd) {
        req
          .add(API_URL_DIVISION_RECEIVER_GROUP, vdata.saveObject)
          .then((res) => {
            $infoBox.message.success('添加成功')
            vdata.isShow = false
            props.callbackFunc() // 刷新列表
          })
          .catch((res) => {
            vdata.confirmLoading = false
          })
      } else {
        req
          .updateById(API_URL_DIVISION_RECEIVER_GROUP, vdata.recordId, vdata.saveObject)
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
