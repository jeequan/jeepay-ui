<template>
  <a-drawer
    v-model:open="vdata.isShow"
    :title="vdata.isAdd ? '新增角色' : '修改角色'"
    width="600"
    :maskClosable="false"
    @close="vdata.isShow = false"
  >
    <a-form
      ref="infoFormModel"
      :model="vdata.saveObject"
      :label-col="{ span: 4 }"
      :rules="vdata.rules"
    >
      <a-form-item label="角色名称：" name="roleName">
        <a-input v-model:value="vdata.saveObject.roleName" />
      </a-form-item>
    </a-form>

    <!-- 角色权限分配 -->
    <RoleDist ref="roleDistRef" />

    <div class="drawer-btn-center">
      <a-button :style="{ marginRight: '8px' }" @click="vdata.isShow = false">取消</a-button>
      <a-button type="primary" @click="handleOkFunc" :loading="vdata.confirmLoading">保存</a-button>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { API_URL_ROLE_LIST, req } from '@/api/manage'
import RoleDist from './RoleDist.vue'
import { reactive, nextTick, ref, getCurrentInstance } from 'vue'
const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const props = defineProps({
  callbackFunc: { type: Function, default: () => {} },
})

const vdata: any = reactive({
  confirmLoading: false, // 显示确定按钮loading图标
  isAdd: true, // 新增 or 修改页面标识
  isShow: false, // 是否显示弹层/抽屉
  saveObject: {}, // 数据对象
  recordId: null, // 更新对象ID
  rules: {
    roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  },
})

const infoFormModel = ref()
const roleDistRef = ref()

function show(recordId) {
  // 弹层打开事件
  vdata.isAdd = !recordId
  vdata.saveObject = {} // 数据清空
  vdata.confirmLoading = false // 关闭loading

  if (infoFormModel.value) {
    infoFormModel.value.resetFields()
  }

  if (!vdata.isAdd) {
    // 修改信息 延迟展示弹层
    vdata.recordId = recordId
    req.getById(API_URL_ROLE_LIST, recordId).then((res) => {
      vdata.saveObject = res
    })
    vdata.isShow = true
  } else {
    vdata.isShow = true // 立马展示弹层信息
  }

  // 初始化角色权限分配功能
  nextTick(() => {
    roleDistRef.value.initTree(recordId)
  })
}

function handleOkFunc() {
  // 点击【确认】按钮事件
  infoFormModel.value.validate().then((valid) => {
    if (valid) {
      // 验证通过
      // 请求接口

      vdata.confirmLoading = true // 显示loading

      // 保存选择的权限信息
      const selectedEntIdList = roleDistRef.value.getSelectedEntIdList()
      vdata.saveObject.entIdListStr = selectedEntIdList ? JSON.stringify(selectedEntIdList) : ''

      if (vdata.isAdd) {
        req
          .add(API_URL_ROLE_LIST, vdata.saveObject)
          .then((res) => {
            $infoBox.message.success('新增成功')
            vdata.isShow = false
            props.callbackFunc() // 刷新列表
          })
          .catch((res) => {
            vdata.confirmLoading = false
          })
      } else {
        req
          .updateById(API_URL_ROLE_LIST, vdata.recordId, vdata.saveObject)
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
