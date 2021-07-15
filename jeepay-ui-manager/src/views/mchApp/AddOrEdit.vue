<template>
  <a-drawer
    :visible="visible"
    :title=" isAdd ? '新增应用' : '修改应用'"
    width="40%"
    :maskClosable="false"
    @close="onClose">

    <a-form-model ref="infoFormModel" :model="saveObject" layout="vertical" :rules="rules">

      <a-row :gutter="16">
        <a-col :span="12" v-if="!isAdd">
          <a-form-model-item label="应用 AppId" prop="appId">
            <a-input v-model="saveObject.appId" placeholder="请输入" :disabled="!isAdd" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="商户号" prop="mchNo">
            <a-input v-model="saveObject.mchNo" placeholder="请输入" :disabled="!isAdd" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="应用名称" prop="appName">
            <a-input v-model="saveObject.appName" placeholder="请输入" />
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
          <a-form-model-item label="私钥 AppSecret" prop="appSecret" >
            <a-input v-model="saveObject.appSecret" :placeholder="saveObject.appSecret_ph" type="textarea" />
            <a-button type="primary" ghost @click="randomKey(false, 128, 0)"><a-icon type="file-sync" />随机生成私钥</a-button>
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="备注" prop="remark">
            <a-input v-model="saveObject.remark" placeholder="请输入" />
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>

    <div class="drawer-btn-center">
      <a-button @click="onClose" icon="close" :style="{ marginRight: '8px' }">取消</a-button>
      <a-button type="primary" @click="onSubmit" icon="check" >保存</a-button>
    </div>

  </a-drawer>
</template>

<script>
import { API_URL_MCH_APP, req } from '@/api/manage'

export default {
  props: {
    callbackFunc: { type: Function, default: () => () => ({}) }
  },

  data () {
    return {
      isAdd: true, // 新增 or 修改
      visible: false, // 抽屉开关
      appId: '', // 应用AppId
      saveObject: {}, // 数据对象
      rules: {
        mchNo: [{ required: true, message: '请输入商户号', trigger: 'blur' }],
        appName: [{ required: true, message: '请输入应用名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 抽屉显示
    show (mchNo, appId) {
      this.isAdd = !appId
       // 数据清空
      this.saveObject = {
        'state': 1,
        'appSecret': '',
        'mchNo': mchNo,
        'appSecret_ph': '请输入'
      }

      if (this.$refs.infoFormModel !== undefined) {
        this.$refs.infoFormModel.resetFields()
      }

      const that = this
      that.rules.appSecret = []
      if (!this.isAdd) { // 修改信息 延迟展示弹层
        that.appId = appId
        // 拉取详情
        req.getById(API_URL_MCH_APP, appId).then(res => {
          that.saveObject = res
          that.saveObject.appSecret_ph = res.appSecret
          that.saveObject.appSecret = ''
        })

        this.visible = true
      } else {
        // 新增时，appSecret必填
        that.rules.appSecret.push({
          required: true,
          message: '请输入私钥或点击随机生成私钥',
          trigger: 'blur'
        })

        that.visible = true // 展示弹层信息
      }
    },
    // 表单提交
    onSubmit () {
      const that = this
      this.$refs.infoFormModel.validate(valid => {
        if (valid) { // 验证通过
          delete that.saveObject.appSecret_ph
          // 请求接口
          if (that.isAdd) {
            req.add(API_URL_MCH_APP, that.saveObject).then(res => {
              that.$message.success('新增成功')
              that.visible = false
              that.callbackFunc() // 刷新列表
            })
          } else {
            if (that.saveObject.appSecret === '') {
              delete that.saveObject.appSecret
            }
            req.updateById(API_URL_MCH_APP, that.appId, that.saveObject).then(res => {
              that.$message.success('修改成功')
              that.visible = false
              that.callbackFunc() // 刷新列表
            })
          }
        }
      })
    },
    randomKey: function (randomFlag, min, max) { // 生成随机128位私钥
      let str = ''
      let range = min
      const arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
      // 随机产生
      if (randomFlag) {
        range = Math.round(Math.random() * (max - min)) + min
      }
      for (var i = 0; i < range; i++) {
        var pos = Math.round(Math.random() * (arr.length - 1))
        str += arr[ pos ]
      }
      this.saveObject.appSecret = str
    },
    onClose () {
      this.visible = false
    }
  }
}
</script>

<style lang="less" scoped>
</style>
