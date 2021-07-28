<template>
  <a-drawer
    title="填写参数"
    width="40%"
    :closable="true"
    :maskClosable="false"
    :visible="visible"
    :body-style="{ paddingBottom: '80px' }"
    @close="onClose"
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
        {{ saveObject.ifCode }} 商户参数配置
      </a-tag>
    </a-divider>
    <a-form-model ref="mchParamFormModel" :model="ifParams" layout="vertical" :rules="ifParamsRules">
      <a-row :gutter="16">
        <a-col v-for="(item, key) in mchParams" :key="key" :span="item.type === 'text' ? 12 : 24">
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
    <div class="drawer-btn-center" v-if="$access('ENT_MCH_PAY_CONFIG_ADD')">
      <a-button :style="{ marginRight: '8px' }" @click="onClose" icon="close">取消</a-button>
      <a-button type="primary" @click="onSubmit" icon="check" :loading="btnLoading">保存</a-button>
    </div>
  </a-drawer>

</template>

<script>
import JeepayCard from '@/components/JeepayCard/JeepayCard'
import JeepayUpload from '@/components/JeepayUpload/JeepayUpload'
import { API_URL_MCH_PAYCONFIGS_LIST, req, getMchPayConfigUnique, upload } from '@/api/manage'
export default {
  components: {
      JeepayCard,
      JeepayUpload
  },
  props: {
    callbackFunc: { type: Function, default: () => ({}) }
  },

  data () {
    return {
      btnLoading: false,
      visible: false, // 抽屉开关
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
    // 弹层打开事件
    show: function (appId, record) {
      this.appId = appId
      this.ifCode = record.ifCode
      this.mchType = record.mchType
      this.saveObject = {} // 要保存的对象
      this.ifParams = {} // 参数配置对象
      this.mchParams = {} // 支付接口定义描述
      this.saveObject.infoId = appId
      this.saveObject.ifCode = record.ifCode
      this.saveObject.state = record.ifConfigState === 0 ? 0 : 1
      if (this.$refs.mchParamFormModel !== undefined) {
        this.$refs.mchParamFormModel.resetFields()
      }
      this.getMchPayConfig(record)
    },
    // 支付参数配置
    getMchPayConfig (record) {
      const that = this
      // 获取支付参数
      getMchPayConfigUnique(that.saveObject.infoId, that.saveObject.ifCode).then(res => {
        if (res && res.ifParams) {
          that.saveObject = res
          that.ifParams = JSON.parse(res.ifParams)
        }

        const newItems = [] // 重新加载支付接口配置定义描述json
        let radioItems = [] // 存放单选框value title
        const mchParams = this.mchType === 1 ? record.normalMchParams : record.isvsubMchParams // 根据商户类型获取接口定义描述
        JSON.parse(mchParams).forEach(item => {
          radioItems = []
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

        that.mchParams = newItems // 重新赋值接口定义描述
        that.visible = true // 打开支付参数配置抽屉
        that.generoterRules()
      })
    },
    // 表单提交
    onSubmit () {
      const that = this
      this.$refs.infoFormModel.validate(valid => {
        this.$refs.mchParamFormModel.validate(valid2 => {
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
            that.mchParams.forEach(item => {
              if (item.star === '1' && that.ifParams[item.name] === '') {
                that.ifParams[item.name] = undefined
              }
              that.ifParams[item.name + '_ph'] = undefined
            })
            reqParams.ifParams = JSON.stringify(that.ifParams)
            // 请求接口
            if (Object.keys(reqParams).length === 0) {
              this.$message.error('参数不能为空！')
              return
            }
            req.add(API_URL_MCH_PAYCONFIGS_LIST, reqParams).then(res => {
              that.$message.success('保存成功')
              that.visible = false
              that.btnLoading = false
              that.callbackFunc()
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
    // 动态生成支付参数表单检验规则
    generoterRules () {
      const rules = {}
      let newItems = []
      this.mchParams.forEach(item => {
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
