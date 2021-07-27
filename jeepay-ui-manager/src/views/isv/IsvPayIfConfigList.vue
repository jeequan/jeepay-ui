<template>
  <a-drawer
    :visible="visible"
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
      :span="jeepayCard.span"
      :height="jeepayCard.height"
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
            <a-badge :status="record.ifConfigState ===1 ? 'processing' : 'error'" :text="record.ifConfigState ===1 ? '启用' : '未开通'" ></a-badge>
          </div>
          <!-- 卡片底部操作栏 -->
          <div class="jeepay-card-ops">
            <a v-if="$access('ENT_ISV_PAY_CONFIG_ADD')" @click="editPayIfConfigFunc(record)">填写参数 <a-icon key="right" type="right" style="fontSize: 13px"></a-icon></a>
            <a v-else>暂无操作</a>
          </div>
        </div>
      </div>
    </JeepayCard>
    <a-drawer
      title="支付参数配置"
      width="40%"
      :closable="true"
      :visible="childrenVisible"
      :body-style="{ paddingBottom: '80px' }"
      @close="onChildrenDrawerClose"
      :maskClosable="false"
    >
      <a-form-model ref="infoFormModel" :model="saveObject" layout="vertical" :rules="rules">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item label="支付接口费率" prop="ifRate">
              <a-input v-model="saveObject.ifRate" placeholder="请输入" suffix="%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="状态" prop="state">
              <a-radio-group v-model="saveObject.state">
                <a-radio :value="1">
                  启用
                </a-radio>
                <a-radio :value="0">
                  停用
                </a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="备注" prop="remark">
              <a-input v-model="saveObject.remark" placeholder="请输入" type="textarea" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
      <a-divider orientation="left">
        <a-tag color="#FF4B33">
          {{ saveObject.ifCode }} 服务商参数配置
        </a-tag>
      </a-divider>
      <a-form-model ref="isvParamFormModel" :model="ifParams" layout="vertical" :rules="ifParamsRules">
        <a-row :gutter="16">
          <a-col v-for="(item, key) in isvParams" :key="key" :span="item.type === 'text' ? 12 : 24">
            <a-form-model-item :label="item.desc" :prop="item.name" v-if="item.type === 'text' || item.type === 'textarea'">
              <a-input v-if="item.star === '1'" v-model="ifParams[item.name]" :placeholder="ifParams[item.name + '_ph']" :type="item.type" />
              <a-input v-else v-model="ifParams[item.name]" placeholder="请输入" :type="item.type" />
            </a-form-model-item>
            <a-form-model-item :label="item.desc" :prop="item.name" v-else-if="item.type === 'radio'">
              <a-radio-group v-model="ifParams[item.name]">
                <a-radio v-for="(radioItem, radioKey) in item.values" :key="radioKey" :value="radioItem.value">
                  {{ radioItem.title }}
                </a-radio>
              </a-radio-group>
            </a-form-model-item>
            <a-form-model-item :label="item.desc" :prop="item.name" v-else-if="item.type === 'file'">
              <a-input v-model="ifParams[item.name]" disabled="disabled" />
              <JeepayUpload
                :action="action"
                :fileUrl="ifParams[item.name]"
                @uploadSuccess="uploadSuccess($event, item.name)"
              >
                <template slot="uploadSlot" slot-scope="{loading}">
                  <a-button style="marginTop:5px;"> <a-icon :type="loading ? 'loading' : 'upload'" /> {{ loading ? '正在上传' : '点击上传' }} </a-button>
                </template>
              </JeepayUpload>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
      <div class="drawer-btn-center">
        <a-button @click="onChildrenDrawerClose" :style="{ marginRight: '8px' }" icon="close">
          取消
        </a-button>
        <a-button type="primary" @click="onSubmit" :loading="btnLoading" icon="check">
          保存
        </a-button>

      </div>
    </a-drawer>
    <!-- 支付参数配置页面组件  -->
    <WxpayPayConfig ref="wxpayPayConfig" :callbackFunc="refCardList" />
    <!-- 支付参数配置页面组件  -->
    <AlipayPayConfig ref="alipayPayConfig" :callbackFunc="refCardList" />
  </a-drawer>
</template>

<script>
import JeepayCard from '@/components/JeepayCard/JeepayCard'
import JeepayUpload from '@/components/JeepayUpload/JeepayUpload'
import WxpayPayConfig from './custom/WxpayPayConfig'
import AlipayPayConfig from './custom/AlipayPayConfig'
import { API_URL_ISV_PAYCONFIGS_LIST, getIsvPayConfigUnique, req, upload } from '@/api/manage'

export default {
  components: {
    JeepayCard,
    JeepayUpload,
    WxpayPayConfig,
    AlipayPayConfig
  },
  data () {
    return {
      btnLoading: false,
      isvNo: null, // 服务商号
      action: upload.cert, // 上传文件地址
      visible: false, // 一级抽屉开关
      childrenVisible: false, // 二级抽屉开关
      isvParams: {}, // 支付接口定义描述
      saveObject: {}, // 保存的对象
      ifParams: {}, // 参数配置对象
      jeepayCard: { // 卡片配置
        height: 300,
        span: { xxl: 6, xl: 4, lg: 4, md: 3, sm: 2, xs: 1 }
      },
      rules: {
        infoId: [{ required: true, trigger: 'blur' }],
        ifCode: [{ required: true, trigger: 'blur' }],
        ifRate: [{ required: false, pattern: /^(([1-9]{1}\d{0,1})|(0{1}))(\.\d{1,4})?$/, message: '请输入0-100之间的数字，最多四位小数', trigger: 'blur' }]
      },
      ifParamsRules: {}
    }
  },
  watch: {
    ifParams: function (o, n) {
      this.$set(this.ifParams, 'appSecret', this.ifParams.appSecret) // 解决appSecret  双向绑定数据不显示的问题
    }
  },
  methods: {
    generoterRules () {
      const rules = {}
      let newItems = []
      this.isvParams.forEach(item => {
        newItems = []
        if (item.verify === 'required' && item.star !== '1') {
          newItems.push({
            required: true,
            message: '请输入' + item.desc,
            trigger: 'blur'
          })
          rules[item.name] = newItems
        }
      })
      this.ifParamsRules = rules
    },
    // 弹层打开事件
    show: function (isvNo) {
      this.isvNo = isvNo
      this.ifCode = null
      this.visible = true
      this.refCardList()
    },
    // 请求支付接口定义数据
    reqCardListFunc () {
      return req.list(API_URL_ISV_PAYCONFIGS_LIST, { 'isvNo': this.isvNo })
    },
    // 刷新card列表
    refCardList () {
      this.$refs.infoCard.refCardList()
    },
    // 支付参数配置
    editPayIfConfigFunc (record) {
      if (record.configPageType === 1) { // JSON渲染页面
        if (this.$refs.infoFormModel !== undefined) {
          this.$refs.infoFormModel.resetFields()
        }
        if (this.$refs.isvParamFormModel !== undefined) {
          this.$refs.isvParamFormModel.resetFields()
        }
        this.childrenVisible = true // 打开支付参数配置抽屉
        this.saveObject = {} // 要保存的对象
        this.ifParams = {} // 参数配置对象
        this.isvParams = {} // 支付接口定义描述
        this.saveObject.infoId = this.isvNo
        this.saveObject.ifCode = record.ifCode
        this.saveObject.state = record.ifConfigState === 0 ? 0 : 1

        if (!record) {
          return
        }

        const that = this
        // 获取支付参数
        getIsvPayConfigUnique(this.saveObject.infoId, this.saveObject.ifCode).then(res => {
          if (res && res.ifParams) {
            this.saveObject = res
            this.ifParams = JSON.parse(res.ifParams)
          }

          const newItems = [] // 重新加载支付接口配置定义描述json
          JSON.parse(record.isvParams).forEach(item => {
            const radioItems = [] // 存放单选框value title
            if (item.type === 'radio') {
              const valueItems = item.values.split(',')
              const titleItems = item.titles.split(',')

              for (const i in valueItems) {
                // 检查参数是否为数字类型 然后赋值给radio值
              let radioVal = valueItems[i]
              if (!isNaN((radioVal))) { radioVal = Number(radioVal) }

                radioItems.push({
                  value: radioVal,
                  title: titleItems[i]
                })
              }
            }

            if (item.star === '1') {
              that.ifParams[item.name + '_ph'] = that.ifParams[item.name] ? that.ifParams[item.name] : '请输入'
              that.ifParams[item.name] = ''
            }

            newItems.push({
              name: item.name,
              desc: item.desc,
              type: item.type,
              verify: item.verify,
              values: radioItems,
              star: item.star // 脱敏标识 1-是
            })
          })
          that.isvParams = newItems // 重新赋值接口定义描述
          that.generoterRules()
          that.$forceUpdate()
        })
      } else if (record.configPageType === 2) { // 自定义配置页面，页面放在custom目录下，配置模块命名规则：if_code + PayConfig
        this.$refs[record.ifCode + 'PayConfig'].show(this.isvNo, record)
      }
    },
    // 表单提交
    onSubmit () {
      const that = this
      this.$refs.infoFormModel.validate(valid => {
        this.$refs.isvParamFormModel.validate(valid2 => {
          if (valid && valid2) { // 验证通过
            that.btnLoading = true
            const reqParams = {}
            reqParams.infoId = that.saveObject.infoId
            reqParams.ifCode = that.saveObject.ifCode
            reqParams.ifRate = that.saveObject.ifRate
            reqParams.state = that.saveObject.state
            reqParams.remark = that.saveObject.remark
            // 支付参数配置不能为空
            if (Object.keys(that.ifParams).length === 0) {
              this.$message.error('参数不能为空！')
              return
            }
            // 脱敏数据为空时，删除该key
            this.isvParams.forEach(item => {
              if (item.star === '1' && that.ifParams[item.name] === '') {
                that.ifParams[item.name] = undefined
              }
              that.ifParams[item.name + '_ph'] = undefined
            })
            reqParams.ifParams = JSON.stringify(that.ifParams)
            // 请求接口
            req.add(API_URL_ISV_PAYCONFIGS_LIST, reqParams).then(res => {
              that.$message.success('保存成功')
              that.childrenVisible = false
              that.refCardList()
              that.btnLoading = false
            })
          }
        })
      })
    },
    // 上传文件成功回调方法，参数value为文件地址，name是自定义参数
    uploadSuccess (value, name) {
      this.ifParams[name] = value
      this.$forceUpdate()
    },
    // 抽屉关闭
    onClose () {
      this.visible = false
    },
    onChildrenDrawerClose () {
      this.childrenVisible = false
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
    font-size: 16px;
    font-family: PingFang SC, PingFang SC-Bold;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 1px;
  }
</style>
