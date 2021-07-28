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
      <a-row :gutter="16" v-if="mchType === 1">
        <a-col span="12">
          <a-form-model-item label="环境配置" prop="sandbox">
            <a-radio-group v-model="ifParams.sandbox">
              <a-radio :value="1">沙箱环境</a-radio>
              <a-radio :value="0">生产环境</a-radio>
            </a-radio-group>
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="应用AppID" prop="appId">
            <a-input v-model="ifParams.appId" placeholder="请输入" />
          </a-form-model-item>
        </a-col>
        <a-col span="24">
          <a-form-model-item label="应用私钥" prop="privateKey">
            <a-input v-model="ifParams.privateKey" :placeholder="ifParams.privateKey_ph" type="textarea" />
          </a-form-model-item>
        </a-col>
        <a-col span="24">
          <a-form-model-item label="支付宝公钥" prop="alipayPublicKey">
            <a-input v-model="ifParams.alipayPublicKey" :placeholder="ifParams.alipayPublicKey_ph" type="textarea" />
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="接口签名方式(推荐使用RSA2)" prop="signType">
            <a-radio-group v-model="ifParams.signType" defaultValue="RSA">
              <a-radio value="RSA">RSA</a-radio>
              <a-radio value="RSA2">RSA2</a-radio>
            </a-radio-group>
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="公钥证书" prop="useCert">
            <a-radio-group v-model="ifParams.useCert" defaultValue="1">
              <a-radio :value="1">使用证书（请使用RSA2私钥）</a-radio>
              <a-radio :value="0">不使用证书</a-radio>
            </a-radio-group>
          </a-form-model-item>
        </a-col>
        <a-col span="24">
          <a-form-model-item label="应用公钥证书（.crt格式）" prop="appPublicCert">
            <a-input v-model="ifParams.appPublicCert" disabled="disabled" />
            <JeepayUpload
              :action="action"
              :fileUrl="ifParams.appPublicCert"
              @uploadSuccess="uploadSuccess($event, 'appPublicCert')"
            >
              <template slot="uploadSlot" slot-scope="{loading}">
                <a-button style="marginTop:5px;"> <a-icon :type="loading ? 'loading' : 'upload'" /> {{ loading ? '正在上传' : '点击上传' }} </a-button>
              </template>
            </JeepayUpload>
          </a-form-model-item>
        </a-col>
        <a-col span="24">
          <a-form-model-item label="支付宝公钥证书（.crt格式）" prop="alipayPublicCert">
            <a-input v-model="ifParams.alipayPublicCert" disabled="disabled" />
            <JeepayUpload
              :action="action"
              :fileUrl="ifParams.alipayPublicCert"
              @uploadSuccess="uploadSuccess($event, 'alipayPublicCert')"
            >
              <template slot="uploadSlot" slot-scope="{loading}">
                <a-button style="marginTop:5px;"> <a-icon :type="loading ? 'loading' : 'upload'" /> {{ loading ? '正在上传' : '点击上传' }} </a-button>
              </template>
            </JeepayUpload>
          </a-form-model-item>
        </a-col>
        <a-col span="24">
          <a-form-model-item label="支付宝根证书（.crt格式）" prop="alipayRootCert">
            <a-input v-model="ifParams.alipayRootCert" disabled="disabled" />
            <JeepayUpload
              :action="action"
              :fileUrl="ifParams.alipayRootCert"
              @uploadSuccess="uploadSuccess($event, 'alipayRootCert')"
            >
              <template slot="uploadSlot" slot-scope="{loading}">
                <a-button style="marginTop:5px;"> <a-icon :type="loading ? 'loading' : 'upload'" /> {{ loading ? '正在上传' : '点击上传' }} </a-button>
              </template>
            </JeepayUpload>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row :gutter="16" v-else-if="mchType === 2">
        <a-col span="12">
          <a-form-model-item label="子商户app_auth_token" prop="appAuthToken">
            <a-input v-model="ifParams.appAuthToken" placeholder="请输入子商户app_auth_token" />
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
      isAdd: true,
      mchType: 1,
      action: upload.cert, // 上传文件地址
      saveObject: {}, // 保存的对象
      ifParams: {}, // 参数配置对象
      rules: {
        ifRate: [{ required: false, pattern: /^(([1-9]{1}\d{0,1})|(0{1}))(\.\d{1,4})?$/, message: '请输入0-100之间的数字，最多四位小数', trigger: 'blur' }]
      },
      ifParamsRules: {
        appId: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.mchType === 1 && !value) {
              callback(new Error('请输入应用AppID'))
            }
            callback()
         } }],
        privateKey: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.mchType === 1 && this.isAdd && !value) {
              callback(new Error('请输入应用私钥'))
            }
            callback()
        } }],
        alipayPublicKey: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.mchType === 1 && this.isAdd && this.ifParams.useCert === 0 && !value) {
              callback(new Error('请输入支付宝公钥'))
            }
            callback()
        } }],
        appPublicCert: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.mchType === 1 && this.ifParams.useCert === 1 && !this.ifParams.appPublicCert) {
              callback(new Error('请上传应用公钥证书（.crt格式）'))
            }
            callback()
        } }],
        alipayPublicCert: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.mchType === 1 && this.ifParams.useCert === 1 && !this.ifParams.alipayPublicCert) {
              callback(new Error('请上传支付宝公钥证书（.crt格式）'))
            }
            callback()
        } }],
        alipayRootCert: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.mchType === 1 && this.ifParams.useCert === 1 && !this.ifParams.alipayRootCert) {
              callback(new Error('请上传支付宝根证书（.crt格式）'))
            }
            callback()
        } }],
        appAuthToken: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.mchType === 2 && !value) {
              callback(new Error('请输入子商户app_auth_token'))
            }
            callback()
        } }]
      }
    }
  },
  methods: {
    // 弹层打开事件
    show: function (appId, record) {
      if (this.$refs.infoFormModel !== undefined) {
        this.$refs.infoFormModel.resetFields()
      }
      if (this.$refs.mchParamFormModel !== undefined) {
        this.$refs.mchParamFormModel.resetFields()
      }

      this.mchType = record.mchType

      // 数据初始化
      this.saveObject = {
        infoId: appId,
        ifCode: record.ifCode,
        state: record.ifConfigState === 0 ? 0 : 1
      }

      // 参数配置对象，数据初始化
      this.ifParams = {
        sandbox: 0,
        signType: 'RSA2',
        useCert: 0,
        privateKey: '',
        privateKey_ph: '请输入',
        alipayPublicKey: '',
        alipayPublicKey_ph: '请输入',
        appPublicCert: '',
        alipayPublicCert: '',
        alipayRootCert: ''
      }
      this.visible = true
      this.getMchPayConfig()
    },
    // 支付参数配置
    getMchPayConfig () {
      const that = this
      // 获取支付参数
      getMchPayConfigUnique(that.saveObject.infoId, that.saveObject.ifCode).then(res => {
        if (res && res.ifParams) {
          that.saveObject = res
          that.ifParams = JSON.parse(res.ifParams)

          that.ifParams.privateKey_ph = that.ifParams.privateKey
          that.ifParams.privateKey = ''

          that.ifParams.alipayPublicKey_ph = that.ifParams.alipayPublicKey
          that.ifParams.alipayPublicKey = ''

          that.isAdd = false
        } else if (res === undefined) {
          that.isAdd = true
        }
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
            that.clearEmptyKey('privateKey')
            that.clearEmptyKey('alipayPublicKey')
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
    // 脱敏数据为空时，删除对应key
    clearEmptyKey (key) {
      if (!this.ifParams[key]) {
        this.ifParams[key] = undefined
      }
      this.ifParams[key + '_ph'] = undefined
    },
    // 上传文件成功回调方法，参数value为文件地址，name是自定义参数
    uploadSuccess (value, name) {
      this.ifParams[name] = value
      this.$forceUpdate()
    },
    onClose () {
      this.visible = false
    }
  }
}
</script>
<style lang="less" scoped>
</style>
