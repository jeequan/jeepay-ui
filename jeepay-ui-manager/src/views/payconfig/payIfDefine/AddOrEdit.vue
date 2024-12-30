<template>
  <a-drawer
    v-model:open="vdata.open"
    :title="vdata.isAdd ? '新增支付接口' : '修改支付接口'"
    width="40%"
    :maskClosable="false"
    @close="onClose"
  >
    <a-form ref="infoFormModel" :model="vdata.saveObject" layout="vertical" :rules="vdata.rules">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="接口代码" name="ifCode">
            <a-input
              v-model:value="vdata.saveObject.ifCode"
              placeholder="请输入"
              :disabled="!vdata.isAdd"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="接口名称" name="ifName">
            <a-input v-model:value="vdata.saveObject.ifName" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否支持普通商户模式" name="isMchMode">
            <a-radio-group v-model:value="vdata.saveObject.isMchMode">
              <a-radio :value="1">支持</a-radio>
              <a-radio :value="0">不支持</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否支持服务商子商户模式" name="isIsvMode">
            <a-radio-group v-model:value="vdata.saveObject.isIsvMode">
              <a-radio :value="1">支持</a-radio>
              <a-radio :value="0">不支持</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="支付参数配置页面类型" name="configPageType">
            <a-radio-group v-model:value="vdata.saveObject.configPageType">
              <a-radio :value="1">根据接口配置定义描述渲染页面</a-radio>
              <a-radio :value="2">自定义页面</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col
          :span="24"
          v-if="vdata.saveObject.isIsvMode == 1 && vdata.saveObject.configPageType === 1"
        >
          <a-form-item label="服务商接口配置定义描述" name="isvParams">
            <a-input
              v-model:value="vdata.saveObject.isvParams"
              placeholder="请输入"
              type="textarea"
            />
          </a-form-item>
        </a-col>
        <a-col
          :span="24"
          v-if="vdata.saveObject.isIsvMode == 1 && vdata.saveObject.configPageType === 1"
        >
          <a-form-item label="特约商户接口配置定义描述" name="isvsubMchParams">
            <a-input
              v-model:value="vdata.saveObject.isvsubMchParams"
              placeholder="请输入"
              type="textarea"
            />
          </a-form-item>
        </a-col>
        <a-col
          :span="24"
          v-if="vdata.saveObject.isMchMode == 1 && vdata.saveObject.configPageType === 1"
        >
          <a-form-item label="普通商户接口配置定义描述" name="normalMchParams">
            <a-input
              v-model:value="vdata.saveObject.normalMchParams"
              placeholder="请输入"
              type="textarea"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态" name="state">
            <a-radio-group v-model:value="vdata.saveObject.state">
              <a-radio :value="1">启用</a-radio>
              <a-radio :value="0">停用</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="备注" name="remark">
            <a-input v-model:value="vdata.saveObject.remark" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="支持的支付方式" name="checkedList">
            <a-checkbox-group
              v-model:checked="vdata.checkedList"
              :options="vdata.wayCodesOptions"
              @change="onWayCodesChange"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="页面展示：卡片icon" name="icon">
            <JeepayUpload
              :action="vdata.action"
              accept=".jpg, .jpeg, .png"
              @uploadSuccess="uploadSuccess($event, '')"
            >
              <template #uploadSlot="{ loading }">
                <img :src="vdata.saveObject.icon" style="width: 80px" />
                <a-button style="margin-left: 5px">
                  <a-icon :type="vdata.loading ? 'loading' : 'upload'" />
                  {{ vdata.loading ? '正在上传' : '点击上传' }}
                </a-button>
              </template>
            </JeepayUpload>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="页面展示：卡片背景色" name="bgColor">
            <a-input v-model:value="vdata.saveObject.bgColor" placeholder="请输入" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <div class="drawer-btn-center">
      <a-button @click="onClose" :style="{ marginRight: '8px' }">取消</a-button>
      <a-button type="primary" @click="onSubmit">保存</a-button>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { API_URL_IFDEFINES_LIST, API_URL_PAYWAYS_LIST, req, upload } from '@/api/manage'
import { reactive, ref, getCurrentInstance } from 'vue'

const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const props = defineProps({
  callbackFunc: { type: Function, default: () => () => ({}) },
})

const validateNormalMchParams = (rule, value, callback) => {
  // 普通商户接口配置定义描述 验证器
  if (vdata.saveObject.isMchMode === 1 && vdata.saveObject.configPageType === 1 && !value) {
    return Promise.reject('请输入普通商户接口配置定义描述')
  }
  return Promise.resolve()
}
const validateIsvParams = (rule, value, callback) => {
  // 服务商接口配置定义描述 验证器
  if (vdata.saveObject.isIsvMode === 1 && vdata.saveObject.configPageType === 1 && !value) {
    return Promise.reject('请输入服务商接口配置定义描述')
  }
  return Promise.resolve()
}
const validateIsvsubMchParams = (rule, value, callback) => {
  // 特约商户接口配置定义描述 验证器
  if (vdata.saveObject.isIsvMode === 1 && vdata.saveObject.configPageType === 1 && !value) {
    return Promise.reject('请输入特约商户接口配置定义描述')
  }
  return Promise.resolve()
}
const validateWayCodes = (rule, value, callback) => {
  // 支付方式 验证器
  if (vdata.checkedList.length <= 0) {
    return Promise.reject('请选择支付方式')
  }
  return Promise.resolve()
}

const vdata: any = reactive({
  isAdd: true, // 新增 or 修改
  open: false, // 抽屉开关
  action: upload.ifBG, // 上传图标地址
  ifCode: '', // 支付接口定义id
  saveObject: {}, // 数据对象
  rules: {
    ifCode: [{ required: true, message: '请输入接口代码', trigger: 'blur' }],
    ifName: [{ required: true, message: '请输入接口名称', trigger: 'blur' }],
    normalMchParams: [{ validator: validateNormalMchParams, trigger: 'blur' }],
    isvParams: [{ validator: validateIsvParams, trigger: 'blur' }],
    isvsubMchParams: [{ validator: validateIsvsubMchParams, trigger: 'blur' }],
    checkedList: [{ validator: validateWayCodes, trigger: 'blur' }],
  },
  wayCodesOptions: [], // 支付方式多选框选项列表
  checkedList: [], // 选中的数据
})

const infoFormModel = ref()

// 抽屉显示
function show(ifCode) {
  vdata.isAdd = !ifCode
  // 数据清空
  vdata.saveObject = {
    isMchMode: 1,
    isIsvMode: 1,
    state: 1,
    configPageType: 1,
  }

  if (infoFormModel.value) {
    infoFormModel.value.resetFields()
  }

  if (!vdata.isAdd) {
    // 修改信息 延迟展示弹层
    vdata.ifCode = ifCode
    // 拉取详情
    req.getById(API_URL_IFDEFINES_LIST, ifCode).then((res) => {
      vdata.saveObject = res
      const newItems: any = [] // 多选框赋值
      res.wayCodes.forEach((item) => {
        newItems.push(item.wayCode)
      })
      vdata.checkedList = newItems
    })
    vdata.open = true
  } else {
    vdata.checkedList = [] // 多选框设置空
    vdata.open = true // 展示弹层信息
  }
}
function onClose() {
  vdata.open = false
}
// 表单提交
function onSubmit() {
  infoFormModel.value.validate().then((valid) => {
    if (valid) {
      // 验证通过
      vdata.saveObject.wayCodeStrs = vdata.checkedList.join(',')
      // 请求接口
      if (vdata.isAdd) {
        req.add(API_URL_IFDEFINES_LIST, vdata.saveObject).then((res) => {
          $infoBox.message.success('新增成功')
          vdata.open = false
          props.callbackFunc() // 刷新列表
        })
      } else {
        req.updateById(API_URL_IFDEFINES_LIST, vdata.ifCode, vdata.saveObject).then((res) => {
          $infoBox.message.success('修改成功')
          vdata.open = false
          props.callbackFunc() // 刷新列表
        })
      }
    }
  })
}
// 支付方式列表
function payWayList() {
  req.list(API_URL_PAYWAYS_LIST, { pageSize: '-1' }).then((res) => {
    res.records.forEach((item) => {
      vdata.wayCodesOptions.push({
        label: item.wayName,
        value: item.wayCode,
      })
    })
  })
}

payWayList()
// 上传文件成功回调方法，参数value为文件地址，name是自定义参数
function uploadSuccess(value, name) {
  vdata.saveObject.icon = value
  // this.$forceUpdate()
}
function onWayCodesChange(checkedValues) {
  vdata.checkedList = checkedValues
}

defineExpose({ show })
</script>

<style lang="less" scoped></style>
