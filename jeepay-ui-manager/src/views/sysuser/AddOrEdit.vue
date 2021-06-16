<template>
  <a-drawer
    :title=" isAdd ? '新增操作员' : '修改操作员' "
    placement="right"
    :closable="true"
    @ok="handleOkFunc"
    :visible="isShow"
    width="600"
    @close="onClose"
    :maskClosable="false"
  >
    <!-- <a-modal :confirmLoading="confirmLoading"> -->

    <a-form-model
      ref="infoFormModel"
      :model="saveObject"
      layout="vertical"
      :rules="rules"
      style="padding-bottom:50px">

      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-model-item label="用户登录名:" prop="loginUsername">
            <a-input v-model="saveObject.loginUsername" :disabled="!isAdd" />
          </a-form-model-item>
        </a-col>

        <a-col :span="10">
          <a-form-model-item label="用户姓名：" prop="realname">
            <a-input v-model="saveObject.realname" />
          </a-form-model-item>
        </a-col>

        <a-col :span="10">
          <a-form-model-item label="手机号：" prop="telphone">
            <a-input v-model="saveObject.telphone" />
          </a-form-model-item>
        </a-col>

        <a-col :span="10">
          <a-form-model-item label="编号：" prop="userNo">
            <a-input v-model="saveObject.userNo" />
          </a-form-model-item>
        </a-col>

        <a-col :span="10">
          <a-form-model-item label="请选择性别：" prop="sex">
            <a-radio-group v-model="saveObject.sex">
              <a-radio :value="1">男</a-radio>
              <a-radio :value="2">女</a-radio>
            </a-radio-group>
          </a-form-model-item>
        </a-col>

        <a-col :span="10">
          <a-form-model-item label="是否为超级管理员：" prop="isAdmin">
            <a-radio-group v-model="saveObject.isAdmin">
              <a-radio :value="1">是</a-radio>
              <a-radio :value="0">否</a-radio>
            </a-radio-group>
          </a-form-model-item>
        </a-col>

        <a-col :span="10">
          <a-form-model-item label="状态：" prop="state">
            <a-radio-group v-model="saveObject.state">
              <a-radio :value="1">启用</a-radio>
              <a-radio :value="0">停用</a-radio>
            </a-radio-group>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-divider orientation="left" v-if="resetIsShow">
        <a-tag color="#FF4B33">
          账户安全
        </a-tag>
      </a-divider>

      <div style="display:flex;flex-direction:row;">
        <a-row justify="space-between" type="flex" style="width:100%">
          <a-col :span="10">
            <a-form-model-item label="" v-if="resetIsShow">
              重置密码：<a-checkbox v-model="sysPassword.resetPass"></a-checkbox>
            </a-form-model-item>
          </a-col>
          <a-col :span="10">
            <a-form-model-item label="" v-if="sysPassword.resetPass">
              恢复默认密码：<a-checkbox v-model="sysPassword.defaultPass" @click="isResetPass"></a-checkbox>
            </a-form-model-item>
          </a-col>
        </a-row>
      </div>

      <div v-if="sysPassword.resetPass">
        <div v-show="!this.sysPassword.defaultPass">
          <a-row justify="space-between" type="flex">
            <a-col :span="10">
              <a-form-model-item label="新密码：" prop="newPwd">
                <a-input-password
                  autocomplete="new-password"
                  v-model="newPwd"
                  :disabled="sysPassword.defaultPass" />
              </a-form-model-item>
            </a-col>
            <a-col :span="10">
              <a-form-model-item label="确认新密码：" prop="confirmPwd">
                <a-input-password
                  autocomplete="new-password"
                  v-model="sysPassword.confirmPwd"
                  :disabled="sysPassword.defaultPass" />
              </a-form-model-item>
            </a-col>
          </a-row>
        </div>
      </div>

      <div class="drawer-btn-center">
        <a-button :style="{ marginRight: '8px' }" @click="onClose" icon="close">取消</a-button>
        <a-button type="primary" @click="handleOkFunc" icon="check" :loading="confirmLoading">保存</a-button>
      </div>

    </a-form-model>

  </a-drawer>
</template>

<script>
import { req, API_URL_SYS_USER_LIST } from '@/api/manage'
import { Base64 } from 'js-base64'
export default {

  props: {
    callbackFunc: { type: Function, default: () => ({}) }
  },

  data () {
    return {
      newPwd: '', //  新密码
      resetIsShow: false, // 重置密码是否展现
      sysPassword: {
        resetPass: false, // 重置密码
        defaultPass: true, // 使用默认密码
        confirmPwd: '' //  确认密码
      },
      loading: false, // 按钮上的loading
      value: 1, // 单选框默认的值
      confirmLoading: false, // 显示确定按钮loading图标
      isAdd: true, // 新增 or 修改页面标识
      isShow: false, // 是否显示弹层/抽屉
      saveObject: {}, // 数据对象
      recordId: null, // 更新对象ID
      rules: {
        realname: [{ required: true, message: '请输入用户姓名', trigger: 'blur' }],
        telphone: [{ required: true, pattern: /^[1][0-9]{10}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
        userNo: [{ required: true, message: '请输入编号', trigger: 'blur' }],
        loginUsername: [],
        newPwd: [{ required: false, trigger: 'blur' }, {
          validator: (rule, value, callBack) => {
            if (!this.sysPassword.defaultPass) {
              if (this.newPwd.length < 6 || this.newPwd.length > 12) {
                callBack('请输入6-12位新密码')
              }
            }
            callBack()
          }
        }], // 新密码
        confirmPwd: [{ required: false, trigger: 'blur' }, {
          validator: (rule, value, callBack) => {
            if (!this.sysPassword.defaultPass) {
              this.newPwd === this.sysPassword.confirmPwd ? callBack() : callBack('新密码与确认密码不一致')
            } else {
              callBack()
            }
          }
        }] // 确认新密码
      }
    }
  },
  created () {
  },
  methods: {
    show (recordId) { // 弹层打开事件
      if (this.$refs.infoFormModel !== undefined) {
        this.$refs.infoFormModel.resetFields()
      }

      this.isAdd = !recordId
      // 数据恢复为默认数据
      this.saveObject = {
        isAdmin: 1,
        state: 1,
        sex: 1
      }
      this.rules.loginUsername = []
      this.confirmLoading = false // 关闭loading

      if (this.isAdd) {
        this.rules.loginUsername.push({
          required: true,
          pattern: /^[a-zA-Z][a-zA-Z0-9]{5,17}$/,
          message: '请输入字母开头，长度为6-18位的登录名',
          trigger: 'blur'
        })
      }

      const that = this
      if (!this.isAdd) { // 修改信息 延迟展示弹层
        that.resetIsShow = true // 展示重置密码板块
        that.recordId = recordId
        req.getById(API_URL_SYS_USER_LIST, recordId).then(res => { that.saveObject = res })
        this.isShow = true
      } else {
        that.isShow = true // 立马展示弹层信息
      }
    },
    handleOkFunc: function () { // 点击【确认】按钮事件
      const that = this
      this.$refs.infoFormModel.validate(valid => {
        if (valid) { // 验证通过
          // 请求接口
          that.loading = true // 打开按钮上的 loading
          that.confirmLoading = true // 显示loading
          if (that.isAdd) {
            req.add(API_URL_SYS_USER_LIST, that.saveObject).then(res => {
              that.$message.success('新增成功')
              that.isShow = false
              that.loading = false
              that.callbackFunc() // 刷新列表
            }).catch((res) => {
              that.confirmLoading = false
            })
          } else {
            that.sysPassword.confirmPwd = Base64.encode(that.sysPassword.confirmPwd)
            Object.assign(that.saveObject, that.sysPassword) // 拼接对象
            console.log(that.saveObject)
            req.updateById(API_URL_SYS_USER_LIST, that.recordId, that.saveObject).then(res => {
              that.$message.success('修改成功')
              that.isShow = false
              that.callbackFunc() // 刷新列表
              that.resetIsShow = false // 取消展示
							that.sysPassword.resetPass = false
							that.sysPassword.defaultPass = true	// 是否使用默认密码默认为true
							that.resetPassEmpty(that) // 清空密码
            }).catch(res => {
              that.confirmLoading = false
              that.resetIsShow = false // 取消展示
							that.sysPassword.resetPass = false
							that.sysPassword.defaultPass = true	// 是否使用默认密码默认为true
							that.resetPassEmpty(that) // 清空密码
            })
          }
        }
      })
    },
    // 关闭抽屉
    onClose () {
      this.isShow = false
      this.resetIsShow = false // 取消重置密码板块展示
			this.resetPassEmpty(this) // 清空密码
			this.sysPassword.resetPass = false // 关闭密码输入
			this.sysPassword.defaultPass = true	// 是否使用默认密码默认为true
    },
    // 使用默认密码重置是否为true
    isResetPass () {
      if (!this.sysPassword.defaultPass) {
        this.newPwd = ''
        this.sysPassword.confirmPwd = ''
      }
    },
    // 保存后清空密码
		resetPassEmpty (that) {
		that.newPwd = ''
		that.sysPassword.confirmPwd = ''
		}
  }
}
</script>
