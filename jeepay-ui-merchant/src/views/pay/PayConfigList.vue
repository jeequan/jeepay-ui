<template>
  <page-header-wrapper>
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
            <a v-if="$access('ENT_MCH_PAY_CONFIG_ADD')" @click="editPayIfConfigFunc(record)">填写参数 <a-icon key="right" type="right" style="fontSize: 13px"></a-icon></a>
            <a v-else>暂无操作</a>
          </div>
        </div>
      </div>
    </JeepayCard>
    <a-drawer
      title="支付参数配置"
      width="40%"
      :closable="true"
      :visible="visible"
      @close="onChildrenDrawerClose"
      :maskClosable="false"
    >
      <a-form-model ref="infoFormModel" :model="saveObject" layout="vertical" :rules="rules">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item label="接口费率" prop="ifRate">
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
              <a-input v-model="ifParams[item.name]" placeholder="请输入" :type="item.type" />
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
        <a-button @click="onChildrenDrawerClose" :style="{ marginRight: '8px' }" icon="close">取消</a-button>
        <a-button type="primary" @click="onSubmit" icon="check" :loading="btnLoading">保存</a-button>
      </div>
    </a-drawer>

  </page-header-wrapper>
</template>

<script>
import JeepayCard from '@/components/JeepayCard/JeepayCard'
import JeepayUpload from '@/components/JeepayUpload/JeepayUpload'
import { API_URL_MCH_PAYCONFIGS_LIST, getMcgPayConfigUnique, req, upload } from '@/api/manage'

export default {
  components: {
    JeepayCard,
    JeepayUpload
  },
  data () {
    return {
      btnLoading: false,
      action: upload.cert, // 上传文件地址
      visible: false, // 抽屉开关
      mchParams: {}, // 支付接口定义描述
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
  methods: {
    // 动态生成支付参数表单检验规则
    generoterRules () {
      const rules = {}
      let newItems = []
      this.mchParams.forEach(item => {
        newItems = []
        if (item.verify === 'required') {
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
    // 请求支付接口定义数据
    reqCardListFunc () {
      return req.list(API_URL_MCH_PAYCONFIGS_LIST)
    },
    // 刷新card列表
    refCardList () {
      this.$refs.infoCard.refCardList()
    },
    // 支付参数配置
    editPayIfConfigFunc (record) {
      if (!record) {
        return
      }
      if (record.subMchIsvConfig === 0) {
        this.$error({
          title: '提示',
          content: '当前商户为特约商户，请先配置服务商支付参数！'
        })
        return
      }

      this.saveObject = {} // 要保存的对象
      this.ifParams = {} // 参数配置对象
      this.mchParams = {} // 支付接口定义描述
      this.saveObject.ifCode = record.ifCode
      this.saveObject.state = record.ifConfigState === 0 ? 0 : 1

      const that = this
      // 获取支付参数
      getMcgPayConfigUnique(that.saveObject.ifCode).then(res => {
        if (res && res.ifParams) {
          that.saveObject = res
          that.ifParams = JSON.parse(res.ifParams)
        }
      })

      const newItems = [] // 重新加载支付接口配置定义描述json
      let radioItems = [] // 存放单选框value title
      const mchParams = record.mchParams // 根据商户类型获取接口定义描述
      JSON.parse(mchParams).forEach(item => {
        radioItems = []
        if (item.type === 'radio') {
          const valueItems = item.values.split(',')
          const titleItems = item.titles.split(',')
          for (const i in valueItems) {
            radioItems.push({
              value: valueItems[i],
              title: titleItems[i]
            })
          }
        }
        newItems.push({
          name: item.name,
          desc: item.desc,
          type: item.type,
          verify: item.verify,
          values: radioItems
        })
      })

      that.mchParams = newItems // 重新赋值接口定义描述
      that.visible = true // 打开支付参数配置抽屉
      that.generoterRules()
    },
    // 表单提交
    onSubmit () {
      const that = this
      this.$refs.infoFormModel.validate(valid => {
        this.$refs.mchParamFormModel.validate(valid2 => {
          if (valid && valid2) { // 验证通过
            that.btnLoading = true
            const reqParams = {}
            reqParams.ifCode = that.saveObject.ifCode
            reqParams.ifRate = that.saveObject.ifRate
            reqParams.state = that.saveObject.state
            reqParams.remark = that.saveObject.remark
            // 支付参数配置不能为空
            if (Object.keys(that.ifParams).length === 0) {
              this.$message.error('参数不能为空！')
              return
            }
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
              that.refCardList()
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
    onChildrenDrawerClose () {
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
