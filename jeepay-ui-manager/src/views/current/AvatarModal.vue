<template>
  <a-modal
    title="修改头像"
    v-model:open="vdata.visible"
    :maskClosable="false"
    :confirmLoading="vdata.confirmLoading"
    :width="800"
    :footer="null"
    @cancel="cancelHandel"
  >
    <a-row>
      <a-col :xs="24" :md="12" :style="{ height: '350px' }">
        <vue-cropper
          ref="cropper"
          :img="vdata.options.img"
          :info="true"
          :autoCrop="vdata.options.autoCrop"
          :autoCropWidth="vdata.options.autoCropWidth"
          :autoCropHeight="vdata.options.autoCropHeight"
          :fixedBox="vdata.options.fixedBox"
          @realTime="realTime"
        ></vue-cropper>
      </a-col>
      <a-col :xs="24" :md="12" :style="{ height: '350px' }">
        <div class="avatar-upload-preview">
          <img :src="vdata.previews.url" :style="vdata.previews.img" />
        </div>
      </a-col>
    </a-row>
    <br />
    <a-row>
      <a-col :lg="2" :md="2">
        <a-upload name="file" :beforeUpload="beforeUpload" :showUploadList="false">
          <a-button icon="upload">选择图片</a-button>
        </a-upload>
      </a-col>
      <a-col :lg="{ span: 1, offset: 2 }" :md="2">
        <a-button icon="plus" @click="changeScale(1)" />
      </a-col>
      <a-col :lg="{ span: 1, offset: 1 }" :md="2">
        <a-button icon="minus" @click="changeScale(-1)" />
      </a-col>
      <a-col :lg="{ span: 1, offset: 1 }" :md="2">
        <a-button icon="undo" @click="rotateLeft" />
      </a-col>
      <a-col :lg="{ span: 1, offset: 1 }" :md="2">
        <a-button icon="redo" @click="rotateRight" />
      </a-col>
      <a-col :lg="{ span: 2, offset: 6 }" :md="2">
        <a-button type="primary" @click="finish('blob')">保存</a-button>
      </a-col>
    </a-row>
  </a-modal>
</template>
<script setup lang="ts">
import { upload, updateUserInfo } from '@/api/manage'

import { useUserStore } from '@/store/modules/user'
import { reactive, ref, getCurrentInstance } from 'vue'
const { $infoBox, $access, $hasAgentEnt } = getCurrentInstance()!.appContext.config.globalProperties

const store = useUserStore()

const vdata: any = reactive({
  recordId: store.userInfo.sysUserId, // 拿到ID
  userLoad: upload.icon, // 图片上传地址
  visible: false,
  id: null,
  confirmLoading: false,
  fileList: [],
  uploading: false,
  options: {
    // img: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    img: '',
    autoCrop: true,
    autoCropWidth: 200,
    autoCropHeight: 200,
    fixedBox: true,
  },
  previews: {},
})

const emit = defineEmits(['ok'])

const cropper = ref()

function edit(id) {
  vdata.visible = true
  vdata.id = id
  /* 获取原始头像 */
}
function close() {
  vdata.id = null
  vdata.visible = false
}
function cancelHandel() {
  close()
}
function changeScale(num) {
  num = num || 1
  cropper.value.changeScale(num)
}
function rotateLeft() {
  cropper.value.rotateLeft()
}
function rotateRight() {
  cropper.value.rotateRight()
}
function beforeUpload(file) {
  const reader = new FileReader()
  // 把Array Buffer转化为blob 如果是base64不需要
  // 转化为base64
  reader.readAsDataURL(file)
  reader.onload = () => {
    vdata.options.img = reader.result
  }
  // 转化为blob
  // reader.readAsArrayBuffer(file)

  return false
}

// 上传图片（点击上传按钮）
function finish(type) {
  console.log('finish')

  // 通过FormData构造函数创建一个空对象
  const formData = new FormData()
  // 输出
  if (type === 'blob') {
    cropper.value.getCropBlob((data) => {
      // 通过该方法可以获取当前文件的一个内存URL
      const img = window.URL.createObjectURL(data)
      vdata.model = true
      vdata.modelSrc = img
      formData.append('avatarUrl', img)
      // this.$http.post('https://www.mocky.io/v2/5cc8019d300000980a055e76', formData, { contentType: false, processData: false, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      updateUserInfo(formData)
        // .then(res => {
        //     console.log(res)
        // }).catch(err => {
        //     console.log(err)
        // })
        .then((response) => {
          console.log('upload response:', response)
          // var res = response.data
          // if (response.status === 'done') {
          //   _this.imgFile = ''
          //   _this.headImg = res.realPathList[0] // 完整路径
          //   _this.uploadImgRelaPath = res.relaPathList[0] // 非完整路径
          //   _this.$message.success('上传成功')
          //   this.visible = false
          // }
          $infoBox.message.success('上传成功')
          emit('ok', response.url)
          vdata.visible = false
        })
        .catch((err) => {
          console.log(err)
        })
      console.log(vdata.userLoad, vdata.recordId, vdata.modelSrc)
    })
  } else {
    cropper.value.getCropData((data) => {
      vdata.model = true
      vdata.modelSrc = data
    })
  }
}
function okHandel() {
  vdata.confirmLoading = true
  setTimeout(() => {
    vdata.confirmLoading = false
    close()
    $infoBox.message.success('上传头像成功')
  }, 2000)
}

function realTime(data) {
  vdata.previews = data
}
</script>

<style lang="less" scoped>
.avatar-upload-preview {
  position: absolute;
  top: 50%;
  transform: translate(50%, -50%);
  width: 180px;
  height: 180px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>
