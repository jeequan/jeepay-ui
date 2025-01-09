<template>
  <div style="background: #fff; padding: 0 20px">
    <a-tabs @change="selectTabs">
      <a-tab-pane key="applicationConfig" tab="应用配置">
        <div class="account-settings-info-view">
          <a-form ref="configFormModel">
            <a-row>
              <a-col :span="8" :offset="1" :key="config" v-for="(item, config) in vdata.configData">
                <a-form-item :label="item.configName">
                  <a-input
                    :type="item.type === 'text' ? 'text' : 'textarea'"
                    v-model:value="item.configVal"
                    autocomplete="off"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <div style="display: flex; justify-content: center">
              <a-form-item>
                <a-button type="primary" @click="confirm" :loading="vdata.btnLoading">
                  确认更新
                </a-button>
              </a-form-item>
            </div>
          </a-form>
        </div>
      </a-tab-pane>
      <!--<a-tab-pane key="" tab="···">-->
      <!--<div class="account-settings-info-view" style="height: 300px">-->
      <!--</div>-->
      <!--</a-tab-pane>-->
    </a-tabs>
  </div>
</template>
<script setup lang="ts">
import { API_URL_SYS_CONFIG, req, getConfigs } from '@/api/manage'
import { reactive, ref, getCurrentInstance } from 'vue'
const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const vdata: any = reactive({
  btnLoading: false,
  configData: {},
  groupKey: 'applicationConfig',
})

function detail() {
  // 获取基本信息
  getConfigs(vdata.groupKey).then((res) => {
    vdata.configData = res
    vdata.groupKey = res[0].groupKey
  })
}
detail()

function selectTabs(key) {
  // 清空必填提示
  if (key) {
    vdata.groupKey = key
    detail()
  }
}
function confirm(e) {
  // 确认更新
  $infoBox.confirmPrimary('确认修改应用配置吗？', '', () => {
    vdata.btnLoading = true // 打开按钮上的 loading
    const formData = new FormData()
    for (var i in vdata.configData) {
      formData.append(vdata.configData[i].configKey, vdata.configData[i].configVal)
    }
    req
      .updateById(API_URL_SYS_CONFIG, vdata.groupKey, formData)
      .then((res) => {
        $infoBox.message.success('修改成功')
      })
      .finally((res) => {
        vdata.btnLoading = false
      })
  })
}
</script>
