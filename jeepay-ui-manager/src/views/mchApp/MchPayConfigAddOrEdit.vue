<template>
  <a-drawer
    title="填写参数"
    width="40%"
    :closable="true"
    :maskClosable="false"
    v-model:open="vdata.open"
    :body-style="{ paddingBottom: '80px' }"
    @close="onClose"
  >
    <a-form ref="infoFormModel" :model="vdata.saveObject" layout="vertical" :rules="vdata.rules">
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
      :rules="vdata.ifParamsRules"
    >
      <a-row :gutter="16">
        <a-col
          v-for="(item, key) in vdata.mchParams"
          :key="key"
          :span="item.type === 'text' ? 12 : 24"
        >
          <a-form-item
            :label="item.desc"
            :name="item.name"
            v-if="item.type === 'text' || item.type === 'textarea'"
          >
            <a-input
              v-model:value="vdata.ifParams[item.name]"
              :placeholder="item.star === '1' ? vdata.ifParams[item.name + '_ph'] : '请输入'"
              :type="item.type"
            />
          </a-form-item>
          <a-form-item :label="item.desc" :name="item.name" v-else-if="item.type === 'radio'">
            <a-radio-group v-model:value="vdata.ifParams[item.name]">
              <a-radio
                v-for="(radioItem, radioKey) in item.values"
                :key="radioKey"
                :value="radioItem.value"
              >
                {{ radioItem.title }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="item.desc" :name="item.name" v-else-if="item.type === 'file'">
            <a-input v-model:value="vdata.ifParams[item.name]" disabled="disabled" />
            <JeepayUpload
              :action="vdata.action"
              :fileUrl="vdata.ifParams[item.name]"
              @uploadSuccess="uploadSuccess($event, item.name)"
            >
              <template #uploadSlot="{ loading }">
                <a-button style="margin-top: 5px">
                  <a-icon :type="vdata.loading ? 'loading' : 'upload'" />
                  {{ vdata.loading ? '正在上传' : '点击上传' }}
                </a-button>
              </template>
            </JeepayUpload>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div class="drawer-btn-center" v-if="$access('ENT_MCH_PAY_CONFIG_ADD')">
      <a-button :style="{ marginRight: '8px' }" @click="onClose">取消</a-button>
      <a-button type="primary" @click="onSubmit" :loading="vdata.btnLoading">保存</a-button>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { API_URL_MCH_PAYCONFIGS_LIST, req, getMchPayConfigUnique, upload } from '@/api/manage'

import { reactive, ref, watch, getCurrentInstance } from 'vue'

const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const props = defineProps({
  callbackFunc: { type: Function, default: () => ({}) },
})

const vdata: any = reactive({
  btnLoading: false,
  open: false, // 抽屉开关
  appId: null, // 商户号
  ifCode: null, // 接口代码
  mchType: null, // 商户类型：1-普通商户 2-特约商户
  action: upload.cert, // 上传文件地址
  mchParams: {}, // 支付接口定义描述
  saveObject: {}, // 保存的对象
  ifParams: {}, // 参数配置对象
  rules: {
    infoId: [{ required: true, trigger: 'blur' }],
    ifCode: [{ required: true, trigger: 'blur' }],
    // ifRate: [{ required: false, pattern: /^(([1-9]{1}\d{0,1})|(0{1}))(\.\d{1,4})?$/, message: '请输入0-100之间的数字，最多四位小数', trigger: 'blur' }]
  },
  ifParamsRules: {},
})

const mchParamFormModel = ref()
const infoFormModel = ref()

// 待测试，解决appSecret  双向绑定数据不显示的问题
watch(
  () => vdata.ifParams,
  () => {
    // this.$set(this.ifParams, "appSecret", this.ifParams.appSecret)
  }
)

// 弹层打开事件
function show(appId, record) {
  vdata.appId = appId
  vdata.ifCode = record.ifCode
  vdata.mchType = record.mchType
  vdata.saveObject = {} // 要保存的对象
  vdata.ifParams = {} // 参数配置对象
  vdata.mchParams = {} // 支付接口定义描述

  vdata.saveObject.infoId = appId
  vdata.saveObject.ifCode = record.ifCode
  vdata.saveObject.state = record.ifConfigState === 0 ? 0 : 1
  if (mchParamFormModel.value !== undefined) {
    mchParamFormModel.value.resetFields()
  }
  getMchPayConfig(record)
}
// 支付参数配置
function getMchPayConfig(record) {
  // 获取支付参数
  getMchPayConfigUnique(vdata.saveObject.infoId, vdata.saveObject.ifCode).then((res) => {
    if (res && res.ifParams) {
      vdata.saveObject = res
      vdata.ifParams = JSON.parse(res.ifParams)
    }

    const newItems: any = [] // 重新加载支付接口配置定义描述json
    let radioItems: any = [] // 存放单选框value title

    const mchParams = vdata.mchType == 1 ? record.normalMchParams : record.isvsubMchParams // 根据商户类型获取接口定义描述

    const mchParamsList = JSON.parse(mchParams)

    if (Array.isArray(mchParamsList)) {
      mchParamsList.forEach((item) => {
        radioItems = []
        if (item.type === 'radio') {
          const valueItems = item.values.split(',')
          const titleItems = item.titles.split(',')
          for (const i in valueItems) {
            // 检查参数是否为数字类型 然后赋值给radio值
            let radioVal = valueItems[i]
            if (!isNaN(radioVal)) {
              radioVal = Number(radioVal)
            }
            radioItems.push({
              value: radioVal,
              title: titleItems[i],
            })
          }
        }

        if (item.star === '1') {
          vdata.ifParams[item.name + '_ph'] = vdata.ifParams[item.name]
            ? vdata.ifParams[item.name]
            : '请输入'
          if (vdata.ifParams[item.name]) {
            vdata.ifParams[item.name] = ''
          }
        }

        newItems.push({
          name: item.name,
          desc: item.desc,
          type: item.type,
          verify: item.verify,
          values: radioItems,
          star: item.star, // 脱敏标识 1-是
        })
      })

      vdata.mchParams = newItems // 重新赋值接口定义描述
      vdata.open = true // 打开支付参数配置抽屉
      generoterRules()
    } else {
      $infoBox.message.error('该渠道无法进行商户参数配置')
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
        vdata.mchParams.forEach((item) => {
          if (item.star === '1' && vdata.ifParams[item.name] === '') {
            vdata.ifParams[item.name] = undefined
          }
          vdata.ifParams[item.name + '_ph'] = undefined
        })
        reqParams.ifParams = JSON.stringify(vdata.ifParams)
        // 请求接口
        if (Object.keys(reqParams).length === 0) {
          $infoBox.message.error('参数不能为空！')
          return
        }
        req.add(API_URL_MCH_PAYCONFIGS_LIST, reqParams).then((res) => {
          $infoBox.message.success('保存成功')
          vdata.open = false
          vdata.btnLoading = false
          props.callbackFunc()
        })
      }
    })
  })
}

// 上传文件成功回调方法，参数value为文件地址，name是自定义参数
function uploadSuccess(value, key) {
  vdata.ifParams[key] = value
  // this.$forceUpdate()
}
// 动态生成支付参数表单检验规则
function generoterRules() {
  const rules = {}
  let newItems: any = []
  vdata.mchParams.forEach((item) => {
    newItems = []
    if (item.verify === 'required' && item.star !== '1') {
      newItems.push({
        required: true,
        message: '请输入' + item.desc,
        trigger: 'blur',
      })
      rules[item.name] = newItems
    }
  })
  vdata.ifParamsRules = rules
}
function onClose() {
  vdata.open = false
}

defineExpose({ show })
</script>
<style lang="less" scoped>
.jeepay-card-content {
  width: 100%;
  position: relative;
  background-color: @jee-card-back;
  border-radius: 6px;
  overflow: hidden;
}
.jeepay-card-ops {
  width: 100%;
  height: 50px;
  background-color: @jee-card-back;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid @jee-back;
  position: absolute;
  bottom: 0;
}
.jeepay-card-content-header {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.jeepay-card-content-body {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
}
.title {
  font-size: 16px;
  font-family:
    PingFang SC,
    PingFang SC-Bold;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 1px;
}
</style>
