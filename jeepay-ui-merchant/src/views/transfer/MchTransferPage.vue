<template>
  <div>
    <a-card style="box-sizing:border-box;padding:30px">

      <!-- 选择下单的应用列表 -->
      <a-form>
        <div style="display:flex;flex-direction:row">
          <a-form-item label="" class="table-head-layout">
            <a-select v-model="reqData.appId" @change="changeAppId" style="width:300px">
              <a-select-option key="" >请选择应用APPID</a-select-option>
              <a-select-option v-for="(item) in mchAppList" :key="item.appId" >{{ item.appName }} [{{ item.appId }}]</a-select-option>
            </a-select>
          </a-form-item>
        </div>
      </a-form>

      <!-- 未配置支付方式提示框 -->
      <a-divider v-if="!reqData.appId">请选择应用APPID</a-divider>
      <a-divider v-else-if="ifCodeList.length == 0">该应用尚未配置任何通道</a-divider>
      <div v-else>

        <div style="width: 100%;" class="paydemo">
          <div class="paydemo-type-content">
            <div class="paydemo-type-name article-title" >选择通道</div>
            <div class="paydemo-type-body">

              <template v-for="(item) in ifCodeList">
                <div :key="item.ifCode" :class="{ 'paydemo-type': true, 'color-change': true, 'this':(reqData.ifCode === item.ifCode) }" @click="changeCurrentIfCode(item.ifCode)">
                  <span class="color-change">{{ item.ifName }}</span>
                </div>
              </template>
            </div>
          </div>

          <div class="paydemo-form-item">
            <span>入账方式：</span>
            <a-radio-group v-model="reqData.entryType" style="display:flex">
              <div style="display:flex">
                <a-radio value="WX_CASH" :disabled="reqData.ifCode != 'wxpay'" >微信零钱</a-radio>
                <a-radio value="ALIPAY_CASH" :disabled="reqData.ifCode != 'alipay'">支付宝余额</a-radio>
                <a-radio value="BANK_CARD" disabled >银行卡（暂未支持）</a-radio>
              </div>
            </a-radio-group>

          </div>

          <a-divider ></a-divider>
          <!-- 订单信息 -->
          <div class="paydemo-type-content">
            <div class="paydemo-type-name article-title">转账信息</div>
            <form class="layui-form">
              <div class="paydemo-form-item">
                <label>订单编号：</label><span id="payMchOrderNo">{{ reqData.mchOrderNo }}</span>
                <span @click="randomOrderNo" class=" paydemo-btn" style="padding:0 3px">刷新订单号</span>
              </div>
              <div class="paydemo-form-item">
                <span>转账金额(元)：</span>
                <a-input-number :max="100000" :min="0.01" v-model="reqData.amount" :precision="2" />
              </div>

              <div class="paydemo-form-item">
                <span>收款账号：</span><a-input v-model="reqData.accountNo" style="width: 200px; margin-right: 10px"/>
                <a-button v-show="reqData.entryType=='WX_CASH'" size="small" type="danger" @click="showChannelUserQR">自动获取openID</a-button>
              </div>
              <div style="margin-left: 10px; color: red">提示：【微信官方】需要填入对应应用收款方的openID</div>
              <div style="margin-left: 10px; color: red"> 【支付宝官方】需要填入支付宝登录账号</div>

              <div class="paydemo-form-item" style="margin-top: 10px">
                <span>收款人姓名：</span><a-input v-model="reqData.accountName" style="width: 200px"/>
                <div style="margin-left: 10px; color: red">提示： 填入则验证，否则不验证收款人姓名</div>
              </div>

              <div class="paydemo-form-item">
                <span>转账备注：</span><a-input v-model="reqData.transferDesc" style="width: 200px"/>
              </div>

              <div style="margin-top:20px;text-align: left">
                <a-button @click="immediatelyPay" style="padding:5px 20px;background-color: #1953ff;border-radius: 5px;color:#fff">立即转账</a-button>
              </div>
            </form>
          </div>
        </div>

      </div>

    </a-card>

    <!-- 获取用户二维码 -->
    <ChannelUserModal ref="channelUserModal" @changeChannelUserId="changeChannelUserIdFunc($event)"/>
  </div>
</template>

<script>
import { API_URL_MCH_APP, req, queryMchTransferIfCode, doTransfer } from '@/api/manage' // 接口
import ChannelUserModal from '@/components/ChannelUser/ChannelUserModal'
export default {
  components: { ChannelUserModal },
  data () {
    return {

      ifCodeList: [], // 支持的支付接口

      reqData: {
        appId: '', // 已选择的appId
        mchOrderNo: '', // 模拟商户订单号
        ifCode: '', // 当前选择的支付接口
        entryType: '', // 当前选择的入账方式
        amount: 0.01, // 转账金额
        accountNo: '', // 收款账号
        accountName: '', // 收款人姓名
        transferDesc: '打款' // 转账备注
      },

      mchAppList: [] // app列表
    }
  },

  mounted () {
    // 获取传入的参数，如果参数存在，则为appId 重新赋值
    const appId = this.$route.params.appId
    if (appId) {
      this.reqData.appId = appId // appId赋值
      this.changeAppId(appId)
    }

    const that = this // 提前保留this
    // 请求接口，获取所有的appid，只有此处进行pageSize=-1传参
    req.list(API_URL_MCH_APP, { pageSize: -1 }).then(res => {
      that.mchAppList = res.records
      if (that.mchAppList.length > 0) {
        // 赋予默认值
        that.reqData.appId = that.mchAppList[0].appId
        // 根据不同的appId展示不同的支付方式
        this.changeAppId(that.reqData.appId)
      }
    })

    // 在进入页面时刷新订单号
    this.randomOrderNo()
  },
  methods: {

    // 变更 appId的事件
    changeAppId (value) {
      if (!value) {
        this.ifCodeList = []
        return false
      }
      const that = this
      queryMchTransferIfCode(value).then(res => { // 查询所有的支付接口
        that.ifCodeList = res
      })
    },

    // 刷新订单号
    randomOrderNo () {
       this.reqData.mchOrderNo = 'M' + new Date().getTime() + Math.floor(Math.random() * (9999 - 1000) + 1000)
    },

    // 立即支付按钮
    immediatelyPay () {
      // 判断金额
      if (!this.reqData.amount || this.reqData.amount <= 0) {
        return this.$message.error('请输入转账金额')
      }

      if (!this.reqData.ifCode) {
        return this.$message.error('请选择转账通道')
      }

      if (!this.reqData.entryType) {
        return this.$message.error('请选择入账方式')
      }

      if (!this.reqData.accountNo) {
        return this.$message.error('请输入收款账号')
      }

      if (!this.reqData.transferDesc) {
        return this.$message.error('请输入转账备注')
      }

      const that = this
      doTransfer(this.reqData).then(apiRes => {
        that.randomOrderNo() // 刷新订单号

        if (apiRes.state === 2) {
          const succModal = that.$infoBox.modalSuccess('转账成功', <div>2s后自动关闭...</div>)
          setTimeout(() => { succModal.destroy() }, 2000)
        } else if (apiRes.state === 1) {
          that.$infoBox.modalWarning('转账处理中', <div>请前往转账订单列表查看最终状态</div>)
        } else if (apiRes.state === 3) {
          that.$infoBox.modalError('转账处理失败', <div><div>错误码：{ apiRes.errCode}</div>
            <div>错误信息：{ apiRes.errMsg}</div></div>)
        } else {
          return this.$message.error('转账异常')
        }
      }).catch(() => {
        that.randomOrderNo() // 刷新订单号
      })
    },

    // 切换ifCode
    changeCurrentIfCode (ifCode) {
      this.reqData.ifCode = ifCode

      if (ifCode === 'wxpay') {
        this.reqData.entryType = 'WX_CASH'
      } else if (ifCode === 'alipay') {
        this.reqData.entryType = 'ALIPAY_CASH'
      } else {
        this.reqData.entryType = '' // 入账方式清除
      }
    },

    // 显示自动获取渠道用户ID的二维码地址
    showChannelUserQR () {
      this.$refs.channelUserModal.showModal(this.reqData.appId, this.reqData.ifCode) // 打开弹窗
    },

    // 更新账户
    changeChannelUserIdFunc ({ channelUserId }) {
      this.$message.success('成功获取渠道用户ID')
      this.reqData.accountNo = channelUserId
    }
  }
}
</script>

<style scoped lang="css">
  @import './MchTransferPage.css';
</style>
