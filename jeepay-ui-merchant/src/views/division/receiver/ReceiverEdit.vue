<template>
  <a-drawer
    v-model:open="vdata.isShow"
    title="修改分账用户信息"
    width="30%"
    :maskClosable="false"
    @close="vdata.isShow = false"
  >
    <a-form
      ref="infoFormModel"
      :model="vdata.saveObject"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 15 }"
      :rules="vdata.rules"
    >
      <a-form-item label="账号别名：" name="receiverAlias">
        <a-input v-model:value="vdata.saveObject.receiverAlias" />
      </a-form-item>

      <a-form-item label="默认分账比例：" name="divisionProfit">
        <a-input v-model:value="vdata.saveObject.divisionProfit" style="width: 100px" />
        %
      </a-form-item>

      <a-form-item label="状态" name="state">
        <a-radio-group v-model:value="vdata.saveObject.state">
          <a-radio :value="1">正常分账</a-radio>
          <a-radio :value="0">暂停分账</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="分组变更：" name="receiverGroupId">
        <a-select
          style="width: 210px"
          placeholder="账号分组"
          v-model:value="vdata.saveObject.receiverGroupId"
        >
          <a-select-option
            v-for="item in vdata.allReceiverGroup"
            :key="item.receiverGroupId"
            :value="item.receiverGroupId"
          >
            {{ item.receiverGroupName }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>

    <div class="drawer-btn-center">
      <a-button :style="{ marginRight: '8px' }" @click="vdata.isShow = false">取消</a-button>
      <a-button type="primary" @click="handleOkFunc" :loading="vdata.confirmLoading">保存</a-button>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { API_URL_DIVISION_RECEIVER, API_URL_DIVISION_RECEIVER_GROUP, req } from '@/api/manage'
import { reactive, getCurrentInstance, ref } from 'vue'

const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const props = defineProps({
  callbackFunc: { type: Function, default: () => {} },
})

const vdata: any = reactive({
  confirmLoading: false, // 显示确定按钮loading图标
  isShow: false, // 是否显示弹层/抽屉
  saveObject: {}, // 数据对象
  recordId: null, // 更新对象ID
  allReceiverGroup: [], // 当前商户所有的接收账号的分组情况
  rules: {
    receiverAlias: [{ required: true, message: '请输入别名', trigger: 'blur' }],
    receiverGroupId: [{ required: true, message: '请选择分组', trigger: 'blur' }],
    divisionProfit: [{ required: true, message: '请录入默认分账比例', trigger: 'blur' }],
    state: [{ required: true, message: '请选择状态', trigger: 'blur' }],
  },
})

const infoFormModel = ref()

function show(recordId) {
  // 弹层打开事件
  vdata.saveObject = {} // 数据清空
  vdata.confirmLoading = false // 关闭loading

  if (infoFormModel.value) {
    infoFormModel.value.resetFields()
  }

  vdata.recordId = recordId

  // 查询账号信息
  req.getById(API_URL_DIVISION_RECEIVER, recordId).then((res) => {
    res.divisionProfit = (res.divisionProfit * 100).toFixed(2)
    vdata.saveObject = res
  })

  // 请求接口，获取所有分组信息，只有此处进行pageSize=-1传参
  req.list(API_URL_DIVISION_RECEIVER_GROUP, { pageSize: -1 }).then((res) => {
    vdata.allReceiverGroup = res.records
  })

  vdata.isShow = true
}

function handleOkFunc() {
  // 点击【确认】按钮事件
  infoFormModel.value.validate().then((valid) => {
    if (valid) {
      // 验证通过
      vdata.confirmLoading = true // 显示loading

      var reqObject = {
        receiverAlias: vdata.saveObject.receiverAlias,
        receiverGroupId: vdata.saveObject.receiverGroupId,
        divisionProfit: vdata.saveObject.divisionProfit,
        state: vdata.saveObject.state,
      }

      req
        .updateById(API_URL_DIVISION_RECEIVER, vdata.recordId, reqObject)
        .then((res) => {
          $infoBox.message.success('修改成功')
          vdata.isShow = false
          props.callbackFunc() // 刷新列表
        })
        .catch((res) => {
          vdata.confirmLoading = false
        })
    }
  })
}

defineExpose({ show })
</script>
