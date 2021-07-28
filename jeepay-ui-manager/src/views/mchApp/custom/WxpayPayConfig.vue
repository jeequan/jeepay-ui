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
          <a-form-model-item label="微信支付商户号" prop="mchId">
            <a-input v-model="ifParams.mchId" placeholder="请输入" />
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="应用AppID" prop="appId">
            <a-input v-model="ifParams.appId" placeholder="请输入" />
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="应用AppSecret" prop="appSecret">
            <a-input v-model="ifParams.appSecret" :placeholder="ifParams.appSecret_ph" />
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="oauth2地址（置空将使用官方）" prop="oauth2Url">
            <a-input v-model="ifParams.oauth2Url" placeholder="请输入" />
          </a-form-model-item>
        </a-col>
        <a-col span="24">
          <a-form-model-item label="API密钥" prop="key">
            <a-input v-model="ifParams.key" :placeholder="ifParams.key_ph" type="textarea" />
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="微信支付API版本" prop="apiVersion">
            <a-radio-group v-model="ifParams.apiVersion" defaultValue="V2">
              <a-radio value="V2">V2</a-radio>
              <a-radio value="V3">V3</a-radio>
            </a-radio-group>
          </a-form-model-item>
        </a-col>
        <a-col span="24">
          <a-form-model-item label="API V3秘钥" prop="apiV3Key">
            <a-input v-model="ifParams.apiV3Key" :placeholder="ifParams.apiV3Key_ph" type="textarea" />
          </a-form-model-item>
        </a-col>
        <a-col span="24">
          <a-form-model-item label="序列号" prop="serialNo">
            <a-input v-model="ifParams.serialNo" :placeholder="ifParams.serialNo_ph" type="textarea" />
          </a-form-model-item>
        </a-col>
        <a-col span="24">
          <a-form-model-item label="API证书(.p12格式)" prop="cert">
            <a-input v-model="ifParams.cert" disabled="disabled" />
            <JeepayUpload
              :action="action"
              :fileUrl="ifParams.cert"
              @uploadSuccess="uploadSuccess($event, 'cert')"
            >
              <template slot="uploadSlot" slot-scope="{loading}">
                <a-button style="marginTop:5px;"> <a-icon :type="loading ? 'loading' : 'upload'" /> {{ loading ? '正在上传' : '点击上传' }} </a-button>
              </template>
            </JeepayUpload>
          </a-form-model-item>
        </a-col>
        <a-col span="24">
          <a-form-model-item label="私钥文件(.pem格式)" prop="apiClientKey">
            <a-input v-model="ifParams.apiClientKey" disabled="disabled" />
            <JeepayUpload
              :action="action"
              :fileUrl="ifParams.apiClientKey"
              @uploadSuccess="uploadSuccess($event, 'apiClientKey')"
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
          <a-form-model-item label="子商户ID" prop="subMchId">
            <a-input v-model="ifParams.subMchId" placeholder="请输入" />
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="子账户appID(线上支付必填)" prop="subMchAppId">
            <a-input v-model="ifParams.subMchAppId" placeholder="请输入" />
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
      ifParams: { apiVersion: 'V2' }, // 参数配置对象
      rules: {
        ifRate: [{ required: false, pattern: /^(([1-9]{1}\d{0,1})|(0{1}))(\.\d{1,4})?$/, message: '请输入0-100之间的数字，最多四位小数', trigger: 'blur' }]
      },
      ifParamsRules: {
        mchId: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.mchType === 1 && !value) {
              callback(new Error('请输入微信支付商户号'))
            }
            callback()
         } }],
         appId: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.mchType === 1 && !value) {
              callback(new Error('请输入应用AppID'))
            }
            callback()
         } }],
        appSecret: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.isAdd && this.mchType === 1 && !value) {
              callback(new Error('请输入应用AppSecret'))
            }
            callback()
        } }],
        key: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.ifParams.apiVersion === 'V2' && this.isAdd && this.mchType === 1 && !value) {
              callback(new Error('请输入API密钥'))
            }
            callback()
        } }],
        apiV3Key: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.ifParams.apiVersion === 'V3' && this.isAdd && this.mchType === 1 && !value) {
              callback(new Error('请输入API V3秘钥'))
            }
            callback()
        } }],
        serialNo: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.ifParams.apiVersion === 'V3' && this.isAdd && this.mchType === 1 && !value) {
              callback(new Error('请输入序列号'))
            }
            callback()
        } }],
        apiClientKey: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.ifParams.apiVersion === 'V3' && this.mchType === 1 && !this.ifParams.apiClientKey) {
              callback(new Error('请上传私钥文件'))
            }
            callback()
        } }],
        subMchId: [{ trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.mchType === 2 && !value) {
              callback(new Error('请输入子商户ID'))
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
        apiVersion: 'V2',
        appSecret: '',
        appSecret_ph: '请输入',
        key: '',
        key_ph: '请输入',
        apiV3Key: '',
        apiV3Key_ph: '请输入',
        serialNo: '',
        serialNo_ph: '请输入'
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

          that.ifParams.appSecret_ph = that.ifParams.appSecret
          that.ifParams.appSecret = ''

          that.ifParams.key_ph = that.ifParams.key
          that.ifParams.key = ''

          that.ifParams.apiV3Key_ph = that.ifParams.apiV3Key
          that.ifParams.apiV3Key = ''

          that.ifParams.serialNo_ph = that.ifParams.serialNo
          that.ifParams.serialNo = ''

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
            that.clearEmptyKey('appSecret')
            that.clearEmptyKey('key')
            that.clearEmptyKey('apiV3Key')
            that.clearEmptyKey('serialNo')
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
