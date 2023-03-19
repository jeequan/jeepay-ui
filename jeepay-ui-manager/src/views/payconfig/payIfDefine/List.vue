<template>
  <page-header-wrapper>
    <template>
      <a-card style="width: calc(100% - 24px);margin-bottom: 20px;">
        <a-alert message="" type="info">
          <template #description>
            <p style="display: flex; justify-content: space-between; margin: 0 0 4px;">
              计全科技已开放支付接口购买渠道，官方团队开发、源码提供、下载后直接使用。<a href="https://docs.jeequan.com/docs/jeepay/jeepay-1ejdnsuhveb16" target="_blank">接口下载、安装说明。</a>
              <a href="https://www.jeequan.com/ifstore/list.html" target="_blank">前往接口市场 ></a>
            </p>
          </template>
        </a-alert>
      </a-card>
    </template>
    <JeepayCard
      ref="infoCard"
      :reqCardListFunc="reqCardListFunc"
      :span="jeepayCard.span"
      :height="jeepayCard.height"
      :name="jeepayCard.name"
      :addAuthority="jeepayCard.addAuthority"
      @addJeepayCard="addOrEdit"
    >
      <div slot="cardContentSlot" slot-scope="{record}">
        <div :style="{'height': jeepayCard.height + 'px'}" class="jeepay-card-content">
          <!-- 卡片自定义样式 -->
          <div class="jeepay-card-content-header" :style="{backgroundColor: record.bgColor, height: jeepayCard.height/2 + 'px'}">
            <img v-if="record.icon" :src="record.icon" :style="{height: jeepayCard.height/5 + 'px'}">
          </div>
          <div class="jeepay-card-content-body" :style="{height: (jeepayCard.height/2 - 50) + 'px'}">
            <div class="title">
              {{ record.ifName }}
            </div>
          </div>
          <!-- 卡片底部操作栏 -->
          <div class="jeepay-card-ops">
            <a-tooltip placement="top" title="编辑">
              <a-icon key="edit" type="edit" @click="addOrEdit(record.ifCode)" />
            </a-tooltip>
            <a-tooltip placement="top" title="删除">
              <a-icon key="delete" type="delete" @click="del(record.ifCode)" />
            </a-tooltip>
          </div>
        </div>
      </div>
    </JeepayCard>

    <!-- 新增页面组件  -->
    <PayIfDefineAddOrEdit ref="payIfDefineAddOrEdit" :callbackFunc="refCardList"/>
  </page-header-wrapper>
</template>

<script>
import JeepayCard from '@/components/JeepayCard/JeepayCard'
import { API_URL_IFDEFINES_LIST, req } from '@/api/manage'
import PayIfDefineAddOrEdit from './AddOrEdit'

export default {
  name: 'IfDefinePage',
  components: {
    JeepayCard,
    PayIfDefineAddOrEdit
  },
  data () {
    return {
      jeepayCard: {
        name: '支付接口',
        height: 200,
        span: { xxl: 8, xl: 4, lg: 4, md: 3, sm: 2, xs: 1 },
        addAuthority: this.$access('ENT_PC_IF_DEFINE_ADD')
      }
    }
  },
  methods: {
    // 请求支付接口定义数据
    reqCardListFunc () {
      return req.list(API_URL_IFDEFINES_LIST)
    },
    // 刷新card列表
    refCardList () {
      this.$refs.infoCard.refCardList()
    },
    addOrEdit (ifCode) {
      this.$refs.payIfDefineAddOrEdit.show(ifCode)
    },
    del (ifCode) {
      const that = this
      this.$infoBox.confirmDanger('确认删除？', '', () => {
        req.delById(API_URL_IFDEFINES_LIST, ifCode).then(res => {
          that.$message.success('删除成功！')
          that.refCardList()
        })
      })
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
    justify-content: space-around;
    align-items: center;
  }
  .title {
    font-size: 13px;
    font-family: PingFang SC, PingFang SC-Bold;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 1px;
  }
</style>
