<template>
  <div style="background: #fff">
    <a-tabs
      @change="selectTabs"
    >
      <a-tab-pane key="applicationConfig" tab="应用配置">
        <div class="account-settings-info-view">
          <a-form-model
            ref="configFormModel"
          >
            <a-row>
              <a-col :span="8" :offset="1" :key="config" v-for="(item, config) in configData">
                <a-form-model-item :label="item.configName">
                  <a-input :type="item.type==='text'?'text':'textarea'" v-model="item.configVal" autocomplete="off" />
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-form-item style="display:flex;justify-content:center">
              <a-button type="primary" icon="check-circle" @click="confirm" :loading="btnLoading">确认更新</a-button>
            </a-form-item>
          </a-form-model>
        </div>
      </a-tab-pane>
      <!--<a-tab-pane key="" tab="···">-->
      <!--<div class="account-settings-info-view" style="height: 300px">-->
      <!--</div>-->
      <!--</a-tab-pane>-->
    </a-tabs>
  </div>
</template>
<script>
import { API_URL_SYS_CONFIG, req, getConfigs } from '@/api/manage'

  export default {
  components: {
  },
  data () {
    return {
      btnLoading: false,
      configData: {},
      groupKey: 'applicationConfig'
    }
  },
  created () {
    this.detail()
  },
  methods: {
    detail () { // 获取基本信息
      const that = this
      getConfigs(that.groupKey).then(res => {
        that.configData = res
        that.groupKey = res[0].groupKey
      })
    },
    selectTabs (key) { // 清空必填提示
      if (key) {
        this.groupKey = key
        this.detail()
      }
    },
    confirm (e) { // 确认更新
      const that = this
      this.$infoBox.confirmPrimary('确认修改应用配置吗？', '', () => {
        that.btnLoading = true // 打开按钮上的 loading
        const formData = new FormData()
        for (var i in that.configData) {
          formData.append(that.configData[i].configKey, that.configData[i].configVal)
        }
        req.updateById(API_URL_SYS_CONFIG, that.groupKey, formData).then(res => {
          that.$message.success('修改成功')
          that.btnLoading = false
        }).catch(res => {
          that.btnLoading = false
        })
      })
    }
  }
}
</script>
