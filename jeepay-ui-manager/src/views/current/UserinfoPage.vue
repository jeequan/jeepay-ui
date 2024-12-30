<template>
  <div style="background: #fff; border-radius: 10px; padding: 0 20px 20px">
    <a-tabs @change="selectTabs">
      <a-tab-pane key="1" tab="基本信息">
        <div class="account-settings-info-view">
          <a-row :gutter="16">
            <a-col :md="16" :lg="16">
              <a-form
                ref="infoFormModel"
                :model="vdata.saveObject"
                :label-col="{ span: 9 }"
                :wrapper-col="{ span: 10 }"
                :rules="vdata.rules"
              >
                <a-form-item label="用户登录名:">
                  <a-input v-model:value="vdata.saveObject.loginUsername" disabled />
                </a-form-item>
                <a-form-item label="用户姓名：" name="realname">
                  <a-input v-model:value="vdata.saveObject.realname" />
                </a-form-item>
                <a-form-item label="手机号：" name="telphone">
                  <a-input v-model:value="vdata.saveObject.telphone" disabled />
                </a-form-item>
                <a-form-item label="请选择性别：">
                  <a-radio-group v-model:value="vdata.saveObject.sex">
                    <a-radio :value="1">男</a-radio>
                    <a-radio :value="2">女</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-form>
              <div style="display: flex; justify-content: center">
                <a-button type="primary" @click="changeInfo" :loading="vdata.btnLoading">
                  更新基本信息
                </a-button>
              </div>
            </a-col>
            <a-col :md="8" :lg="8" :style="{ minHeight: '180px', margin: '0 auto' }">
              <!-- 原始的头像上传，带有图片裁剪功能 -->
              <!-- <div class="ant-upload-preview" @click="$refs.modal.edit(1)" > -->
              <div class="ant-upload-preview">
                <!-- <a-icon type="cloud-upload-o" class="upload-icon"/> -->
                <!-- <div class="mask">
                  <a-icon type="plus" />
                </div> -->
                <img
                  :src="vdata.saveObject.avatarUrl"
                  style="border: 1px solid rgba(0, 0, 0, 0.08)"
                />
                <JeepayUpload
                  style="margin-top: 10px"
                  :action="vdata.action"
                  accept=".jpg, .jpeg, .png"
                  @uploadSuccess="uploadSuccess($event, '')"
                >
                  <template #uploadSlot="{ loading }">
                    <a-button style="margin-left: 5px">
                      <a-icon :type="vdata.loading ? 'loading' : 'upload'" />
                      {{ vdata.loading ? '正在上传' : '更换头像' }}
                    </a-button>
                  </template>
                </JeepayUpload>
              </div>
            </a-col>
          </a-row>
          <!-- 图片裁剪组件 <avatar-modal ref="modal" @ok="setavatar"/> -->
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="安全信息">
        <div class="account-settings-info-view">
          <a-row :gutter="16">
            <a-col :md="16" :lg="16">
              <a-form
                ref="pwdFormModel"
                :model="vdata.updateObject"
                :label-col="{ span: 9 }"
                :wrapper-col="{ span: 10 }"
                :rules="vdata.rulesPass"
              >
                <a-form-item label="原密码：" name="originalPwd">
                  <a-input-password
                    autocomplete="new-password"
                    v-model:value="vdata.updateObject.originalPwd"
                    placeholder="请输入原密码"
                  />
                </a-form-item>
                <a-form-item label="新密码：" name="newPwd">
                  <a-input-password
                    autocomplete="new-password"
                    v-model:value="vdata.updateObject.newPwd"
                    placeholder="请输入新密码"
                  />
                </a-form-item>
                <a-form-item label="确认新密码：" name="confirmPwd">
                  <a-input-password
                    autocomplete="new-password"
                    v-model:value="vdata.updateObject.confirmPwd"
                    placeholder="确认新密码"
                  />
                </a-form-item>
              </a-form>
              <div style="display: flex; justify-content: center">
                <a-button type="primary" @click="confirm" :loading="vdata.btnLoading">
                  更新密码
                </a-button>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup lang="ts">
import { getUserInfo, updateUserInfo, updateUserPass, upload } from '@/api/manage'
import { useUserStore } from '@/store/modules/user'
import { getInfo } from '@/api/login'
import { Base64 } from 'js-base64'
import { reactive, ref, getCurrentInstance } from 'vue'

const { $infoBox, $access, $hasAgentEnt } = getCurrentInstance()!.appContext.config.globalProperties

const store = useUserStore()
const vdata: any = reactive({
  action: upload.avatar, // 上传图标地址
  btnLoading: false,
  saveObject: {
    loginUsername: '', // 登录名
    realname: '', //  真实姓名
    telphone: '',
    sex: '',
    avatarUrl: '', // 用户头像
  },
  // avatarUrl: store.state.user.avatarImgPath,
  updateObject: {
    originalPwd: '', // 原密码
    newPwd: '', //  新密码
    confirmPwd: '', //  确认密码
  },
  recordId: store.userInfo.sysUserId, // 拿到ID
  rules: {
    realname: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  },
  rulesPass: {
    originalPwd: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
    newPwd: [{ min: 6, max: 12, required: true, message: '请输入6-12位新密码', trigger: 'blur' }],
    confirmPwd: [
      { required: true, message: '请确认输入新密码', trigger: 'blur' },
      {
        validator: (rule, value) => {
          if (vdata.updateObject.newPwd === value) {
            return Promise.resolve()
          } else {
            return Promise.reject('新密码与确认密码不一致')
          }
        },
      },
    ],
  },
})

const infoFormModel = ref()
const pwdFormModel = ref()

// this.detail()
function setavatar(url) {
  vdata.option.img = url
}
function detail() {
  // 获取基本信息
  getUserInfo().then((res) => {
    vdata.saveObject = res
    console.log(res)
  })
}

detail()

function changeInfo() {
  // 更新基本信息事件
  infoFormModel.value.validate().then((valid) => {
    if (valid) {
      // 验证通过
      $infoBox.confirmPrimary('确认更新信息吗？', '', () => {
        vdata.btnLoading = true // 打开按钮上的 loading
        // that.$store.commit('showLoading') // 关闭全局刷新
        // 请求接口
        updateUserInfo(vdata.saveObject)
          .then((res) => {
            vdata.btnLoading = false // 关闭按钮刷新
            // that.$store.commit('hideLoading') // 关闭全局刷新
            return getInfo()
          })
          .then((bizData) => {
            console.log(bizData, 'bizData')
            bizData.avatarUrl = vdata.saveObject.avatarUrl
            bizData.realname = vdata.saveObject.realname
            // store.commit('SET_USER_INFO', bizData) // 调用vuex设置用户基本信息
            $infoBox.message.success('修改成功')
          })
          .catch((err) => {
            // that.$store.commit('hideLoading') // 关闭全局刷新
            vdata.btnLoading = false
            console.log(err)
            $infoBox.message.error('修改失败')
          })
      })
    }
  })
}
function confirm(e) {
  // 确认更新密码
  pwdFormModel.value.validate().then((valid) => {
    if (valid) {
      // 验证通过
      $infoBox.confirmPrimary('确认更新密码吗？', '', () => {
        // 请求接口
        vdata.btnLoading = true // 打开按钮上的 loading
        vdata.confirmLoading = true // 显示loading
        vdata.updateObject.recordId = vdata.recordId // 用户ID
        vdata.updateObject.originalPwd = Base64.encode(vdata.updateObject.originalPwd)
        vdata.updateObject.confirmPwd = Base64.encode(vdata.updateObject.confirmPwd)
        // this.$delete(this.updateObject, 'newPwd')

        vdata.updateObject.newPwd = ''

        updateUserPass(vdata.updateObject)
          .then((res) => {
            $infoBox.message.success('修改成功, 即将重新登录')

            setTimeout(() => {
              // 退出登录
              store.logout()
            }, 1000)
          })
          .catch((res) => {
            vdata.confirmLoading = false
            vdata.btnLoading = false
          })
      })
    }
  })
}
function selectTabs() {
  // 清空必填提示
  vdata.updateObject.originalPwd = ''
  vdata.updateObject.newPwd = ''
  vdata.updateObject.confirmPwd = ''
}
// 上传文件成功回调方法，参数value为文件地址，name是自定义参数
function uploadSuccess(value, name) {
  vdata.saveObject.avatarUrl = value
  // this.$forceUpdate()
}
</script>
<style lang="less" scoped>
.avatar-upload-wrapper {
  height: 200px;
  width: 100%;
}

.ant-upload-preview {
  text-align: center;
  position: relative;
  margin: 0 auto;
  width: 100%;
  // max-width: 180px;
  border-radius: 50%;
  // box-shadow: 0 0 4px #ccc;

  .upload-icon {
    position: absolute;
    top: 0;
    right: 10px;
    font-size: 1.4rem;
    padding: 0.5rem;
    background: rgba(222, 221, 221, 0.7);
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }
  .mask {
    opacity: 0;
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
    cursor: pointer;
    transition: opacity 0.4s;

    &:hover {
      opacity: 1;
    }

    i {
      font-size: 2rem;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -1rem;
      margin-top: -1rem;
      color: #d6d6d6;
    }
  }

  img,
  .mask {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>
