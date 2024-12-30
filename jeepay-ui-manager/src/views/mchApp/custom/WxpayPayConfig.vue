<template>
  <a-drawer
    v-model:open="vdata.open"
    title="填写参数"
    width="40%"
    :closable="true"
    :maskClosable="false"
    :body-style="{ paddingBottom: '80px' }"
    @close="onClose"
  >
    <a-form ref="infoFormModel" :model="vdata.saveObject" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="状态" name="state">
            <a-radio-group v-model:value="vdata.saveObject.state">
              <a-radio :value="1">启用</a-radio>
              <a-radio :value="0">停用</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="备注" name="remark">
            <a-input v-model:value="vdata.saveObject.remark" placeholder="请输入" type="textarea" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <a-divider orientation="left">
      <a-tag color="#FF4B33">{{ vdata.saveObject.ifCode }} 商户参数配置</a-tag>
    </a-divider>
    <a-form
      ref="mchParamFormModel"
      :model="vdata.ifParams"
      layout="vertical"
      :rules="ifParamsRules"
    >
      <a-row v-if="vdata.mchType === 1" :gutter="16">
        <a-col span="12">
          <a-form-item label="微信支付商户号" name="mchId">
            <a-input v-model:value="vdata.ifParams.mchId" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="应用AppID" name="appId">
            <a-input v-model:value="vdata.ifParams.appId" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="应用AppSecret" name="appSecret">
            <a-input
              v-model:value="vdata.ifParams.appSecret"
              :placeholder="vdata.ifParams.appSecret_ph"
            />
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="oauth2地址（置空将使用官方）" name="oauth2Url">
            <a-input v-model:value="vdata.ifParams.oauth2Url" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="微信支付API版本" name="apiVersion">
            <a-radio-group v-model:value="vdata.ifParams.apiVersion" defaultValue="V2">
              <a-radio value="V2">V2</a-radio>
              <a-radio value="V3">V3</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col span="24">
          <a-form-item label="APIv2密钥" name="key">
            <a-input
              v-model:value="vdata.ifParams.key"
              :placeholder="vdata.ifParams.key_ph"
              type="textarea"
            />
          </a-form-item>
        </a-col>
        <a-col span="24">
          <a-form-item label="APIv3秘钥" name="apiV3Key">
            <a-input
              v-model:value="vdata.ifParams.apiV3Key"
              :placeholder="vdata.ifParams.apiV3Key_ph"
              type="textarea"
            />
          </a-form-item>
        </a-col>
        <a-col span="24">
          <a-form-item label="序列号" name="serialNo">
            <a-input
              v-model:value="vdata.ifParams.serialNo"
              :placeholder="vdata.ifParams.serialNo_ph"
              type="textarea"
            />
          </a-form-item>
        </a-col>
        <a-col span="24">
          <a-form-item label="API证书(apiclient_cert.p12)" name="cert">
            <a-input v-model:value="vdata.ifParams.cert" disabled="disabled" />
            <JeepayUpload
              :action="vdata.action"
              :fileUrl="vdata.ifParams.cert"
              @uploadSuccess="uploadSuccess($event, 'cert')"
            >
              <template #uploadSlot="{ loading }">
                <a-button style="margin-top: 5px">
                  <a-icon :type="loading ? 'loading' : 'upload'" />
                  {{ loading ? '正在上传' : '点击上传' }}
                </a-button>
              </template>
            </JeepayUpload>
          </a-form-item>
        </a-col>
        <a-col span="24">
          <a-form-item label="证书文件(apiclient_cert.pem)" name="apiClientCert">
            <a-input v-model:value="vdata.ifParams.apiClientCert" disabled="disabled" />
            <JeepayUpload
              :action="vdata.action"
              :fileUrl="vdata.ifParams.apiClientCert"
              @uploadSuccess="uploadSuccess($event, 'apiClientCert')"
            >
              <template #uploadSlot="{ loading }">
                <a-button style="margin-top: 5px">
                  <a-icon :type="loading ? 'loading' : 'upload'" />
                  {{ loading ? '正在上传' : '点击上传' }}
                </a-button>
              </template>
            </JeepayUpload>
          </a-form-item>
        </a-col>
        <a-col span="24">
          <a-form-item label="私钥文件(apiclient_key.pem)" name="apiClientKey">
            <a-input v-model:value="vdata.ifParams.apiClientKey" disabled="disabled" />
            <JeepayUpload
              :action="vdata.action"
              :fileUrl="vdata.ifParams.apiClientKey"
              @uploadSuccess="uploadSuccess($event, 'apiClientKey')"
            >
              <template #uploadSlot="{ loading }">
                <a-button style="margin-top: 5px">
                  <a-icon :type="loading ? 'loading' : 'upload'" />
                  {{ loading ? '正在上传' : '点击上传' }}
                </a-button>
              </template>
            </JeepayUpload>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row v-else-if="vdata.mchType === 2" :gutter="16">
        <a-col span="12">
          <a-form-item label="子商户ID" name="subMchId">
            <a-input v-model:value="vdata.ifParams.subMchId" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="子账户appID(线上支付必填)" name="subMchAppId">
            <a-input v-model:value="vdata.ifParams.subMchAppId" placeholder="请输入" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div v-if="$access('ENT_MCH_PAY_CONFIG_ADD')" class="drawer-btn-center">
      <a-button :style="{ marginRight: '8px' }" @click="onClose">取消</a-button>
      <a-button type="primary" :loading="vdata.btnLoading" @click="onSubmit">保存</a-button>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { API_URL_MCH_PAYCONFIGS_LIST, req, getMchPayConfigUnique, upload } from '@/api/manage'
import { reactive, ref, getCurrentInstance } from 'vue'
const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const props = defineProps({
  callbackFunc: { type: Function, default: () => ({}) },
})

const vdata: any = reactive({
  btnLoading: false,
  open: false, // 抽屉开关
  isAdd: true,
  mchType: 1,
  action: upload.cert, // 上传文件地址
  saveObject: {}, // 保存的对象
  ifParams: { apiVersion: 'V2' }, // 参数配置对象
})

const infoFormModel = ref()
const mchParamFormModel = ref()

const ifParamsRules = reactive({
  mchId: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.mchType === 1 && !value) {
          return Promise.reject('请输入微信支付商户号')
        }
        return Promise.resolve()
      },
    },
  ],
  appId: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.mchType === 1 && !value) {
          return Promise.reject('请输入应用AppID')
        }
        return Promise.resolve()
      },
    },
  ],
  appSecret: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.isAdd && vdata.mchType === 1 && !value) {
          return Promise.reject('请输入应用AppSecret')
        }
        return Promise.resolve()
      },
    },
  ],
  key: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.ifParams.apiVersion === 'V2' && vdata.isAdd && vdata.mchType === 1 && !value) {
          return Promise.reject('请输入API密钥')
        }
        return Promise.resolve()
      },
    },
  ],
  apiV3Key: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.ifParams.apiVersion === 'V3' && vdata.isAdd && vdata.mchType === 1 && !value) {
          return Promise.reject('请输入API V3秘钥')
        }
        return Promise.resolve()
      },
    },
  ],
  serialNo: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.ifParams.apiVersion === 'V3' && vdata.isAdd && vdata.mchType === 1 && !value) {
          return Promise.reject('请输入序列号')
        }
        return Promise.resolve()
      },
    },
  ],
  cert: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.ifParams.apiVersion === 'V3' && vdata.isAdd && !value) {
          return Promise.reject('请上传API证书(apiclient_cert.p12)')
        }
        return Promise.resolve()
      },
    },
  ],
  apiClientCert: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.ifParams.apiVersion === 'V3' && vdata.isAdd && !value) {
          return Promise.reject('请上传证书文件(apiclient_cert.pem)')
        }
        return Promise.resolve()
      },
    },
  ],
  apiClientKey: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (
          vdata.ifParams.apiVersion === 'V3' &&
          vdata.mchType === 1 &&
          !vdata.ifParams.apiClientKey
        ) {
          return Promise.reject('请上传私钥文件(apiclient_key.pem)')
        }
        return Promise.resolve()
      },
    },
  ],
  subMchId: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.mchType === 2 && !value) {
          return Promise.reject('请输入子商户ID')
        }
        return Promise.resolve()
      },
    },
  ],
})

// 弹层打开事件
function show(appId, record) {
  if (infoFormModel.value) {
    infoFormModel.value.resetFields()
  }
  if (mchParamFormModel.value !== undefined) {
    mchParamFormModel.value.resetFields()
  }

  vdata.mchType = record.mchType

  // 数据初始化
  vdata.saveObject = {
    infoId: appId,
    ifCode: record.ifCode,
    state: record.ifConfigState === 0 ? 0 : 1,
  }

  // 参数配置对象，数据初始化
  vdata.ifParams = {
    apiVersion: 'V2',
    appSecret: '',
    appSecret_ph: '请输入',
    key: '',
    key_ph: '请输入',
    apiV3Key: '',
    apiV3Key_ph: '请输入',
    serialNo: '',
    serialNo_ph: '请输入',
  }
  vdata.open = true
  getMchPayConfig()
}
// 支付参数配置
function getMchPayConfig() {
  // 获取支付参数
  getMchPayConfigUnique(vdata.saveObject.infoId, vdata.saveObject.ifCode).then((res) => {
    if (res && res.ifParams) {
      vdata.saveObject = res
      vdata.ifParams = JSON.parse(res.ifParams)

      vdata.ifParams.appSecret_ph = vdata.ifParams.appSecret
      vdata.ifParams.appSecret = ''

      vdata.ifParams.key_ph = vdata.ifParams.key
      vdata.ifParams.key = ''

      vdata.ifParams.apiV3Key_ph = vdata.ifParams.apiV3Key
      vdata.ifParams.apiV3Key = ''

      vdata.ifParams.serialNo_ph = vdata.ifParams.serialNo
      vdata.ifParams.serialNo = ''

      vdata.isAdd = false
    } else if (res === undefined) {
      vdata.isAdd = true
    }
  })
}
// 表单提交
function onSubmit() {
  infoFormModel.value.validate().then((valid) => {
    mchParamFormModel.value.validate().then((valid2) => {
      if (valid && valid2) {
        // 验证通过
        vdata.btnLoading = true
        const reqParams: any = {}
        reqParams.infoId = vdata.saveObject.infoId
        reqParams.ifCode = vdata.saveObject.ifCode
        // reqParams.ifRate = vdata.saveObject.ifRate
        reqParams.state = vdata.saveObject.state
        reqParams.remark = vdata.saveObject.remark
        // 支付参数配置不能为空
        if (Object.keys(vdata.ifParams).length === 0) {
          $infoBox.message.error('参数不能为空！')
          return
        }
        // 脱敏数据为空时，删除该key
        clearEmptyKey('appSecret')
        clearEmptyKey('key')
        clearEmptyKey('apiV3Key')
        clearEmptyKey('serialNo')
        reqParams.ifParams = JSON.stringify(vdata.ifParams)
        // 请求接口
        if (Object.keys(reqParams).length === 0) {
          $infoBox.message.error('参数不能为空！')
          return
        }
        req.add(API_URL_MCH_PAYCONFIGS_LIST, reqParams).then((res) => {
          vdata.$message.success('保存成功')
          vdata.open = false
          vdata.btnLoading = false
          props.callbackFunc()
        })
      }
    })
  })
}
// 脱敏数据为空时，删除对应key
function clearEmptyKey(key) {
  if (!vdata.ifParams[key]) {
    vdata.ifParams[key] = undefined
  }
  vdata.ifParams[key + '_ph'] = undefined
}

// 上传文件成功回调方法，参数value为文件地址，name是自定义参数
function uploadSuccess(value, name) {
  vdata.ifParams[name] = value
  // $forceUpdate()
}
function onClose() {
  vdata.open = false
}

defineExpose({ show })
</script>
<style lang="less" scoped></style>
