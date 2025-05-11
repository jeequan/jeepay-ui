<template>
  <div>
    <a-card style="box-sizing: border-box; padding: 30px">
      <!-- 选择下单的应用列表 -->
      <a-form>
        <div style="display: flex; flex-direction: row">
          <a-form-item label="" class="table-head-layout">
            <a-select
              v-model:value="vdata.reqData.appId"
              @change="changeAppId"
              style="width: 300px"
            >
              <a-select-option key="">请选择应用APPID</a-select-option>
              <a-select-option v-for="item in vdata.mchAppList" :key="item.appId">
                {{ item.appName }} [{{ item.appId }}]
              </a-select-option>
            </a-select>
          </a-form-item>
        </div>
      </a-form>

      <!-- 未配置支付方式提示框 -->
      <a-divider v-if="!vdata.reqData.appId">请选择应用APPID</a-divider>
      <a-divider v-else-if="vdata.ifCodeList.length == 0">该应用尚未配置任何通道</a-divider>
      <div v-else>
        <div style="width: 100%" class="paydemo">
          <div class="paydemo-type-content">
            <div class="paydemo-type-name article-title">选择通道</div>
            <div class="paydemo-type-body">
              <template v-for="item in vdata.ifCodeList" :key="item.ifCode">
                <div
                  :class="{
                    'paydemo-type': true,
                    'color-change': true,
                    this: vdata.reqData.ifCode === item.ifCode,
                  }"
                  @click="changeCurrentIfCode(item.ifCode)"
                >
                  <span class="color-change">{{ item.ifName }}</span>
                </div>
              </template>
            </div>
          </div>

          <div class="paydemo-form-item">
            <span>入账方式：</span>
            <a-radio-group v-model:value="vdata.reqData.entryType" style="display: flex">
              <div style="display: flex">
                <a-radio value="WX_CASH" :disabled="vdata.reqData.ifCode != 'wxpay'">
                  微信零钱
                </a-radio>
                <a-radio value="ALIPAY_CASH" :disabled="vdata.reqData.ifCode != 'alipay'">
                  支付宝余额
                </a-radio>
                <a-radio value="BANK_CARD" disabled>银行卡（暂未支持）</a-radio>
              </div>
            </a-radio-group>
          </div>

          <a-divider></a-divider>
          <!-- 订单信息 -->
          <div class="paydemo-type-content">
            <div class="paydemo-type-name article-title">转账信息</div>
            <form class="layui-form">
              <div class="paydemo-form-item">
                <label>订单编号：</label>
                <span id="payMchOrderNo">{{ vdata.reqData.mchOrderNo }}</span>
                <span @click="randomOrderNo" class="paydemo-btn" style="padding: 0 3px">
                  刷新订单号
                </span>
              </div>
              <div class="paydemo-form-item">
                <span>转账金额(元)：</span>
                <a-input-number
                  :max="100000"
                  :min="0.01"
                  v-model:value="vdata.reqData.amount"
                  :precision="2"
                />
              </div>

              <div class="paydemo-form-item">
                <span>收款账号：</span>
                <a-input
                  v-model:value="vdata.reqData.accountNo"
                  style="width: 200px; margin-right: 10px"
                />
                <a-button
                  v-show="vdata.reqData.entryType == 'WX_CASH'"
                  size="small"
                  @click="showChannelUserQR"
                >
                  自动获取openID
                </a-button>
              </div>
              <div style="margin-left: 10px; color: red">
                提示：【微信官方】需要填入对应应用收款方的openID
              </div>
              <div style="margin-left: 10px; color: red">【支付宝官方】需要填入支付宝登录账号</div>

              <div class="paydemo-form-item" style="margin-top: 10px">
                <span>收款人姓名：</span>
                <a-input v-model:value="vdata.reqData.accountName" style="width: 200px" />
                <div style="margin-left: 10px; color: red">
                  提示： 填入则验证，否则不验证收款人姓名
                </div>
              </div>

              <div class="paydemo-form-item">
                <span>转账备注：</span>
                <a-input v-model:value="vdata.reqData.transferDesc" style="width: 200px" />
              </div>

              <a-collapse v-if="vdata.reqData.entryType == 'WX_CASH'">
                <a-collapse-panel key="1" header="新版转账扩展参数">
                  <div class="paydemo-form-item">
                    <span>场景ID：</span>
                    <a-input v-model:value="vdata.wxpayTransferSceneId" style="width: 200px" />
                    <span>&nbsp; 新版微信转账需要字段</span>
                  </div>
                  <div class="paydemo-form-item">
                    <span>活动名称：</span>
                    <a-input v-model:value="vdata.wxpayActiveName" style="width: 200px" />
                    <span>&nbsp; 新版微信转账需要字段</span>
                  </div>

                  <div class="paydemo-form-item">
                    <span>奖励说明：</span>
                    <a-input v-model:value="vdata.wxpayActiveRemark" style="width: 200px" />
                    <span>&nbsp; 新版微信转账需要字段</span>
                  </div>
              </a-collapse-panel>
            </a-collapse>

              <div style="margin-top: 20px; text-align: left">
                <a-button type="primary" :loading="vdata.load" @click="immediatelyPay">
                  立即转账
                </a-button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 获取用户二维码 -->
    <ChannelUserModal
      ref="channelUserModal"
      @changeChannelUserId="changeChannelUserIdFunc($event)"
    />

    <!-- 用户确认二维码 -->
    <a-modal v-model:open="vdata.openTransConfirmModal" title="等待领取" :footer="null" :width="300">
      <div style="width: 100%; margin-bottom: 20px; text-align: center">
        <img :src="vdata.openTransConfirmUrl" alt="" />
        <p>请使用微信扫码领取</p>
      </div>
    </a-modal>

  </div>
</template>

<script setup lang="tsx">
import ReconnectingWebSocket from 'reconnectingwebsocket'
import { API_URL_MCH_APP, req, queryMchTransferIfCode, doTransfer, getWebSocketPrefix } from '@/api/manage' // 接口
import ChannelUserModal from '@/components/ChannelUser/ChannelUserModal.vue'
import { use } from 'echarts'
import { reactive, getCurrentInstance, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const vdata: any = reactive({
  ifCodeList: [], // 支持的支付接口

  reqData: {
    load: false,
    appId: '', // 已选择的appId
    mchOrderNo: '', // 模拟商户订单号
    ifCode: '', // 当前选择的支付接口
    entryType: '', // 当前选择的入账方式
    amount: 0.01, // 转账金额
    accountNo: '', // 收款账号
    accountName: '', // 收款人姓名
    transferDesc: '打款', // 转账备注
  },

  wxpayTransferSceneId: '1000',
  wxpayActiveName: '活动有礼', // 微信新版转账：活动名称
  wxpayActiveRemark: '红包奖励', // 微信新版转账：奖励说明
  openTransConfirmModal: false,
  openTransConfirmUrl: '',

  mchAppList: [], // app列表
  transferOrderWebSocket: null, // 转账订单webSocket对象
})

const channelUserModal = ref()

onMounted(() => {
  // 关闭上一个webSocket监听
  if (vdata.transferOrderWebSocket) {
    vdata.transferOrderWebSocket.close()
  }
  // 获取传入的参数，如果参数存在，则为appId 重新赋值
  const appId = route.params.appId
  if (appId) {
    vdata.reqData.appId = appId // appId赋值
    changeAppId(appId)
  }

  // 请求接口，获取所有的appid，只有此处进行pageSize=-1传参
  req.list(API_URL_MCH_APP, { pageSize: -1 }).then((res) => {
    vdata.mchAppList = res.records
    if (vdata.mchAppList.length > 0) {
      // 赋予默认值
      vdata.reqData.appId = vdata.mchAppList[0].appId
      // 根据不同的appId展示不同的支付方式
      changeAppId(vdata.reqData.appId)
    }
  })

  // 在进入页面时刷新订单号
  randomOrderNo()
})

// 变更 appId的事件
function changeAppId(value) {
  if (!value) {
    vdata.ifCodeList = []
    return false
  }
  queryMchTransferIfCode(value).then((res) => {
    // 查询所有的支付接口
    vdata.ifCodeList = res
  })
}

// 刷新订单号
function randomOrderNo() {
  vdata.reqData.mchOrderNo =
    'M' + new Date().getTime() + Math.floor(Math.random() * (9999 - 1000) + 1000)
}

// 立即支付按钮
function immediatelyPay() {
  // 判断金额
  if (!vdata.reqData.amount || vdata.reqData.amount <= 0) {
    return $infoBox.message.error('请输入转账金额')
  }

  if (!vdata.reqData.ifCode) {
    return $infoBox.message.error('请选择转账通道')
  }

  if (!vdata.reqData.entryType) {
    return $infoBox.message.error('请选择入账方式')
  }

  if (!vdata.reqData.accountNo) {
    return $infoBox.message.error('请输入收款账号')
  }

  if (!vdata.reqData.transferDesc) {
    return $infoBox.message.error('请输入转账备注')
  }

  vdata.load = true

  let _reqData = JSON.parse(JSON.stringify(vdata.reqData))
  if(vdata.reqData.entryType == 'WX_CASH'){ // 微信支付特殊参数
    let channelExtra = {
      transferSceneId: vdata.wxpayTransferSceneId,
      transferSceneReportInfos: [{
          "info_type" :   "活动名称",
          "info_content" : vdata.wxpayActiveName
      },{
          "info_type" : "奖励说明",
          "info_content" : vdata.wxpayActiveRemark
      }]
    }
    _reqData.channelExtra = JSON.stringify(channelExtra);
  }

  doTransfer(_reqData)
    .then((apiRes) => {

      randomOrderNo() // 刷新订单号

      if (apiRes.state === 2) {
        const succModal = $infoBox.modalSuccess('转账成功', <div>2s后自动关闭...</div>)
        setTimeout(() => {
          succModal.destroy()
        }, 2000)
      } else if (apiRes.state === 1) {

        let channelResData = apiRes.channelResData ? JSON.parse(apiRes.channelResData) : null

        if(channelResData && channelResData.userH5ConfirmQrImgUrl){ // 用户确认模式
          vdata.openTransConfirmModal = true
          vdata.openTransConfirmUrl = channelResData.userH5ConfirmQrImgUrl

          // 监听响应结果
          vdata.transferOrderWebSocket = new ReconnectingWebSocket(
            getWebSocketPrefix() + '/api/anon/ws/transferOrder/' + apiRes.transferId + '/' + new Date().getTime()
          )
          vdata.transferOrderWebSocket.onopen = () => {}
          vdata.transferOrderWebSocket.onmessage = (msgObject) => {
            const resMsgObject = JSON.parse(msgObject.data)
            if (resMsgObject.state === 2) {
              handleClose()
              const succModal = $infoBox.modalSuccess('转账成功', <div>2s后自动关闭...</div>)
              setTimeout(() => {
                succModal.destroy()
              }, 2000)
            } else {
              handleClose()
              $infoBox.modalError(
                '转账失败',
                <div>
                  <div>错误码：{apiRes.errCode}</div>
                  <div>错误信息：{apiRes.errMsg}</div>
                </div>
              )
            }
          }
        }else{

          $infoBox.modalWarning('转账处理中', <div>请前往转账订单列表查看最终状态</div>)
        }
        
      } else if (apiRes.state === 3) {
        $infoBox.modalError(
          '转账处理失败',
          <div>
            <div>错误码：{apiRes.errCode}</div>
            <div>错误信息：{apiRes.errMsg}</div>
          </div>
        )
      } else {
        return $infoBox.message.error('转账异常' + (apiRes.errMsg ? ':' + apiRes.errMsg : '' ))
      }
    })
    .catch(() => {
      randomOrderNo() // 刷新订单号
    })
    .finally(() => (vdata.load = false))
}

// 切换ifCode
function changeCurrentIfCode(ifCode) {
  vdata.reqData.ifCode = ifCode

  if (ifCode === 'wxpay') {
    vdata.reqData.entryType = 'WX_CASH'
  } else if (ifCode === 'alipay') {
    vdata.reqData.entryType = 'ALIPAY_CASH'
  } else {
    vdata.reqData.entryType = '' // 入账方式清除
  }
}

// 显示自动获取渠道用户ID的二维码地址
function showChannelUserQR() {
  channelUserModal.value.showModal(vdata.reqData.appId, vdata.reqData.ifCode) // 打开弹窗
}

// 更新账户
function changeChannelUserIdFunc({ channelUserId }) {
  $infoBox.message.success('成功获取渠道用户ID')
  vdata.reqData.accountNo = channelUserId
}

function handleClose() {
  if (vdata.transferOrderWebSocket) {
    vdata.transferOrderWebSocket.close()
  }
  vdata.openTransConfirmModal = false
}
</script>

<style scoped lang="css">
@import './MchTransferPage.css';
</style>
