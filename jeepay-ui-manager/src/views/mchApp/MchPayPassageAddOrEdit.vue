<template>
  <a-drawer
    v-model:open="vdata.open"
    title="配置支付通道"
    :closable="true"
    :maskClosable="false"
    :body-style="{ paddingBottom: '80px' }"
    :drawer-style="{ backgroundColor: '#f0f2f5' }"
    width="40%"
    @close="onClose"
  >
    <a-list v-if="vdata.cardList.length === 0" :data-source="[]" />
    <div v-else>
      <a-row :gutter="[24, 24]" style="width: 100%">
        <a-col
          v-for="(record, key) in vdata.cardList"
          :key="key"
          :xxl="24 / vdata.jeepayCard.span.xxl"
          :xl="24 / vdata.jeepayCard.span.xl"
          :lg="24 / vdata.jeepayCard.span.lg"
          :md="24 / vdata.jeepayCard.span.md"
          :sm="24 / vdata.jeepayCard.span.sm"
          :xs="24 / vdata.jeepayCard.span.xs"
        >
          <div :style="{ height: vdata.jeepayCard.height + 'px' }" class="jeepay-card-content">
            <!-- 卡片自定义样式 -->
            <div
              class="jeepay-card-content-header"
              :style="{
                backgroundColor: record.bgColor,
                height: (vdata.jeepayCard.height - 50) / 2 + 'px',
              }"
            >
              <img
                v-if="record.icon"
                :src="record.icon"
                :style="{ height: (vdata.jeepayCard.height - 50) / 5 + 'px' }"
              />
            </div>
            <div
              class="jeepay-card-content-body"
              :style="{ height: (vdata.jeepayCard.height - 50) / 2 + 'px' }"
            >
              <div
                class="title"
                :style="{
                  height: (vdata.jeepayCard.height - 50) / 4 + 'px',
                  lineHeight: (vdata.jeepayCard.height - 50) / 4 + 'px',
                }"
              >
                {{ record.ifName }}
              </div>
              <a-form :labelCol="{ span: 8 }" :wrapperCol="{ span: 14 }">
                <a-form-item label="费率：" :validate-status="record.error" :help="record.help">
                  <a-input
                    v-model:value="record.rate"
                    :disabled="!record.state && record.passageId != ''"
                    suffix="%"
                  />
                </a-form-item>
              </a-form>
            </div>
            <!-- 卡片底部操作栏 -->
            <div class="jeepay-card-ops">
              <a-switch
                v-model:checked="record.state"
                checked-children="启用"
                un-checked-children="停用"
              />
            </div>
          </div>
        </a-col>
      </a-row>
      <div
        :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'center',
          boxSizing: 'border-box',
          zIndex: 1,
        }"
      >
        <a-button :style="{ marginRight: '8px' }" @click="onClose">取消</a-button>
        <a-button v-if="$access('ENT_MCH_PAY_PASSAGE_ADD')" type="primary" @click="handleOkFunc">
          保存
        </a-button>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { API_URL_MCH_PAYPASSAGE_LIST, req, getAvailablePayInterfaceList } from '@/api/manage'
import { reactive, ref, getCurrentInstance } from 'vue'
const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const props = defineProps({
  callbackFunc: { type: Function, default: () => ({}) },
})

const vdata: any = reactive({
  cardList: [],
  appId: null, // 应用appId
  wayCode: null, // 支付方式代码
  open: false, // 是否显示弹层/抽屉
  jeepayCard: {
    height: 300,
    span: { xxl: 3, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 },
  },
})

// 弹层打开事件
function show(appId, wayCode) {
  vdata.appId = appId
  vdata.wayCode = wayCode
  vdata.open = true
  vdata.cardList = []
  refCardList()
}
// 请求支付接口定义数据
function refCardList() {
  getAvailablePayInterfaceList(vdata.appId, vdata.wayCode).then((resData) => {
    if (resData === undefined || resData.length === 0) {
      vdata.cardList = []
      return
    }
    const newItems: any = []
    resData.forEach((item) => {
      newItems.push({
        passageId: item.passageId ? item.passageId : '',
        ifCode: item.ifCode,
        ifName: item.ifName,
        icon: item.icon,
        bgColor: item.bgColor,
        rate: item.rate,
        state: item.state === 1,
      })
    })
    vdata.cardList = newItems
    // this.$forceUpdate()
  })
}
function handleOkFunc() {
  // 点击【确认】按钮事件
  const reqParams: any = []

  try {
    vdata.cardList.forEach((item) => {
      item.error = ''
      item.help = ''
      const reg = /^(([1-9]{1}\d{0,1})|(0{1}))(\.\d{1,4})?$/
      // 状态开启则费率必填
      if (item.state) {
        if (!item.rate) {
          item.error = 'error'
          item.help = '请输入费率'
          throw new Error('error')
        }
        if (!reg.test(item.rate) || item.rate > 100) {
          item.error = 'error'
          item.help = '最多四位小数'
          throw new Error('error')
        }
      }

      reqParams.push({
        id: item.passageId,
        appId: vdata.appId,
        wayCode: vdata.wayCode,
        ifCode: item.ifCode,
        rate: item.rate,
        state: item.state ? 1 : 0,
      })
    })
  } catch (e: any) {
    if (e.message === 'error') {
      // this.$forceUpdate()
      return
    }
  }
  // 请求接口
  req.add(API_URL_MCH_PAYPASSAGE_LIST, { reqParams: JSON.stringify(reqParams) }).then((res) => {
    $infoBox.message.success('保存成功')
    vdata.open = false
    props.callbackFunc()
  })
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
