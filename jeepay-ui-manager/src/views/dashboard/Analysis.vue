<template>
  <div id="chart-card">
    <div class="chart-top">
      <div class="chart-item top-left">
        <div class="chart-data" style="position: relative">
          <!-- 骨架屏与图表有冲突，故不使用内嵌方式。 因为内边距的原因，采取v-if的方式 -->
          <a-skeleton
            active
            :loading="true"
            v-if="vdata.skeletonIsShow"
            style="padding: 20px"
            :paragraph="{ rows: 6 }"
          />
          <div v-show="!vdata.skeletonIsShow">
            <div
              class="analy-title"
              style="padding: 20px; box-sizing: border-box; padding-bottom: 10px"
            >
              <span>今日交易金额</span>
              <a-tooltip>
                <template slot="title">
                  {{ vdata.mainTips.todayAmountTip }}
                </template>
                <a-icon type="question-circle" />
              </a-tooltip>
            </div>
            <div v-show="vdata.ispayAmount">
              <div class="pay-amount-text">
                <span class="pay-amount">￥{{ vdata.mainChart.todayAmount }}</span>
                <span>共{{ vdata.mainChart.todayPayCount }}笔</span>
              </div>
              <div id="payAmount" style="height: 60px"></div>
            </div>
            <div class="payAmountSpan" v-show="vdata.ispayAmount">
              <span>昨日交易金额：￥{{ vdata.mainChart.yesterdayAmount }}</span>
              <span>近七天交易金额：￥{{ vdata.mainChart.payWeek }}</span>
            </div>
            <empty v-show="!vdata.ispayAmount" />
          </div>
        </div>
      </div>

      <div class="top-middle">
        <div class="middle-top">
          <div class="chart-item middle-larger">
            <div class="chart-data">
              <a-skeleton active :loading="vdata.skeletonIsShow" :paragraph="{ rows: 1 }">
                <div class="analy-title">
                  <span>交易总金额</span>
                  <a-tooltip>
                    <template #title>
                      {{ vdata.mainTips.totalAmountTip }}
                    </template>
                    <QuestionCircleOutlined />
                  </a-tooltip>
                </div>

                <a-statistic
                  style="margin-top: 10px"
                  :precision="2"
                  :value="'￥' + vdata.mainChart.totalAmount"
                />
              </a-skeleton>
            </div>
          </div>
          <div class="chart-item middle-smaller">
            <div class="chart-data">
              <a-skeleton active :loading="vdata.skeletonIsShow" :paragraph="{ rows: 1 }">
                <div class="analy-title">
                  <span>服务商数量</span>
                  <a-tooltip>
                    <template #title>
                      {{ vdata.mainTips.totalIsvTip }}
                    </template>
                    <QuestionCircleOutlined />
                  </a-tooltip>
                </div>
                <a-statistic style="margin-top: 10px" :value="vdata.mainChart.totalIsv" />
              </a-skeleton>
            </div>
          </div>
        </div>

        <div class="middle-bottom">
          <div class="chart-item middle-larger">
            <div class="chart-data">
              <a-skeleton active :loading="vdata.skeletonIsShow" :paragraph="{ rows: 1 }">
                <div class="analy-title">
                  <span>交易总笔数</span>
                  <a-tooltip>
                    <template #title>
                      {{ vdata.mainTips.totalPayCountTip }}
                    </template>
                    <QuestionCircleOutlined />
                  </a-tooltip>
                </div>
                <a-statistic
                  style="margin-top: 10px"
                  :value="vdata.mainChart.totalPayCount + ' 笔'"
                />
              </a-skeleton>
            </div>
          </div>
          <div class="chart-item middle-smaller">
            <div class="chart-data">
              <a-skeleton active :loading="vdata.skeletonIsShow" :paragraph="{ rows: 1 }">
                <div class="analy-title">
                  <span>商户数量</span>
                  <a-tooltip>
                    <template #title>
                      {{ vdata.mainTips.totalMchTip }}
                    </template>
                    <QuestionCircleOutlined />
                  </a-tooltip>
                </div>
                <a-statistic style="margin-top: 10px" :value="vdata.mainChart.totalMch" />
              </a-skeleton>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-item top-right">
        <div class="chart-data user-greet">
          <a-skeleton active avatar :loading="vdata.skeletonIsShow" :paragraph="{ rows: 6 }">
            <div class="user-greet-title">
              <div class="user-greet-all">
                <div class="user-greet-img">
                  <img :src="vdata.greetImg" alt="" />
                </div>
                <div class="user-greet-all">
                  <span style="">{{ vdata.mainTips.helloTitle }}</span>
                  <div>
                    <span style="font-size: 12px" v-if="vdata.isAdmin === 1">超级管理员</span>
                    <span style="font-size: 12px" v-else>操作员</span>
                  </div>
                </div>
              </div>
              <!-- <span  class="there-spot"></span> -->
              <img
                src="@/assets/svg/more.svg"
                class="there-spot"
                alt="更多"
                slot="extra"
                @click="showDrawer"
              />
            </div>
            <div class="quick-start">
              <p class="quick-start-title">快速开始</p>
              <ul class="quick-start-ul">
                <template v-for="menu in quickMenuList">
                  <template>
                    <li :key="menu.entId">
                      <router-link :to="menu.menuUri" tag="span">{{ menu.entName }}</router-link>
                    </li>
                  </template>
                </template>
              </ul>
            </div>
          </a-skeleton>
        </div>
      </div>
    </div>

    <div class="chart-bottom">
      <div class="chart-item bottom-left">
        <div class="chart-data">
          <a-skeleton active :loading="vdata.skeletonIsShow" :paragraph="{ rows: 6 }" />
          <div v-show="!vdata.skeletonIsShow">
            <div>
              <div class="pay-count-title">
                <span class="chart-title">交易统计</span>
                <div class="chart-padding">
                  <a-range-picker
                    ref="jeeRange"
                    style="width: 100%"
                    :presets="{ 最近一个月: [vdata.dayjs().subtract(1, 'months'), vdata.dayjs()] }"
                    :default-value="[vdata.dayjs().subtract(7, 'days'), vdata.dayjs()]"
                    show-time
                    format="YYYY-MM-DD"
                    @change="transactionChange"
                    :disabled-date="disabledDate"
                    @ok="payCountOk"
                    :allowClear="false"
                  >
                    <div class="change-date-layout">
                      {{ vdata.jeeDate ? vdata.jeeDate : '最近七天' }}
                      <div class="pay-icon">
                        <div v-if="vdata.lastSevenDays" class="change-date-icon">
                          <a-icon type="down" />
                        </div>
                        <div v-else @click.stop="iconClick" class="change-date-icon">
                          <a-icon type="close-circle" />
                        </div>
                      </div>
                    </div>
                  </a-range-picker>
                </div>
              </div>
              <div style="position: relative">
                <div v-show="vdata.isPayCount">
                  <div id="payCount"></div>
                  <span style="right: 30px; position: absolute; top: 0">单位（元）</span>
                </div>
                <empty v-show="!vdata.isPayCount" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-item bottom-right">
        <div class="chart-data">
          <a-skeleton active :loading="vdata.skeletonIsShow" :paragraph="{ rows: 6 }" />
          <div v-show="!vdata.skeletonIsShow">
            <div class="pay-count-title">
              <span class="chart-title">支付方式</span>
              <div class="chart-padding">
                <a-range-picker
                  style="width: 100%"
                  ref="jeeRangePie"
                  :presets="{ 最近一个月: [dayjs().subtract(1, 'months'), dayjs()] }"
                  :default-value="[dayjs().subtract(7, 'days'), dayjs()]"
                  @change="payOnChange"
                  show-time
                  format="YYYY-MM-DD"
                  :disabled-date="disabledDate"
                  @ok="payTypeOk"
                  :allowClear="false"
                >
                  <div class="change-date-layout">
                    {{ vdata.jeeDatePie ? vdata.jeeDatePie : '最近七天' }}
                    <div class="pay-icon">
                      <div v-if="!vdata.pieDays" class="change-date-icon">
                        <a-icon type="down" />
                      </div>
                      <div v-else @click.stop="iconPieClick" class="change-date-icon">
                        <a-icon type="close-circle" />
                      </div>
                    </div>
                  </div>
                </a-range-picker>
              </div>
            </div>
            <div>
              <!-- 如果没数据就展示一个图标 -->
              <div v-show="vdata.isPayType" id="payType" style="height: 300px"></div>
              <empty v-show="!vdata.isPayType" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 抽屉 -->
    <template>
      <div>
        <a-drawer
          title="用户信息"
          placement="right"
          :closable="true"
          v-model:open="vdata.visible"
          @close="onClose"
        >
          <a-row>
            <a-col :span="24">
              <a-descriptions>
                <a-descriptions-item label="所属系统">
                  {{
                    userStore.userInfo.sysType === 'MGR'
                      ? '运营平台'
                      : userStore.userInfo.sysType === 'MCH'
                        ? '商户系统'
                        : '未知'
                  }}
                </a-descriptions-item>
              </a-descriptions>
            </a-col>
            <a-col :span="24">
              <a-descriptions>
                <a-descriptions-item label="登录用户名">
                  {{ userStore.userInfo.loginUsername }}
                </a-descriptions-item>
              </a-descriptions>
            </a-col>
            <a-col :span="24">
              <a-descriptions>
                <a-descriptions-item label="真实姓名">
                  {{ userStore.userInfo.userName }}
                </a-descriptions-item>
              </a-descriptions>
            </a-col>
            <a-col :span="24">
              <a-descriptions>
                <a-descriptions-item label="手机号">
                  {{ userStore.userInfo.telphone }}
                </a-descriptions-item>
              </a-descriptions>
            </a-col>
            <a-col :span="24">
              <a-descriptions>
                <a-descriptions-item label="性别">
                  {{
                    userStore.userInfo.sex == '1'
                      ? '男'
                      : userStore.userInfo.sex == '2'
                        ? '女'
                        : '未知'
                  }}
                </a-descriptions-item>
              </a-descriptions>
            </a-col>
            <a-col :span="24">
              <a-descriptions>
                <a-descriptions-item label="权限">
                  <a-tag color="#2db7f5" v-if="userStore.userInfo.isAdmin == '1'">超管</a-tag>
                  <a-tag color="#87d068" v-if="userStore.userInfo.isAdmin == '0'">操作员</a-tag>
                </a-descriptions-item>
              </a-descriptions>
            </a-col>
            <a-col :span="24">
              <a-descriptions>
                <a-descriptions-item label="用户状态">
                  <a-tag color="green" v-if="userStore.userInfo.state == '1'">启用</a-tag>
                  <a-tag color="red" v-if="userStore.userInfo.state == '0'">停用</a-tag>
                </a-descriptions-item>
              </a-descriptions>
            </a-col>
          </a-row>
        </a-drawer>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { TinyArea, Column, Pie, measureTextWidth } from '@antv/g2plot'
import { getPayAmountWeek, getNumCount, getPayCount, getPayType } from '@/api/manage'
import dayjs from 'dayjs'

import { useUserStore } from '@/store/modules/user'

import { timeFix } from '@/utils/util'
import empty from './empty.vue' // 空数据展示的组件，首页自用
import { reactive, getCurrentInstance, ref, onMounted, computed } from 'vue'

const { $infoBox, $access, $hasAgentEnt } = getCurrentInstance()!.appContext.config.globalProperties

const userStore = useUserStore()

const jeeRange = ref()
const jeeRangePie = ref()

const vdata: any = reactive({
  dayjs,

  skeletonIsShow: true, // 骨架屏是否显示
  skeletonReqNum: 0, // 当所有数据请求完毕后关闭骨架屏（共四个请求）
  lastSevenDays: true, // 最近七天是否显示
  pieDays: false, // 饼状图的关闭按钮是否展示
  visible: false,
  // recordId: userStore.userInfo.userId,
  searchData: {}, // 时间选择条件

  greetImg: userStore.userInfo.avatarImgPath, // 头像图片地址
  isPayType: true, // 支付方式是否存在数据
  isPayCount: true, // 交易统计是否存在数据
  ispayAmount: true, // 今日交易金额是否存在数据
  jeeDate: undefined, // 自定义日期选择框所用状态
  jeeDatePie: undefined, // 自定义日期选择框所用状态-支付方式
  isAdmin: userStore.userInfo.isAdmin, // 是否为超级管理员
  mainTips: {
    // 主页提示
    todayAmountTip: '今日成功交易金额及笔数', // 今日交易提示文字
    totalAmountTip: '成功交易总金额', // 交易总金额提示文字
    totalPayCountTip: '成功交易总笔数', // 交易总笔数提示文字
    totalIsvTip: '服务商数量', // 服务商数量提示文字
    totalMchTip: '商户数量', // 商户数量提示文字
    helloTitle: '',
  },
  mainChart: {
    // 主页统计数据
    payAmountData: [], // 近七天交易图表
    payCount: [], // 交易统计图表
    payType: [], // 支付方式统计图表
    todayAmount: 0.0, // 今日交易金额
    todayPayCount: 0, // 今日交易笔数
    yesterdayAmount: 0.0, // 昨日交易金额
    payWeek: 0.0, // 近7天总交易金额
    totalPayCount: 0, // 交易总笔数
    totalAmount: 0.0, // 交易总金额
    totalIsv: 0, // 当前服务商总数
    totalMch: 0, // 当前商户总数
  },
  tinyArea: {},
  columnPlot: null, // 柱状图数据
  piePlot: null, // 环图数据
})

function init() {
  console.log(
    $access('ENT_C_MAIN_PAY_AMOUNT_WEEK'),
    $access('ENT_C_MAIN_NUMBER_COUNT'),
    $access('ENT_C_MAIN_PAY_COUNT')
  )

  if ($access('ENT_C_MAIN_PAY_AMOUNT_WEEK')) {
    // 周总交易金额
    getPayAmountWeek()
      .then((res) => {
        vdata.mainChart.payAmountData = res.dataArray
        res.dataArray.length === 0 ? (vdata.ispayAmount = false) : (vdata.ispayAmount = true)
        vdata.mainChart.todayPayCount = res.todayPayCount
        vdata.mainChart.todayAmount = res.todayAmount
        vdata.mainChart.payWeek = res.payWeek
        vdata.mainChart.yesterdayAmount = res.yesterdayAmount
        initPayAmount()
        skeletonClose()
      })
      .catch((err) => {
        skeletonClose()
        vdata.ispayAmount = false
      })
  } else {
    vdata.ispayAmount = false
    skeletonClose()
  }
  if ($access('ENT_C_MAIN_NUMBER_COUNT')) {
    // 数据统计
    getNumCount()
      .then((res) => {
        vdata.mainChart.totalMch = res.totalMch
        vdata.mainChart.totalIsv = res.totalIsv
        vdata.mainChart.totalAmount = res.totalAmount
        vdata.mainChart.totalPayCount = res.totalCount
        skeletonClose()
      })
      .catch((err) => {
        console.error(err)
        skeletonClose()
      })
  } else {
    skeletonClose()
  }
  // 交易统计
  if ($access('ENT_C_MAIN_PAY_COUNT')) {
    getPayCount(vdata.searchData)
      .then((res) => {
        vdata.mainChart.payCount = res
        // console.log('交易统计', res)
        res.length === 0 ? (vdata.isPayCount = false) : (vdata.isPayCount = true)
        initPayCount()
        skeletonClose()
      })
      .catch((err) => {
        console.error(err)
        vdata.isPayCount = false
        skeletonClose()
      })
  } else {
    vdata.isPayCount = false
    skeletonClose()
  }
  if ($access('ENT_C_MAIN_PAY_TYPE_COUNT')) {
    // 支付类型统计
    getPayType(vdata.searchData)
      .then((res) => {
        vdata.mainChart.payType = res[0]
        res[0].length === 0 ? (vdata.isPayType = false) : (vdata.isPayType = true)
        initPayType()
        skeletonClose()
      })
      .catch((err) => {
        console.error(err)
        vdata.isPayType = false
        skeletonClose()
      })
  } else {
    vdata.isPayType = false
    skeletonClose()
  }
}
function initPayAmount() {
  vdata.tinyArea.render()
  vdata.tinyArea.changeData(vdata.mainChart.payAmountData)
}
function initPayCount() {
  vdata.columnPlot.render()
  vdata.columnPlot.changeData(vdata.mainChart.payCount)
}
function initPayType() {
  vdata.piePlot.render()
  vdata.piePlot.changeData(vdata.mainChart.payType)
}
function renderStatistic(containerWidth, text, style) {
  const { width: textWidth, height: textHeight } = measureTextWidth(text, style)
  const R = containerWidth / 2
  // r^2 = (w / 2)^2 + (h - offsetY)^2
  let scale = 0.7
  if (containerWidth < textWidth) {
    scale = Math.min(
      Math.sqrt(Math.abs(Math.pow(R, 2) / (Math.pow(textWidth / 2, 2) + Math.pow(textHeight, 2)))),
      1
    )
  }
  const textStyleStr = `width:${containerWidth}px`
  return `<div style="${textStyleStr};font-size:${scale}em;line-height:${scale < 1 ? 1 : 'inherit'};">${text}</div>`
}
function showDrawer() {
  vdata.visible = true
}
function onClose() {
  vdata.visible = false
}
function payOnChange(date, dateString) {
  vdata.searchData.createdStart = dateString[0] // 开始时间
  vdata.searchData.createdEnd = dateString[1] // 结束时间
  vdata.pieDays = true
  vdata.jeeDatePie = dateString[0] + ' ~ ' + dateString[1]
}
// 交易统计，日期选择器，关闭按钮点击事件
function iconClick(dates) {
  vdata.searchData.createdStart = dayjs().subtract(7, 'days').format('YYYY-MM-DD') // 开始时间
  vdata.searchData.createdEnd = dayjs().format('YYYY-MM-DD') // 结束时间
  payCountOk()
  vdata.jeeDate = '最近七天'
  vdata.lastSevenDays = true
}
// 支付方式，日期选择器，关闭按钮点击事件
function iconPieClick() {
  vdata.searchData.createdStart = dayjs().subtract(7, 'days').format('YYYY-MM-DD') // 开始时间
  vdata.searchData.createdEnd = dayjs().format('YYYY-MM-DD') // 结束时间
  payTypeOk()
  vdata.jeeDatePie = '最近七天'
  vdata.pieDays = false
}
// ,
function disabledDate(current) {
  // 当天之前的三十天，可选。 当天也可选
  return current < dayjs().subtract(32, 'days') || current > dayjs().endOf('day')
}
function transactionChange(dates, dateStrings) {
  vdata.searchData.createdStart = dateStrings[0] // 开始时间
  vdata.searchData.createdEnd = dateStrings[1] // 结束时间
  vdata.jeeDate = dateStrings[0] + ' ~ ' + dateStrings[1]
  vdata.lastSevenDays = false
}
function payCountOk() {
  getPayCount(vdata.searchData).then((res) => {
    res.length === 0 ? (vdata.isPayCount = false) : (vdata.isPayCount = true)
    vdata.columnPlot.changeData(res)
  })
}
function payTypeOk() {
  getPayType(vdata.searchData).then((res) => {
    res[0].length === 0 ? (vdata.isPayType = false) : (vdata.isPayType = true)
    vdata.piePlot.changeData(res[0])
  })
}

function skeletonClose() {
  // 每次请求成功，skeletonReqNum + 1,当大于等于4时， 取消骨架屏展示
  vdata.skeletonReqNum++
  vdata.skeletonReqNum >= 4 ? (vdata.skeletonIsShow = false) : (vdata.skeletonIsShow = true)
}

const quickMenuList = computed(() => {
  const result: any = []

  const putResult = function (item) {
    for (let i = 0; i < item.length; i++) {
      if (item[i].menuUri && item[i].quickJump === 1) {
        result.push(item[i])
      }
      if (item[i].children) {
        putResult(item[i].children)
      }
    }
  }

  putResult(userStore.userInfo.allMenuRouteTree)
  return result
})

onMounted(() => {
  vdata.tinyArea = new TinyArea('payAmount', {
    autoFit: true,
    data: vdata.mainChart.payAmountData,
    smooth: true,
  })

  vdata.columnPlot = new Column('payCount', {
    data: vdata.mainChart.payCount,
    xField: 'date',
    yField: 'payAmount',
    seriesField: 'type',
    isGroup: 'true',
    marginRatio: 0,
    height: 300,
    // appendPadding: 16,
    appendPadding: [0, 0, 0, 10], // 增加额外的边距，防止左侧的辅助文字被遮挡
    theme: {
      colors10: ['#FFB238', '#F55536'],
    },
    label: {
      // 可配置附加的布局方法
      layout: [],
      style: {
        fillOpacity: 0,
      },
    },
  })

  vdata.piePlot = new Pie('payType', {
    width: '100%',
    appendPadding: [10, 16, 10, 10], // 增加额外的边距，防止左侧的辅助文字被遮挡
    data: vdata.mainChart.payType,
    angleField: 'typeAmount', // 金额  // 笔数 typeCount
    colorField: 'typeName',
    radius: 1,
    innerRadius: 0.64,
    autoFit: true,
    color: [
      '#FF6B3B',
      '#626681',
      '#FFC100',
      '#9FB40F',
      '#76523B',
      '#DAD5B5',
      '#0E8E89',
      '#E19348',
      '#F383A2',
      '#247FEA',
      '#2BCB95',
      '#B1ABF4',
      '#1D42C2',
      '#1D9ED1',
      '#D64BC0',
      '#255634',
      '#8C8C47',
      '#8CDAE5',
      '#8E283B',
      '#791DC9',
    ],
    meta: {
      value: {
        formatter: (v) => `${v} ¥`,
      },
    },
    label: {
      type: 'inner',
      offset: '-50%',
      style: {
        textAlign: 'center',
      },
      autoRotate: false,
      content: '{value}',
    },
    statistic: {
      title: {
        offsetY: -4,
        customHtml: (container, view, datum) => {
          const { width, height } = container.getBoundingClientRect()
          const d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2))
          const text = datum ? datum.typeName : '总计'
          return renderStatistic(d, text, { fontSize: 28 })
        },
      },
      content: {
        offsetY: 4,
        style: {
          fontSize: '32px',
        },
        customHtml: (container, view, datum, data) => {
          const { width } = container.getBoundingClientRect()
          // 在这里保留小数点后两位
          const fixedTwo = data!.reduce((r, d) => r + d.typeAmount, 0).toFixed(2)
          const text = datum ? `¥ ${datum.typeAmount}` : `¥ ${fixedTwo}`
          return renderStatistic(width, text, { fontSize: 32 })
        },
      },
    },
    // 添加 中心统计文本 交互
    interactions: [
      { type: 'element-selected' },
      { type: 'element-active' },
      { type: 'pie-statistic-active' },
    ],
  })

  // 用户名信息以及时间问候语句。由于退出登陆才让他更改成功，所以这里的数据先从 vuex中获取
  vdata.mainTips.helloTitle = `${timeFix()}，` + userStore.userInfo.userName
  init()
  // 去掉交易统计 日期选择框，原生的边框
  // jeeRange.value.$refs.picker.$el.firstChild.style.border = 'none'
  // jeeRangePie.value.$refs.picker.$el.firstChild.style.border = 'none'
})
</script>

<style lang="less" scoped>
@import './index.less'; // 响应式布局
.user-greet {
  font-size: 19px;
  font-weight: 500;

  .quick-start {
    box-sizing: border-box;
    padding-top: 20px;

    .quick-start-title {
      font-size: 16px;
      font-weight: 500;
      text-align: left;
      margin-bottom: 0;
    }
    .quick-start-ul {
      font-size: 13px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      width: 100%;
      padding: 0;
      margin-bottom: 0;

      li {
        margin-right: 20px;
        margin-top: 10px;
        text-align: left;

        :hover {
          color: @jee-inside-link;
        }
      }
      li:hover {
        cursor: pointer;
      }
    }
  }
}
.chart-padding {
  box-sizing: border-box;
  padding: 0 5px;
  width: 300px;
}

.user-greet-title {
  box-sizing: border-box;
  padding-bottom: 20px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #ddd;

  .user-greet-all {
    display: flex;
    flex-direction: row;

    .user-greet-img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      background: #ddd;
      margin-right: 10px;
      img {
        width: 60px;
        height: 60px;
        border: 1px solid rgba(0, 0, 0, 0.08);
      }
    }
    .user-greet-all {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
    }
  }
}
.analy-title {
  display: flex;
  justify-content: space-between;
  padding-bottom: 0;
  align-items: center;
}
.there-spot:hover {
  cursor: pointer;
}
.ant-calendar-picker-input {
  border: none !important;
}
.payAmountSpan {
  display: flex;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  position: absolute;
  bottom: 20px;
  padding: 0 20px;
  box-sizing: border-box;
}

.chart-data {
  padding: 20px;
  box-sizing: border-box;
}

.top-left {
  .chart-data {
    padding: 0;
  }
}

.pay-amount-text {
  display: flex;
  padding: 0 20px 0 16px;
  box-sizing: border-box;
  height: 33px;
  line-height: 33px;
  align-items: baseline;
  margin-bottom: 10px;
  .pay-amount {
    font-size: 33px;
    margin-right: 10px;
  }
}

.pay-count-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  .pay-count-date {
    display: flex;
    justify-content: space-around;
  }
}
.chart-padding {
  box-sizing: border-box;
  max-width: 330px;
  min-width: 260px;
  flex-grow: 1;
  flex-shrink: 1;
  margin-bottom: 20px;
}
.change-date-layout {
  padding-left: 11px;
  align-items: center;
  display: flex;
  justify-content: space-between;

  .change-date-icon {
    width: 50px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  margin-right: 20px;
  margin-bottom: 20px;
}

#chart-card {
  background-color: #f0f2f5;
}
</style>
