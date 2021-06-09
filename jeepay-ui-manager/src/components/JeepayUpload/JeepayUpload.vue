<template>
  <div>
    <a-upload
      name="file"
      :action="action"
      :headers="headers"
      :accept="accept"
      :showUploadList="false"
      :multiple="true"
      :before-upload="beforeUpload"
      @change="handleChange"
    >
      <slot name="uploadSlot" :loading="loading"></slot>
      <!-- <img v-if="fileUrl && type === 'image'" :src="fileUrl" />
      <a-input v-else-if="fileUrl && type === 'file'" :value="fileUrl" />
      <a-button style="marginLeft:5px;"> <a-icon :type="loading ? 'loading' : 'upload'" /> {{ loading ? '正在上传' : '点击上传' }} </a-button> -->
    </a-upload>
  </div>
</template>

<script>
import appConfig from '@/config/appConfig'
import storage from '@/utils/jeepayStorageWrapper'

function getHeaders () {
  const headers = {}
  headers[appConfig.ACCESS_TOKEN_NAME] = storage.getToken() // token
  return headers
}

export default {
  name: 'JeepayUpload',
  props: {
    action: { type: String, default: '' },
    accept: { type: String, default: '' },
    size: { type: Number, default: 10 }, // 文件大小限制
    num: { type: Number, default: 1 } // 文件数量限制
  },
  data () {
    return {
      loading: false, // 上传状态
      fileList: [],
      headers: getHeaders() // 放入token
    }
  },
  created () {
  },
  methods: {
    // 上传回调
    handleChange (info) {
       // 限制文件数量
      /* let fileList = [...info.fileList]
      fileList = fileList.length > this.num ? fileList.splice(0 - this.num) : fileList // 取最新加入的元素
      fileList = fileList.map(file => {
        if (file.response) {
          file.url = file.response.data
        }
        return file
      }) */
      const res = info.file.response

      if (info.file.status === 'uploading') {
        this.loading = true
      }
      if (info.file.status === 'done') {
        if (res.code !== 0) {
          this.$message.error(res.msg)
        }
        this.loading = false
        this.$emit('uploadSuccess', res.data)
      } else if (info.file.status === 'error') {
        console.log(info)
        this.$message.error(`上传失败`)
      }
    },
    // 上传图片前的校验
    beforeUpload (file) {
      const validate = file.size / 1024 / 1024 < this.size
      if (!validate) {
        this.$message.error('文件应小于' + this.size + 'M!')
      }
      return validate
    }
  }
}
</script>
