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
          <a-form-item label="环境配置" name="sandbox">
            <a-radio-group v-model:value="vdata.ifParams.sandbox">
              <a-radio :value="1">沙箱环境</a-radio>
              <a-radio :value="0">生产环境</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="应用AppID" name="appId">
            <a-input v-model:value="vdata.ifParams.appId" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col span="24">
          <a-form-item label="应用私钥" name="privateKey">
            <a-input
              v-model:value="vdata.ifParams.privateKey"
              :placeholder="vdata.ifParams.privateKey_ph"
              type="textarea"
            />
          </a-form-item>
        </a-col>
        <a-col span="24">
          <a-form-item label="支付宝公钥" name="alipayPublicKey">
            <a-input
              v-model:value="vdata.ifParams.alipayPublicKey"
              :placeholder="vdata.ifParams.alipayPublicKey_ph"
              type="textarea"
            />
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="接口签名方式(推荐使用RSA2)" name="signType">
            <a-radio-group v-model:value="vdata.ifParams.signType" defaultValue="RSA">
              <a-radio value="RSA">RSA</a-radio>
              <a-radio value="RSA2">RSA2</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="公钥证书" name="useCert">
            <a-radio-group v-model:value="vdata.ifParams.useCert" defaultValue="1">
              <a-radio :value="1">使用证书（请使用RSA2私钥）</a-radio>
              <a-radio :value="0">不使用证书</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col span="24">
          <a-form-item
            label="应用公钥证书（.crt格式）"
            name="appPublicCert"
            class="margin-botomt-5"
          >
            <a-input v-model:value="vdata.ifParams.appPublicCert" disabled="disabled" />
          </a-form-item>
          <JeepayUpload
            style="margin-bottom: 20px"
            :action="vdata.action"
            :fileUrl="vdata.ifParams.appPublicCert"
            @uploadSuccess="uploadSuccess($event, 'appPublicCert')"
          >
            <template #uploadSlot="{ loading }">
              <a-button>
                <a-icon :type="loading ? 'loading' : 'upload'" />
                {{ loading ? '正在上传' : '点击上传' }}
              </a-button>
            </template>
          </JeepayUpload>
        </a-col>
        <a-col span="24">
          <a-form-item
            label="支付宝公钥证书（.crt格式）"
            name="alipayPublicCert"
            class="margin-botomt-5"
          >
            <a-input v-model:value="vdata.ifParams.alipayPublicCert" disabled="disabled" />
          </a-form-item>
          <JeepayUpload
            style="margin-bottom: 20px"
            :action="vdata.action"
            :fileUrl="vdata.ifParams.alipayPublicCert"
            @uploadSuccess="uploadSuccess($event, 'alipayPublicCert')"
          >
            <template #uploadSlot="{ loading }">
              <a-button>
                <a-icon :type="loading ? 'loading' : 'upload'" />
                {{ loading ? '正在上传' : '点击上传' }}
              </a-button>
            </template>
          </JeepayUpload>
        </a-col>
        <a-col span="24">
          <a-form-item
            label="支付宝根证书（.crt格式）"
            name="alipayRootCert"
            class="margin-botomt-5"
          >
            <a-input v-model:value="vdata.ifParams.alipayRootCert" disabled="disabled" />
          </a-form-item>
          <JeepayUpload
            :action="vdata.action"
            style="margin-bottom: 20px"
            :fileUrl="vdata.ifParams.alipayRootCert"
            @uploadSuccess="uploadSuccess($event, 'alipayRootCert')"
          >
            <template #uploadSlot="{ loading }">
              <a-button>
                <a-icon :type="loading ? 'loading' : 'upload'" />
                {{ loading ? '正在上传' : '点击上传' }}
              </a-button>
            </template>
          </JeepayUpload>
        </a-col>
      </a-row>
      <a-row v-else-if="vdata.mchType === 2" :gutter="16">
        <a-col span="12">
          <a-form-item label="子商户app_auth_token" name="appAuthToken">
            <a-input
              v-model:value="vdata.ifParams.appAuthToken"
              placeholder="请输入子商户app_auth_token"
            />
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
  ifParams: {}, // 参数配置对象
})

const ifParamsRules = reactive({
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
  privateKey: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.mchType === 1 && vdata.isAdd && !value) {
          return Promise.reject('请输入应用私钥')
        }
        return Promise.resolve()
      },
    },
  ],
  alipayPublicKey: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.mchType === 1 && vdata.isAdd && vdata.ifParams.useCert === 0 && !value) {
          return Promise.reject('请输入支付宝公钥')
        }
        return Promise.resolve()
      },
    },
  ],
  appPublicCert: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.mchType === 1 && vdata.ifParams.useCert === 1 && !vdata.ifParams.appPublicCert) {
          return Promise.reject('请上传应用公钥证书（.crt格式）')
        }
        return Promise.resolve()
      },
    },
  ],
  alipayPublicCert: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (
          vdata.mchType === 1 &&
          vdata.ifParams.useCert === 1 &&
          !vdata.ifParams.alipayPublicCert
        ) {
          return Promise.reject('请上传支付宝公钥证书（.crt格式）')
        }
        return Promise.resolve()
      },
    },
  ],
  alipayRootCert: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.mchType === 1 && vdata.ifParams.useCert === 1 && !vdata.ifParams.alipayRootCert) {
          return Promise.reject('请上传支付宝根证书（.crt格式）')
        }
        return Promise.resolve()
      },
    },
  ],
  appAuthToken: [
    {
      trigger: 'blur',
      validator: (rule, value) => {
        if (vdata.mchType === 2 && !value) {
          return Promise.reject('请输入子商户app_auth_token')
        }
        return Promise.resolve()
      },
    },
  ],
})

const infoFormModel = ref()
const mchParamFormModel = ref()

// 弹层打开事件
function show(appId, record) {
  if (infoFormModel.value) {
    infoFormModel.value.resetFields()
  }
  if (mchParamFormModel.value) {
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
    sandbox: 0,
    signType: 'RSA2',
    useCert: 0,
    privateKey: '',
    privateKey_ph: '请输入',
    alipayPublicKey: '',
    alipayPublicKey_ph: '请输入',
    appPublicCert: '',
    alipayPublicCert: '',
    alipayRootCert: '',
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

      vdata.ifParams.privateKey_ph = vdata.ifParams.privateKey
      vdata.ifParams.privateKey = ''

      vdata.ifParams.alipayPublicKey_ph = vdata.ifParams.alipayPublicKey
      vdata.ifParams.alipayPublicKey = ''

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
        // reqParams.ifRate = that.saveObject.ifRate
        reqParams.state = vdata.saveObject.state
        reqParams.remark = vdata.saveObject.remark
        // 支付参数配置不能为空
        if (Object.keys(vdata.ifParams).length === 0) {
          $infoBox.message.error('参数不能为空！')
          return
        }
        // 脱敏数据为空时，删除该key
        clearEmptyKey('privateKey')
        clearEmptyKey('alipayPublicKey')
        reqParams.ifParams = JSON.stringify(vdata.ifParams)
        // 请求接口
        if (Object.keys(reqParams).length === 0) {
          $infoBox.message.error('参数不能为空！')
          return
        }
        req
          .add(API_URL_MCH_PAYCONFIGS_LIST, reqParams)
          .then((res) => {
            $infoBox.message.success('保存成功')
            vdata.open = false
            props.callbackFunc()
          })
          .finally(() => {
            vdata.btnLoading = false
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
  // $forceUpdate() 强制更新
}

function onClose() {
  vdata.open = false
}

defineExpose({ show })
</script>
<style lang="less" scoped></style>
