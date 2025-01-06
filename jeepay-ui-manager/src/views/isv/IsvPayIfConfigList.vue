<template>
  <a-drawer
    v-model:open="vdata.visible"
    title="支付参数列表"
    @close="onClose"
    :closable="true"
    :body-style="{ paddingBottom: '80px' }"
    :drawer-style="{ backgroundColor: '#f0f2f5' }"
    width="80%"
  >
    <JeepayCard
      ref="infoCard"
      :reqCardListFunc="reqCardListFunc"
      :span="vdata.jeepayCard.span"
      :height="vdata.jeepayCard.height"
    >
      <template #cardContentSlot="{ record }">
        <div :style="{ height: vdata.jeepayCard.height + 'px' }" class="jeepay-card-content">
          <!-- 卡片自定义样式 -->
          <div
            class="jeepay-card-content-header"
            :style="{ backgroundColor: record.bgColor, height: vdata.jeepayCard.height / 2 + 'px' }"
          >
            <img
              v-if="record.icon"
              :src="record.icon"
              :style="{ height: vdata.jeepayCard.height / 5 + 'px' }"
            />
          </div>
          <div
            class="jeepay-card-content-body"
            :style="{ height: vdata.jeepayCard.height / 2 - 50 + 'px' }"
          >
            <div class="title">
              {{ record.ifName }}
            </div>
            <a-badge
              :status="record.ifConfigState === 1 ? 'processing' : 'error'"
              :text="record.ifConfigState === 1 ? '启用' : '未开通'"
            ></a-badge>
          </div>
          <!-- 卡片底部操作栏 -->
          <div class="jeepay-card-ops">
            <a v-if="$access('ENT_ISV_PAY_CONFIG_ADD')" @click="editPayIfConfigFunc(record)">
              填写参数
              <a-icon key="right" type="right" style="font-size: 13px"></a-icon>
            </a>
            <a v-else>暂无操作</a>
          </div>
        </div>
      </template>
    </JeepayCard>
    <a-drawer
      title="支付参数配置"
      width="40%"
      :closable="true"
      v-model:open="vdata.childrenVisible"
      :body-style="{ paddingBottom: '80px' }"
      @close="onChildrenDrawerClose"
      :maskClosable="false"
    >
      <a-form ref="infoFormModel" :model="vdata.saveObject" layout="vertical" :rules="vdata.rules">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="支付接口费率" name="ifRate">
              <a-input v-model:value="vdata.saveObject.ifRate" placeholder="请输入" suffix="%" />
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
          <a-col :span="24">
            <a-form-item label="备注" name="remark">
              <a-input
                v-model:value="vdata.saveObject.remark"
                placeholder="请输入"
                type="textarea"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-divider orientation="left">
        <a-tag color="#FF4B33">{{ vdata.saveObject.ifCode }} 服务商参数配置</a-tag>
      </a-divider>
      <a-form
        ref="isvParamFormModel"
        :model="vdata.ifParams"
        layout="vertical"
        :rules="vdata.ifParamsRules"
      >
        <a-row :gutter="16">
          <a-col
            v-for="(item, key) in vdata.isvParams"
            :key="key"
            :span="item.type === 'text' ? 12 : 24"
          >
            <a-form-item
              :label="item.desc"
              :name="item.name"
              v-if="item.type === 'text' || item.type === 'textarea'"
            >
              <a-input
                v-if="item.star === '1'"
                v-model:value="vdata.ifParams[item.name]"
                :placeholder="vdata.ifParams[item.name + '_ph']"
                :type="item.type"
              />
              <a-input
                v-else
                v-model:value="vdata.ifParams[item.name]"
                placeholder="请输入"
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
      <div class="drawer-btn-center">
        <a-button @click="onChildrenDrawerClose" :style="{ marginRight: '8px' }">取消</a-button>
        <a-button type="primary" @click="onSubmit" :loading="vdata.btnLoading">保存</a-button>
      </div>
    </a-drawer>
    <!-- 支付参数配置页面组件  -->
    <WxpayPayConfig ref="wxpayPayConfig" :callbackFunc="refCardList" />
    <!-- 支付参数配置页面组件  -->
    <AlipayPayConfig ref="alipayPayConfig" :callbackFunc="refCardList" />
  </a-drawer>
</template>

<script setup lang="ts">
import WxpayPayConfig from './custom/WxpayPayConfig.vue'
import AlipayPayConfig from './custom/AlipayPayConfig.vue'
import { API_URL_ISV_PAYCONFIGS_LIST, getIsvPayConfigUnique, req, upload } from '@/api/manage'
import { reactive, ref, getCurrentInstance, nextTick } from 'vue'
const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const infoCard = ref()
const infoFormModel = ref()
const isvParamFormModel = ref()
const wxpayPayConfig = ref()
const alipayPayConfig = ref()

const vdata: any = reactive({
  btnLoading: false,
  isvNo: null, // 服务商号
  action: upload.cert, // 上传文件地址
  visible: false, // 一级抽屉开关
  childrenVisible: false, // 二级抽屉开关
  isvParams: {}, // 支付接口定义描述
  saveObject: {}, // 保存的对象
  ifParams: {}, // 参数配置对象
  jeepayCard: {
    // 卡片配置
    height: 300,
    span: { xxl: 6, xl: 4, lg: 4, md: 3, sm: 2, xs: 1 },
  },
  rules: {
    infoId: [{ required: true, trigger: 'blur' }],
    ifCode: [{ required: true, trigger: 'blur' }],
    ifRate: [
      {
        required: false,
        pattern: /^(([1-9]{1}\d{0,1})|(0{1}))(\.\d{1,4})?$/,
        message: '请输入0-100之间的数字，最多四位小数',
        trigger: 'blur',
      },
    ],
  },
  ifParamsRules: {},
})
// watch: {
//   ifParams: function (o, n) {
//     this.$set(this.ifParams, 'appSecret', this.ifParams.appSecret) // 解决appSecret  双向绑定数据不显示的问题
//   },
// },

// 刷新card列表
function refCardList() {
  nextTick(() => {
    infoCard.value.refCardList()
  })
}

function generoterRules() {
  const rules = {}
  let newItems: any = []
  vdata.isvParams.forEach((item) => {
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
// 弹层打开事件
function show(isvNo) {
  vdata.isvNo = isvNo
  vdata.ifCode = null
  vdata.visible = true
  refCardList()
}
// 请求支付接口定义数据
function reqCardListFunc() {
  return req.list(API_URL_ISV_PAYCONFIGS_LIST, { isvNo: vdata.isvNo })
}

// 支付参数配置
function editPayIfConfigFunc(record) {
  console.log(record)

  if (record.configPageType === 1) {
    // JSON渲染页面
    if (infoFormModel.value) {
      infoFormModel.value.resetFields()
    }
    if (isvParamFormModel.value) {
      isvParamFormModel.value.resetFields()
    }
    vdata.childrenVisible = true // 打开支付参数配置抽屉
    vdata.saveObject = {} // 要保存的对象
    vdata.ifParams = {} // 参数配置对象
    vdata.isvParams = {} // 支付接口定义描述
    vdata.saveObject.infoId = vdata.isvNo
    vdata.saveObject.ifCode = record.ifCode
    vdata.saveObject.state = record.ifConfigState === 0 ? 0 : 1

    if (!record) {
      return
    }

    // 获取支付参数
    getIsvPayConfigUnique(vdata.saveObject.infoId, vdata.saveObject.ifCode).then((res) => {
      if (res && res.ifParams) {
        vdata.saveObject = res
        vdata.ifParams = JSON.parse(res.ifParams)
      }

      const newItems: any = [] // 重新加载支付接口配置定义描述json

      const isvParamsList = JSON.parse(record.isvParams)

      if (Array.isArray(isvParamsList)) {
        isvParamsList.forEach((item) => {
          const radioItems: any = [] // 存放单选框value title
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

        vdata.isvParams = newItems // 重新赋值接口定义描述
        generoterRules()
      }

      // that.$forceUpdate()
    })
  } else if (record.configPageType === 2) {
    // 自定义配置页面，页面放在custom目录下，配置模块命名规则：if_code + PayConfig
    if (record.ifCode == 'wxpay') {
      wxpayPayConfig.value.show(vdata.isvNo, record)
    } else if (record.ifCode == 'alipay') {
      alipayPayConfig.value.show(vdata.isvNo, record)
    }
  }
}
// 表单提交
function onSubmit() {
  infoFormModel.value.validate().then((valid) => {
    isvParamFormModel.value.validate().then((valid2) => {
      if (valid && valid2) {
        // 验证通过

        const { infoId, ifCode, ifRate, state, remark } = vdata.saveObject
        const reqParams: any = { infoId, ifCode, ifRate, state, remark }

        // 支付参数配置不能为空
        if (Object.keys(vdata.ifParams).length === 0) {
          $infoBox.message.error('参数不能为空！')
          return
        }
        // 脱敏数据为空时，删除该key
        vdata.isvParams.forEach((item) => {
          if (item.star === '1' && vdata.ifParams[item.name] === '') {
            vdata.ifParams[item.name] = undefined
          }
          vdata.ifParams[item.name + '_ph'] = undefined
        })
        reqParams.ifParams = JSON.stringify(vdata.ifParams)

        vdata.btnLoading = true

        // 请求接口
        req
          .add(API_URL_ISV_PAYCONFIGS_LIST, reqParams)
          .then((res) => {
            $infoBox.message.success('保存成功')
            vdata.childrenVisible = false
            refCardList()
          })
          .finally(() => {
            vdata.btnLoading = false
          })
      }
    })
  })
}
// 上传文件成功回调方法，参数value为文件地址，name是自定义参数
function uploadSuccess(value, name) {
  vdata.ifParams[name] = value
  // this.$forceUpdate()
}
// 抽屉关闭
function onClose() {
  vdata.visible = false
}
function onChildrenDrawerClose() {
  vdata.childrenVisible = false
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
  justify-content: space-around;
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
