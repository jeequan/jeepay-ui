<template>
  <a-drawer
    v-if="visible"
    :visible="visible"
    @close="onClose"
    :closable="true"
    :maskClosable="false"
    :body-style="{ paddingBottom: '80px' }"
    :drawer-style="{ backgroundColor: '#f0f2f5' }"
    width="80%"
  >

    <a-descriptions title="绑定分账接收者账号">
      <a-descriptions-item label="当前应用">
        <span style="color: red">{{ appInfo.appName }} [{{ appInfo.appId }}]</span>
      </a-descriptions-item>

      <a-descriptions-item label="选择要加入到的账号分组">
        <a-select style="width: 210px" placeholder="账号分组" v-model="selectedReceiverGroupId">
          <a-select-option v-for="(item) in allReceiverGroup" :key="item.receiverGroupId" :value="item.receiverGroupId">{{ item.receiverGroupName }}</a-select-option>
        </a-select>
      </a-descriptions-item>
    </a-descriptions>
    <a-divider></a-divider>

    <a-card title="微信账号" v-show="appSupportIfCodes.indexOf('wxpay') >= 0">
      <a slot="extra" href="#">
        <a-button style="background: green; color: white" icon="wechat" @click="addReceiverRow('wxpay')">添加【微信官方】分账接收账号</a-button>
      </a>
      <a-table :columns="accTableColumns" :data-source="receiverTableData.filter((item) => item.ifCode == 'wxpay')" :pagination="false" rowKey="rowKey">

        <!-- 账号类型 -->
        <template slot="reqBindStateSlot" slot-scope="record">
          <div style="color: salmon " v-show="record.reqBindState == 0">
            <a-icon type="info-circle" /> 待绑定
          </div>
          <div style="color: green; " v-show="record.reqBindState == 1">
            <a-icon type="check-circle" /> 绑定成功
          </div>
          <div style="color: red; " v-show="record.reqBindState == 2">
            <a-icon type="close-circle" /> 绑定异常
          </div>

        </template>

        <!-- 账号别名 -->
        <template slot="receiverAliasSlot" slot-scope="record">
          <a-input v-model="record.receiverAlias" style="width: 150px" placeholder="(选填)默认为账号"/>
        </template>

        <!-- 账号类型 -->
        <template slot="accTypeSlot" slot-scope="record">
          <a-select style="width: 110px" v-model="record.accType" placeholder="账号类型" default-value="0">
            <a-select-option value="0">个人</a-select-option>
            <a-select-option value="1">微信商户</a-select-option>
          </a-select>
        </template>

        <!-- 接收方账号 -->
        <template slot="accNoSlot" slot-scope="record">
          <a-input v-model="record.accNo" style="width: 150px"/>
          <a-button type="link" v-if="record.accType == 0" @click="showChannelUserModal('wxpay', record)">扫码获取</a-button>
        </template>

        <!-- 接收方姓名 -->
        <template slot="accNameSlot" slot-scope="record">
          <a-input v-model="record.accName"/>
        </template>

        <!-- 分账关系 -->
        <template slot="relationTypeSlot" slot-scope="record">
          <a-select style="width: 110px" labelInValue placeholder="分账关系类型" :defaultValue="{key: 'PARTNER'}" @change="changeRelationType(record, $event)">
            <a-select-option key="PARTNER">合作伙伴</a-select-option>
            <a-select-option key="SERVICE_PROVIDER">服务商</a-select-option>
            <a-select-option key="STORE">门店</a-select-option>
            <a-select-option key="STAFF">员工</a-select-option>
            <a-select-option key="STORE_OWNER">店主</a-select-option>
            <a-select-option key="HEADQUARTER">总部</a-select-option>
            <a-select-option key="BRAND">品牌方</a-select-option>
            <a-select-option key="DISTRIBUTOR">分销商</a-select-option>
            <a-select-option key="USER">用户</a-select-option>
            <a-select-option key="SUPPLIER">供应商</a-select-option>
            <a-select-option key="CUSTOM">自定义</a-select-option>
          </a-select>
        </template>

        <!-- 关系名称 -->
        <template slot="relationTypeNameSlot" slot-scope="record">
          <a-input :disabled="record.relationType !== 'CUSTOM'" v-model="record.relationTypeName"/>
        </template>

        <!-- 默认分账比例 -->
        <template slot="divisionProfitSlot" slot-scope="record">
          <a-input v-model="record.divisionProfit" style="width: 65px"/> %
        </template>

        <template slot="opSlot" slot-scope="record"><a-button type="link" @click="delRow(record)">删除</a-button></template>

      </a-table>
    </a-card>

    <br />
    <a-card title="支付宝账号" v-show="appSupportIfCodes.indexOf('alipay') >= 0">
      <a slot="extra" href="#">
        <a-button style="background: dodgerblue; color: white" icon="alipay-circle" @click="addReceiverRow('alipay')" >添加【支付宝官方】分账接收账号</a-button>
      </a>
      <a-table :columns="accTableColumns" :data-source="receiverTableData.filter((item) => item.ifCode == 'alipay')" :pagination="false" rowKey="rowKey">

        <!-- 账号类型 -->
        <template slot="reqBindStateSlot" slot-scope="record">
          <div style="color: salmon " v-show="record.reqBindState == 0">
            <a-icon type="info-circle" /> 待绑定
          </div>
          <div style="color: green; " v-show="record.reqBindState == 1">
            <a-icon type="check-circle" /> 绑定成功
          </div>
          <div style="color: red; " v-show="record.reqBindState == 2">
            <a-icon type="close-circle" /> 绑定异常
          </div>

        </template>

        <!-- 账号别名 -->
        <template slot="receiverAliasSlot" slot-scope="record">
          <a-input v-model="record.receiverAlias" style="width: 150px" placeholder="(选填)默认为账号"/>
        </template>

        <!-- 账号类型 -->
        <template slot="accTypeSlot" slot-scope="record">
          <a-select style="width: 110px" v-model="record.accType" placeholder="账号类型" default-value="0">
            <a-select-option value="0">个人</a-select-option>
            <a-select-option value="1">微信商户</a-select-option>
          </a-select>
        </template>

        <!-- 接收方账号 -->
        <template slot="accNoSlot" slot-scope="record">
          <a-input v-model="record.accNo" style="width: 150px"/>
          <a-button type="link" v-if="record.accType == 0" @click="showChannelUserModal('alipay', record)">扫码获取</a-button>
        </template>

        <!-- 接收方姓名 -->
        <template slot="accNameSlot" slot-scope="record">
          <a-input v-model="record.accName"/>
        </template>

        <!-- 分账关系 -->
        <template slot="relationTypeSlot" slot-scope="record">
          <a-select style="width: 110px" labelInValue placeholder="分账关系类型" :defaultValue="{key: 'PARTNER'}" @change="changeRelationType(record, $event)">
            <a-select-option key="PARTNER">合作伙伴</a-select-option>
            <a-select-option key="SERVICE_PROVIDER">服务商</a-select-option>
            <a-select-option key="STORE">门店</a-select-option>
            <a-select-option key="STAFF">员工</a-select-option>
            <a-select-option key="STORE_OWNER">店主</a-select-option>
            <a-select-option key="HEADQUARTER">总部</a-select-option>
            <a-select-option key="BRAND">品牌方</a-select-option>
            <a-select-option key="DISTRIBUTOR">分销商</a-select-option>
            <a-select-option key="USER">用户</a-select-option>
            <a-select-option key="SUPPLIER">供应商</a-select-option>
            <a-select-option key="CUSTOM">自定义</a-select-option>
          </a-select>
        </template>

        <!-- 关系名称 -->
        <template slot="relationTypeNameSlot" slot-scope="record">
          <a-input :disabled="record.relationType !== 'CUSTOM'" v-model="record.relationTypeName"/>
        </template>

        <!-- 默认分账比例 -->
        <template slot="divisionProfitSlot" slot-scope="record">
          <a-input v-model="record.divisionProfit" style="width: 65px"/> %
        </template>

        <template slot="opSlot" slot-scope="record"><a-button type="link" @click="delRow(record)">删除</a-button></template>

      </a-table>
    </a-card>

    <div class="drawer-btn-center ">
      <a-button type="primary" icon="rocket" :style="{ marginRight: '8px' }" @click="reqBatchBindReceiver(0)">发起绑定请求</a-button>
      <a-button icon="close" @click="onClose">关闭</a-button>
    </div>

    <ChannelUserModal ref="channelUserModal" @changeChannelUserId="changeChannelUserIdFunc($event)"/>
  </a-drawer>
</template>

<script>

// eslint-disable-next-line no-unused-vars
import { genRowKey } from '@/utils/util'
import ChannelUserModal from '@/components/ChannelUser/ChannelUserModal'
import { API_URL_DIVISION_RECEIVER, API_URL_DIVISION_RECEIVER_GROUP, req, getIfCodeByAppId } from '@/api/manage'

// eslint-disable-next-line no-unused-vars
const accTableColumns = [
  { key: 'reqBindState', title: '状态', scopedSlots: { customRender: 'reqBindStateSlot' } },
  { key: 'receiverAlias', title: '账号别名', scopedSlots: { customRender: 'receiverAliasSlot' } },
  { key: 'accType', title: '账号类型', scopedSlots: { customRender: 'accTypeSlot' } },
  { key: 'accNo', width: '300px', title: '接收方账号', scopedSlots: { customRender: 'accNoSlot' } },
  { key: 'accName', width: '180px', title: '接收方姓名', scopedSlots: { customRender: 'accNameSlot' } },
  { key: 'relationType', title: '分账关系', scopedSlots: { customRender: 'relationTypeSlot' } },
  { key: 'relationTypeName', width: '200px', title: '关系名称', scopedSlots: { customRender: 'relationTypeNameSlot' } },
  { key: 'divisionProfit', title: '默认分账比例', scopedSlots: { customRender: 'divisionProfitSlot' } },
  { key: 'op', title: '操作', scopedSlots: { customRender: 'opSlot' } }
]

const defaultReceiverTemplate = {
    reqBindState: 0, // 默认待绑定
    receiverAlias: '',
    receiverGroupId: '',
    appId: '',
    ifCode: '',
    accType: '0',
    accNo: '',
    accName: '',
    relationType: 'PARTNER', // 默认合作伙伴, 需要同时更改select的defaultValue
    relationTypeName: '合作伙伴',
    divisionProfit: ''
}

export default {
  components: { ChannelUserModal },
  props: {
    callbackFunc: {
      type: Function,
      default: () => ({})
    }
  },
  data () {
    return {
      visible: false, // 是否显示抽屉
      appInfo: null, // 应用app信息
      accTableColumns: accTableColumns, // 表头模板（微信支付宝公用）

      allReceiverGroup: [], // 当前商户所有的接收账号的分组情况
      selectedReceiverGroupId: '', // 当前选择的分组ID
      appSupportIfCodes: [], // 应用支持的支付方式
      receiverTableData: [] // 微信支付的分账用户列表集合
    }
  },
  methods: {
    // 弹层打开事件
    show (appInfo) {
      const that = this // 提前保留this

      this.appSupportIfCodes = [] // 初始化
      this.receiverTableData = [] // 置空表格

      // 请求接口，获取所有分组信息，只有此处进行pageSize=-1传参
      req.list(API_URL_DIVISION_RECEIVER_GROUP, { pageSize: -1 }).then(res => {
        that.allReceiverGroup = res.records
        if (that.allReceiverGroup && that.allReceiverGroup.length > 0) { // 默认选中第一个 & 更新列表
          that.selectedReceiverGroupId = that.allReceiverGroup[0].receiverGroupId
        }
      })

      // 查询支持的分账接口
      getIfCodeByAppId(appInfo.appId).then((res) => {
        that.appSupportIfCodes = res
      })

      this.appInfo = appInfo // 应用信息

      this.visible = true // 显示弹层
    },
    // 抽屉关闭
    onClose () {
      this.callbackFunc() // 刷新列表
      this.visible = false
    },
    // 删除某一行
    delRow (item) {
      const index = this.receiverTableData.indexOf(item)
      if (index > -1) {
        this.receiverTableData.splice(index, 1)
      }
    },
    changeRelationType (record, value) {
      record.relationType = value.key
      if (value.key !== 'CUSTOM') {
        record.relationTypeName = value.label
      } else {
        record.relationTypeName = ''
      }
    },

    // 显示获取用户ID的弹层
    showChannelUserModal (ifCode, record) {
      this.$refs.channelUserModal.showModal(this.appInfo.appId, ifCode, record)
    },

    // 接收到当前渠道用户ID信息
    changeChannelUserIdFunc ({ channelUserId, extObject }) {
      console.log(channelUserId, extObject)
      extObject.accNo = channelUserId
    },

    // 添加一行账号信息
    addReceiverRow (ifCode) {
      if (!this.selectedReceiverGroupId) {
        return this.$message.error('请选选择要加入的分组')
      }
      this.receiverTableData.push(Object.assign({}, defaultReceiverTemplate, { rowKey: genRowKey(), ifCode: ifCode, appId: this.appInfo.appId }))
    },

    // 单条绑定 返回是否成功
    reqBatchBindReceiver (i) {
      const that = this

      if (that.receiverTableData.length <= 0) {
        return that.$message.error('请先添加账号')
      }

      // 完成了所有的绑定操作
      if (i >= that.receiverTableData.length) {
        return this.$message.success('已完成所有账号的绑定操作')
      }

      // 当前的账号
      const currentReceiver = that.receiverTableData[i]
      currentReceiver.receiverGroupId = that.selectedReceiverGroupId // 设置分组ID

      if (currentReceiver.reqBindState === 1) { // 已经绑定成功， 不在重复发起
        return that.reqBatchBindReceiver(++i) // 递归继续绑定
      }

      if (!currentReceiver.accNo) {
        return this.$message.error(`第${i + 1 }条： 接收方账号不能为空`)
      }

      if (currentReceiver.relationType === 'CUSTOM' && !currentReceiver.relationTypeName) {
        return this.$message.error(`第${i + 1 }条： 自定义类型时接收方账号名称不能为空`)
      }

      if (!currentReceiver.divisionProfit || currentReceiver.divisionProfit <= 0 || currentReceiver.divisionProfit > 100) {
        return this.$message.error(`第${i + 1 }条： 默认分账比例请设置在[0.01% ~ 100% ] 之间`)
      }

      req.add(API_URL_DIVISION_RECEIVER, currentReceiver).then(apiRes => {
        // 绑定成功
        if (apiRes.bindState === 1) {
          that.reqBatchBindReceiver(++i) // 递归继续绑定
          currentReceiver.reqBindState = 1 // 成功
        } else {
          currentReceiver.reqBindState = 2 // 异常
          that.$infoBox.modalError(`第${i + 1 }条： 绑定异常`, <div><div>错误码：{ apiRes.errCode}</div><div>错误信息：{ apiRes.errMsg}</div></div>)
        }
      }).catch(() => {
        currentReceiver.reqBindState = 2 // 异常
      })
    }

  }
}
</script>
