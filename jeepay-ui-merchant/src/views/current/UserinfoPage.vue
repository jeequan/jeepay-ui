<template>
  <div style="background: #fff">
    <a-tabs @change="selectTabs">
      <a-tab-pane key="1" tab="基本信息">
        <div class="account-settings-info-view">
          <a-row :gutter="16">
            <a-col :md="16" :lg="16">
              <a-form-model ref="infoFormModel" :model="saveObject" :label-col="{span: 9}" :wrapper-col="{span: 10}" :rules="rules">
                <a-form-model-item label="用户登录名:">
                  <a-input v-model="saveObject.loginUsername" disabled/>
                </a-form-model-item>
                <a-form-model-item label="用户姓名：" prop="realname">
                  <a-input v-model="saveObject.realname" />
                </a-form-model-item>
                <a-form-model-item label="手机号：" prop="telphone">
                  <a-input v-model="saveObject.telphone" disabled />
                </a-form-model-item>
                <a-form-model-item label="请选择性别：">
                  <a-radio-group v-model="saveObject.sex">
                    <a-radio :value="1">男</a-radio>
                    <a-radio :value="2">女</a-radio>
                  </a-radio-group>
                </a-form-model-item>
              </a-form-model>
              <a-form-item style="display:flex;justify-content:center">
                <a-button type="primary" @click="changeInfo" icon="check-circle" :loading="btnLoading">更新基本信息</a-button>
              </a-form-item>
            </a-col>
            <a-col :md="8" :lg="8" :style="{ minHeight: '180px',margin:'0 auto' }">
              <!-- 原始头像上传，带有图片裁剪
                <div class="ant-upload-preview" @click="$refs.modal.edit(1)" >
                <a-icon type="cloud-upload-o" class="upload-icon"/>
                <div class="mask">
                  <a-icon type="plus" />
                </div>
                <img :src="saveObject.avatarUrl"/>
              </div> -->
              <div class="ant-upload-preview" >
                <img :src="saveObject.avatarUrl" style="border: 1px solid rgba(0,0,0,0.08)"/>
                <JeepayUpload
                  style="margin-top:10px"
                  :action="action"
                  accept=".jpg, .jpeg, .png"
                  @uploadSuccess="uploadSuccess($event, '')"
                >
                  <template slot="uploadSlot" slot-scope="{loading}">
                    <a-button style="marginLeft:5px;"> <a-icon :type="loading ? 'loading' : 'upload'" /> {{ loading ? '正在上传' : '更换头像' }} </a-button>
                  </template>
                </JeepayUpload>
              </div>
            </a-col>

          </a-row>
          <avatar-modal ref="modal" @ok="setavatar"/>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="安全信息">
        <div class="account-settings-info-view">
          <a-row :gutter="16">
            <a-col :md="16" :lg="16">
              <a-form-model ref="pwdFormModel" :model="updateObject" :label-col="{span: 9}" :wrapper-col="{span: 10}" :rules="rulesPass">
                <a-form-model-item label="原密码：" prop="originalPwd">
                  <a-input-password v-model="updateObject.originalPwd" placeholder="请输入原密码" />
                </a-form-model-item>
                <a-form-model-item label="新密码：" prop="newPwd">
                  <a-input-password v-model="updateObject.newPwd" placeholder="请输入新密码" />
                </a-form-model-item>
                <a-form-model-item label="确认新密码：" prop="confirmPwd">
                  <a-input-password v-model="updateObject.confirmPwd" placeholder="确认新密码" />
                </a-form-model-item>
              </a-form-model>
              <a-form-item style="display:flex;justify-content:center">
                <a-button type="primary" icon="safety-certificate" @click="confirm" :loading="btnLoading">更新密码</a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
import JeepayUpload from '@/components/JeepayUpload/JeepayUpload'
import { getInfo } from '@/api/login'
import { Base64 } from 'js-base64'
import { updateUserInfo, updateUserPass, getUserInfo, upload } from '@/api/manage'
import AvatarModal from './AvatarModal'
import store from '@/store'
export default {
  components: {
    AvatarModal, JeepayUpload
  },
  data () {
    return {
      action: upload.avatar, // 上传图标地址
      btnLoading: false,
      saveObject: {
        loginUsername: '', // 登录名
        realname: '', //  真实姓名
        sex: '',
        avatarUrl: '' // 头像地址
      },
      updateObject: {
        originalPwd: '', // 原密码
        newPwd: '', //  新密码
        confirmPwd: '' //  确认密码
      },
      recordId: store.state.user.userId, // 拿到ID
      rules: {
        realname: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }]
      },
      rulesPass: {
        originalPwd: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
        newPwd: [{ min: 6, max: 12, required: true, message: '请输入6-12位新密码', trigger: 'blur' }],
        confirmPwd: [{ required: true, message: '请输入确认新密码', trigger: 'blur' }, {
          validator: (rule, value, callBack) => {
            this.updateObject.newPwd === value ? callBack() : callBack('新密码与确认密码不一致')
          }
        }]
      }

    }
  },
  created () {
    this.detail()
  },
  methods: {
    setavatar (url) {
      this.option.img = url
    },
    detail () { // 获取基本信息
      const that = this
      getUserInfo().then(res => {
        that.saveObject = res
      })
    },
    changeInfo () { // 更新基本信息事件
      const that = this
        this.$refs.infoFormModel.validate(valid => {
          if (valid) { // 验证通过
            this.$infoBox.confirmPrimary('确认更新信息吗？', '', () => {
            // 请求接口
            that.btnLoading = true // 打开按钮上的 loading
              updateUserInfo(that.saveObject).then(res => {
                that.btnLoading = true // 打开按钮上的 loading
                return getInfo()
              })
              .then(bizData => {
                bizData.avatarUrl = that.saveObject.avatarUrl
                bizData.realname = that.saveObject.realname
                that.btnLoading = false
                store.commit('SET_USER_INFO', bizData) // 调用vuex设置用户基本信息
                that.$message.success('修改成功')
                console.log('cg')
              }).catch(err => {
                console.log(err)
                that.btnLoading = false // 打开按钮上的 loading
              })
            })
          }
        })
    },
    confirm (e) { // 确认更新密码
      const that = this
        this.$refs.pwdFormModel.validate(valid => {
          if (valid) { // 验证通过
            this.$infoBox.confirmPrimary('确认更新密码吗？', '', () => {
              // 请求接口
              that.btnLoading = true // 打开按钮上的 loading
              that.confirmLoading = true // 显示loading
              that.updateObject.recordId = that.recordId // 用户ID
              that.updateObject.originalPwd = Base64.encode(that.updateObject.originalPwd)
              that.updateObject.confirmPwd = Base64.encode(that.updateObject.confirmPwd)
              this.$delete(this.updateObject, 'newPwd')
              updateUserPass(that.updateObject).then(res => {
                that.$message.success('修改成功')
                // 退出登录
                this.$store.dispatch('Logout').then(() => {
                  this.$router.push({ name: 'login' })
                })
              }).catch(res => {
                that.confirmLoading = false
                that.btnLoading = false
              })
            })
          }
        })
    },
    selectTabs () { // 清空必填提示
      if (this.$refs.pwdFormModel !== undefined) {
        this.$refs.pwdFormModel.resetFields()
      }
    },
    uploadSuccess (value, name) {
      this.saveObject.avatarUrl = value
      this.$forceUpdate()
    }
  }
}

</script>
<style lang="less" scoped>

  .avatar-upload-wrapper {
    height: 200px;
    width: 100%;
  }

  .ant-upload-preview {
    text-align:center ;
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
      background: rgba(0,0,0,0.4);
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

    img, .mask {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      overflow: hidden;
    }
  }
</style>
