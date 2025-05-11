<template>
  <a-drawer
    v-model:open="vdata.isShow"
    title="分配角色"
    width="30%"
    :maskClosable="true"
    @close="vdata.isShow = false"
  >
    <div>
      <div :style="{ borderBottom: '1px solid #E9E9E9' }">
        <a-checkbox
          :indeterminate="
            vdata.checkedVal.length && vdata.allRoleList.length != vdata.checkedVal.length
          "
          :checked="vdata.checkedVal.length && vdata.allRoleList.length == vdata.checkedVal.length"
          @change="onCheckAllChange"
        >
          全选
        </a-checkbox>
      </div>
      <br />
      <a-checkbox-group v-model:value="vdata.checkedVal" :options="vdata.allRoleList" />
    </div>

    <div class="drawer-btn-center">
      <a-button :style="{ marginRight: '8px' }" @click="vdata.isShow = false">取消</a-button>
      <a-button type="primary" @click="handleOkFunc" :loading="vdata.confirmLoading">保存</a-button>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import {
  uSysUserRoleRela,
  req,
  reqLoad,
  API_URL_ROLE_LIST,
  API_URL_USER_ROLE_RELA_LIST,
} from '@/api/manage'
import { reactive, getCurrentInstance } from 'vue'

const { $infoBox, $access, $hasAgentEnt } = getCurrentInstance()!.appContext.config.globalProperties

const props = defineProps({
  callbackFunc: { type: Function, default: () => {} },
})

const vdata: any = reactive({
  confirmLoading: false, // 显示确定按钮loading图标
  isShow: false, // 是否显示弹层/抽屉
  recordId: null, // 更新对象ID

  allRoleList: [], // 全部的角色集合 {label: '', value: ''}
  checkedVal: [], // 已选择的数据集合
})

function show(recordId) {
  // 弹层打开事件

  // 重置数据
  vdata.allRoleList = []
  vdata.checkedVal = []
  vdata.confirmLoading = false // 关闭loading
  vdata.recordId = recordId

  // 查询所有角色列表
  reqLoad.list(API_URL_ROLE_LIST, { pageSize: -1 }).then((res) => {
    if (res.total <= 0) {
      return $infoBox.message.error(`当前暂无角色，请先行添加`)
    }

    vdata.allRoleList = []
    res.records.map((role) => {
      vdata.allRoleList.push({ label: role.roleName, value: role.roleId })
    })
    vdata.isShow = true

    // 查询已分配的列表
    req.list(API_URL_USER_ROLE_RELA_LIST, { pageSize: -1, userId: recordId }).then((relaRes) => {
      relaRes.records.map((rela) => {
        vdata.checkedVal.push(rela.roleId)
      })
    })
  })
}

function handleOkFunc() {
  // 点击【确认】按钮事件

  vdata.confirmLoading = true // 显示loading
  uSysUserRoleRela(vdata.recordId, vdata.checkedVal)
    .then((res) => {
      $infoBox.message.success('更新成功！')
      vdata.isShow = false

      if (vdata.callbackFunc !== undefined) {
        props.callbackFunc() // 刷新列表
      }
    })
    .catch(() => {
      vdata.confirmLoading = false
    }) // 恢复loading
}

function onCheckAllChange(e) {
  // 点击全选/非全选的状态更改

  vdata.checkedVal = []
  if (e.target.checked) {
    // 全选
    vdata.allRoleList.map((role) => {
      vdata.checkedVal.push(role.value)
    })
  }
}

defineExpose({ show })
</script>
