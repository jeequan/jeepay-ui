<template>
  <a-drawer
    :maskClosable="false"
    v-model:open="vdata.open"
    :title="vdata.isAdd ? '新增服务商' : '修改服务商'"
    @close="onClose"
    :body-style="{ paddingBottom: '80px' }"
    width="40%"
  >
    <a-form ref="infoFormModel" :model="vdata.saveObject" layout="vertical" :rules="vdata.rules">
      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-item label="服务商名称" name="isvName">
            <a-input placeholder="请输入服务商名称" v-model:value="vdata.saveObject.isvName" />
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item label="服务商简称" name="isvShortName">
            <a-input placeholder="请输入服务商简称" v-model:value="vdata.saveObject.isvShortName" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-item label="联系人姓名" name="contactName">
            <a-input placeholder="请输入联系人姓名" v-model:value="vdata.saveObject.contactName" />
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item label="联系人手机号" name="contactTel">
            <a-input
              placeholder="请输入联系人手机号"
              v-model:value="vdata.saveObject.contactTel"
            ></a-input>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-item label="联系人邮箱" name="contactEmail">
            <a-input
              placeholder="请输入联系人邮箱"
              v-model:value="vdata.saveObject.contactEmail"
            ></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item label="状态" name="state">
            <a-radio-group v-model:value="vdata.saveObject.state" :defaultValue="1">
              <a-radio :value="1">启用</a-radio>
              <a-radio :value="0">禁用</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row justify="space-between" type="flex">
        <a-col :span="24">
          <a-form-item label="备注" name="remark">
            <a-textarea v-model:value="vdata.saveObject.remark" placeholder="请输入备注" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div class="drawer-btn-center">
      <a-button @click="onClose" style="margin-right: 8px">取消</a-button>
      <a-button
        type="primary"
        style="margin-right: 8px"
        @click="handleOkFunc"
        :loading="vdata.btnLoading"
      >
        保存
      </a-button>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { API_URL_ISV_LIST, req } from '@/api/manage'
import { reactive, getCurrentInstance, ref } from 'vue'
const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const props = defineProps({
  callbackFunc: { type: Function, default: () => {} },
})

const infoFormModel = ref()
const infoTable = ref()

const vdata: any = reactive({
  btnLoading: false,
  isAdd: true, // 新增 or 修改页面标志
  saveObject: {}, // 数据对象
  recordId: null, // 更新对象ID
  open: false, // 是否显示弹层/抽屉
  rules: {
    isvName: [{ required: true, message: '请输入服务商名称', trigger: 'blur' }],
    isvShortName: [{ required: true, message: '请输入服务商简称', trigger: 'blur' }],
    contactEmail: [
      {
        required: false,
        pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
        message: '请输入正确的邮箱地址',
        trigger: 'blur',
      },
    ],
    contactTel: [
      { required: false, pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' },
    ],
  },
})
function show(recordId) {
  // 弹层打开事件
  vdata.isAdd = !recordId
  vdata.saveObject = { state: 1 } // 数据清空

  if (infoFormModel.value) {
    infoFormModel.value.resetFields()
  }

  if (!vdata.isAdd) {
    // 修改信息 延迟展示弹层
    vdata.recordId = recordId
    req.getById(API_URL_ISV_LIST, recordId).then((res) => {
      vdata.saveObject = res
    })
    vdata.open = true
  } else {
    vdata.open = true // 立马展示弹层信息
  }
}

function handleOkFunc() {
  // 点击【确认】按钮事件
  infoFormModel.value.validate().then((valid) => {
    if (valid) {
      // 验证通过
      vdata.btnLoading = true
      // 请求接口
      if (vdata.isAdd) {
        req
          .add(API_URL_ISV_LIST, vdata.saveObject)
          .then((res) => {
            $infoBox.message.success('新增成功')
            vdata.open = false
            props.callbackFunc() // 刷新列表
            vdata.btnLoading = false
          })
          .catch((res) => {
            vdata.btnLoading = false
          })
      } else {
        req
          .updateById(API_URL_ISV_LIST, vdata.recordId, vdata.saveObject)
          .then((res) => {
            $infoBox.message.success('修改成功')
            vdata.open = false
            props.callbackFunc() // 刷新列表
            vdata.btnLoading = false
          })
          .catch((res) => {
            vdata.btnLoading = false
          })
      }
    }
  })
}
function onClose() {
  vdata.open = false
}
function searchFunc() {
  // 点击【查询】按钮点击事件
  infoTable.value.refTable(true)
}

defineExpose({ show })
</script>
