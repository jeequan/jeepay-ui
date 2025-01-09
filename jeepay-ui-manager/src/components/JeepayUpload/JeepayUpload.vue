<template>
  <div>
    <a-upload
      v-model:fileList="vdata.fileList"
      name="file"
      :action="props.action"
      :headers="vdata.headers"
      :accept="props.accept"
      :showUploadList="false"
      :multiple="true"
      :before-upload="beforeUpload"
      @change="handleChange"
    >
      <slot name="uploadSlot" :loading="vdata.loading"></slot>
      <!-- <img v-if="fileUrl && type === 'image'" :src="fileUrl" />
      <a-input v-else-if="fileUrl && type === 'file'" :value="fileUrl" />
      <a-button style="marginLeft:5px;"> <a-icon :type="loading ? 'loading' : 'upload'" /> {{ loading ? '正在上传' : '点击上传' }} </a-button> -->
    </a-upload>
  </div>
</template>

<script setup lang="ts">
import appConfig from '@/config/appConfig'
import storage from '@/utils/jeepayStorageWrapper'
import { reactive, ref, getCurrentInstance } from 'vue'

const { $infoBox } = getCurrentInstance()!.appContext.config.globalProperties

function getHeaders() {
  const headers = {}
  headers[appConfig.ACCESS_TOKEN_NAME] = storage.getToken() // token
  return headers
}

const emit = defineEmits(['uploadSuccess'])

const props = defineProps({
  action: { type: String, default: '' },
  accept: { type: String, default: '' },
  size: { type: Number, default: 10 }, // 文件大小限制
  num: { type: Number, default: 1 }, // 文件数量限制
})

const vdata = reactive({
  loading: false, // 上传状态
  fileList: [],
  headers: getHeaders(), // 放入token
})

// 上传回调
function handleChange(info) {
  const res = info.file.response

  if (info.file.status === 'uploading') {
    vdata.loading = true
  }
  if (info.file.status === 'done') {
    if (res.code !== 0) {
      $infoBox.message.error(res.msg)
    }
    vdata.loading = false
    emit('uploadSuccess', res.data)
  } else if (info.file.status === 'error') {
    console.log(info)
    $infoBox.message.error(`上传失败`)
  }
}
// 上传图片前的校验
function beforeUpload(file) {
  const validate = file.size / 1024 / 1024 < props.size
  if (!validate) {
    $infoBox.message.error('文件应小于' + props.size + 'M!')
  }
  return validate
}
</script>
