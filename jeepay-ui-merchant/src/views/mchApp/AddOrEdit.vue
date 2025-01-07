<template>
  <a-drawer
    v-model:open="vdata.open"
    :title="vdata.isAdd ? '新增应用' : '修改应用'"
    width="40%"
    :maskClosable="false"
    @close="onClose"
  >
    <a-form ref="infoFormModel" :model="vdata.saveObject" layout="vertical" :rules="vdata.rules">
      <a-row :gutter="16">
        <a-col :span="12" v-if="!vdata.isAdd">
          <a-form-item label="应用 AppId" prop="appId">
            <a-input
              v-model:value="vdata.saveObject.appId"
              placeholder="请输入"
              :disabled="!vdata.isAdd"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="应用名称" prop="appName">
            <a-input v-model:value="vdata.saveObject.appName" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态" prop="state">
            <a-radio-group v-model:value="vdata.saveObject.state">
              <a-radio :value="1">启用</a-radio>
              <a-radio :value="0">停用</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="私钥 AppSecret" prop="appSecret">
            <a-textarea
              v-model:value="vdata.saveObject.appSecret"
              :placeholder="vdata.saveObject.appSecret_ph"
            />
            <a-button type="primary" ghost @click="randomKey(false, 128, 0)">
              <a-icon type="file-sync" />
              随机生成私钥
            </a-button>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="备注" prop="remark">
            <a-input v-model:value="vdata.saveObject.remark" placeholder="请输入" />
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
import { API_URL_MCH_APP, req } from '@/api/manage'
import { reactive, ref, getCurrentInstance } from 'vue'
const { $infoBox, $access, $hasAgentEnt, $SYS_NAME_MAP } =
  getCurrentInstance()!.appContext.config.globalProperties

const props: any = defineProps({
  callbackFunc: { type: Function, default: () => {} },
})

const infoFormModel = ref()

const vdata: any = reactive({
  isAdd: true, // 新增 or 修改
  open: false, // 抽屉开关
  appId: '', // 应用AppId
  saveObject: {}, // 数据对象
  rules: {
    appName: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
  },
})

// 抽屉显示
function show(appId) {
  vdata.isAdd = !appId
  // 数据清空
  vdata.saveObject = {
    state: 1,
    appSecret: '',
    appSecret_ph: '请输入',
  }

  if (infoFormModel.value) {
    infoFormModel.value.resetFields()
  }

  vdata.rules.appSecret = []
  if (!vdata.isAdd) {
    // 修改信息 延迟展示弹层
    vdata.appId = appId
    // 拉取详情
    req.getById(API_URL_MCH_APP, appId).then((res) => {
      vdata.saveObject = res
      vdata.saveObject.appSecret_ph = res.appSecret
      vdata.saveObject.appSecret = ''
    })
    vdata.open = true
  } else {
    // 新增时，appSecret必填
    vdata.rules.appSecret.push({
      required: true,
      message: '请输入私钥或点击随机生成私钥',
      trigger: 'blur',
    })

    vdata.open = true // 展示弹层信息
  }
}
// 表单提交
function onSubmit() {
  infoFormModel.value.validate().then((valid) => {
    if (valid) {
      // 验证通过
      delete vdata.saveObject.appSecret_ph
      // 请求接口
      if (vdata.isAdd) {
        req.add(API_URL_MCH_APP, vdata.saveObject).then((res) => {
          $infoBox.message.success('新增成功')
          vdata.open = false
          props.callbackFunc() // 刷新列表
        })
      } else {
        if (vdata.saveObject.appSecret === '') {
          delete vdata.saveObject.appSecret
        }
        req.updateById(API_URL_MCH_APP, vdata.appId, vdata.saveObject).then((res) => {
          $infoBox.message.success('修改成功')
          vdata.open = false
          props.callbackFunc() // 刷新列表
        })
      }
    }
  })
}
function randomKey(randomFlag, min, max) {
  // 生成随机128位私钥
  let str = ''
  let range = min
  const arr = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ]
  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min
  }
  for (var i = 0; i < range; i++) {
    var pos = Math.round(Math.random() * (arr.length - 1))
    str += arr[pos]
  }
  vdata.saveObject.appSecret = str
}
function onClose() {
  vdata.open = false
}

defineExpose({ show })
</script>

<style lang="less" scoped></style>
