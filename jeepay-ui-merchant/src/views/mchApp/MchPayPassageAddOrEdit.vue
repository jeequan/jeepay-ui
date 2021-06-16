<template>
  <a-drawer
    :visible="visible"
    title="配置支付通道"
    @close="onClose"
    :closable="true"
    :maskClosable="false"
    :body-style="{ paddingBottom: '80px' }"
    :drawer-style="{ backgroundColor: '#f0f2f5' }"
    width="40%"
  >
    <a-list :data-source="[]" v-if="cardList.length === 0" />
    <div v-else>
      <a-row :gutter="[24,24]" style="width:100%">
        <a-col
          v-for="(record, key) in cardList"
          :key="key"
          :xxl="24/jeepayCard.span.xxl"
          :xl="24/jeepayCard.span.xl"
          :lg="24/jeepayCard.span.lg"
          :md="24/jeepayCard.span.md"
          :sm="24/jeepayCard.span.sm"
          :xs="24/jeepayCard.span.xs"
        >
          <div :style="{'height': jeepayCard.height + 'px'}" class="jeepay-card-content">
            <!-- 卡片自定义样式 -->
            <div class="jeepay-card-content-header" :style="{backgroundColor: record.bgColor, height: (jeepayCard.height-50)/2 + 'px'}">
              <img v-if="record.icon" :src="record.icon" :style="{height: (jeepayCard.height-50)/5 + 'px'}">
            </div>
            <div class="jeepay-card-content-body" :style="{height: ((jeepayCard.height-50)/2) + 'px'}">
              <div class="title" :style="{height: ((jeepayCard.height-50)/4) + 'px', lineHeight: ((jeepayCard.height-50)/4) + 'px'}">
                {{ record.ifName }}
              </div>
              <a-form layout="inline" :labelCol="{span:8}" :wrapperCol="{span:14}">
                <a-form-item label="费率：" :validate-status="record.error" :help="record.help">
                  <a-input v-model="record.rate" :disabled="!record.state && record.passageId != ''" suffix="%" />
                </a-form-item>
              </a-form>
            </div>
            <!-- 卡片底部操作栏 -->
            <div class="jeepay-card-ops">
              <a-switch checked-children="启用" un-checked-children="停用" v-model="record.state"></a-switch>
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
          zIndex: 1
        }"
      >
        <a-button icon="close" :style="{ marginRight: '8px' }" @click="onClose">
          取消
        </a-button>
        <a-button type="primary" icon="check" v-if="$access('ENT_MCH_PAY_PASSAGE_ADD')" @click="handleOkFunc">
          保存
        </a-button>
      </div>
    </div>
  </a-drawer>

</template>

<script>
import JeepayCard from '@/components/JeepayCard/JeepayCard'
import { API_URL_MCH_PAYPASSAGE_LIST, req, getAvailablePayInterfaceList } from '@/api/manage'
export default {
  components: {
      JeepayCard
  },
  props: {
    callbackFunc: { type: Function, default: () => ({}) }
  },

  data () {
    return {
      cardList: [],
      appId: null, // 应用appId
      wayCode: null, // 支付方式代码
      visible: false, // 是否显示弹层/抽屉
      jeepayCard: {
        height: 300,
        span: { xxl: 3, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }
      }
    }
  },
  methods: {
    // 弹层打开事件
    show: function (appId, wayCode) {
      this.appId = appId
      this.wayCode = wayCode
      this.visible = true
      this.cardList = []
      this.refCardList()
    },
    // 请求支付接口定义数据
    refCardList () {
      const that = this
      getAvailablePayInterfaceList(this.appId, this.wayCode).then(resData => {
        if (resData === undefined || resData.length === 0) {
          that.cardList = []
          return
        }
        const newItems = []
        resData.forEach(item => {
          newItems.push({
            passageId: item.passageId ? item.passageId : '',
            ifCode: item.ifCode,
            ifName: item.ifName,
            icon: item.icon,
            bgColor: item.bgColor,
            rate: item.rate,
            state: item.state === 1
          })
        })
        that.cardList = newItems
        that.$forceUpdate()
      })
    },
    handleOkFunc: function () { // 点击【确认】按钮事件
        const that = this
        const reqParams = []

        try {
          that.cardList.forEach(item => {
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
              appId: that.appId,
              wayCode: that.wayCode,
              ifCode: item.ifCode,
              rate: item.rate,
              state: item.state ? 1 : 0
            })
          })
        } catch (e) {
          if (e.message === 'error') {
            this.$forceUpdate()
            return
          }
        }
        // 请求接口
        req.add(API_URL_MCH_PAYPASSAGE_LIST, { 'reqParams': JSON.stringify(reqParams) }).then(res => {
          that.$message.success('保存成功')
          that.visible = false
          that.callbackFunc()
        })
    },
    onClose () {
      this.visible = false
    }
  }
}
</script>
<style lang="less" scoped>
  .jeepay-card-content {
    width: 100%;
    position: relative;
    background-color: @jee-card-back;
    border-radius: 6px;
    overflow:hidden;
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
    font-family: PingFang SC, PingFang SC-Bold;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 1px;
  }
</style>
