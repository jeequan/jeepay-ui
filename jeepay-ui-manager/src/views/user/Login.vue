<template>
  <div class="main">
    <a-form class="user-layout-login" ref="formLogin" :form="form" @submit="handleSubmit">
      <!-- 错误提示信息 -->
      <a-alert v-if="showLoginErrorInfo" type="error" showIcon style="margin-bottom: 24px;" :message="showLoginErrorInfo" />

      <a-form-item>
        <a-input
          @focus="usernameIcon = require('@/assets/svg/select-user.svg')"
          @blur="usernameIcon = require('@/assets/svg/user.svg')"
          size="large"
          type="text"
          placeholder="请输入账户"
          v-decorator="[
            'username',
            {rules: [{ required: true, message: '请输入帐户名' }], validateTrigger: 'change'}
          ]"
        >
          <img :src="usernameIcon" slot="prefix" class="user" alt="user" >
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-input-password
          @focus="passwordIcon = require('@/assets/svg/select-lock.svg')"
          @blur="passwordIcon = require('@/assets/svg/lock.svg')"
          size="large"
          placeholder="请输入密码"
          v-decorator="[
            'password',
            {rules: [{ required: true, message: '请输入密码' }], validateTrigger: 'change'}
          ]"
        >
          <!-- <a-icon src="../../assets/svg/user.svg" alt=""> -->
          <img :src="passwordIcon" slot="prefix" class="user" alt="user">
        </a-input-password>
      </a-form-item>

      <div class="code">
        <a-form-item>
          <a-input
            @focus="vercodeIcon = require('@/assets/svg/select-code.svg')"
            @blur="vercodeIcon = require('@/assets/svg/code.svg')"
            class="code-input"
            size="large"
            type="text"
            placeholder="请输入人机验证码"
            v-decorator="[
              'usercode',
              {rules: [{ required: true, message: '请输入人机验证码' }], validateTrigger: 'blur'}
            ]"
          >
            <img :src="vercodeIcon" slot="prefix" class="user" alt="user" />
          </a-input>
        </a-form-item>
        <div class="code-img"><img v-show="vercodeImgSrc" :src="vercodeImgSrc" @click="refVercode()"/></div>
      </div>

      <a-form-item>
        <!-- 自动登录 -->
        <!-- <a-checkbox v-decorator="['rememberMe', { valuePropName: 'checked' }]">自动登录</a-checkbox> -->
        <a-checkbox v-model="isAutoLogin">自动登录</a-checkbox>
        <!-- 忘记密码 -->
        <a class="forge-password" style="float: right;">忘记密码?</a>
      </a-form-item>

      <a-form-item class="submit">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="loginBtnLoadingFlag"
        >登录
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
// import Initializer from '@/core/bootstrap'
import { mapActions } from 'vuex'
import { timeFix } from '@/utils/util'
import { vercode } from '@/api/login'

export default {
  components: {
  },
  data () {
    return {
      isAutoLogin: true, // 是否是自动登录
      loginBtnLoadingFlag: false, // 登录按钮是否显示 加载状态
      showLoginErrorInfo: '', // 是否显示登录错误面板信息
      form: this.$form.createForm(this),
      usernameIcon: require('@/assets/svg/user.svg'), // 三个icon图标
      passwordIcon: require('@/assets/svg/lock.svg'),
      vercodeIcon: require('@/assets/svg/code.svg'),
      vercodeImgSrc: '', // 验证码图片
      vercodeToken: '' // 验证码验证token
    }
  },
  mounted () {
    this.refVercode()
  },
  methods: {
    ...mapActions(['Login', 'Logout']),
    // handler
    handleSubmit (e) {
      e.preventDefault() // 通知 Web 浏览器不要执行与事件关联的默认动作
      const that = this
      that.form.validateFields({ force: true }, (err, values) => {
        if (!err) {
          const loginParams = { ...values }
          loginParams.username = values.username
          loginParams.password = values.password
          loginParams.vercode = values.usercode
          loginParams.vercodeToken = that.vercodeToken
          that.loginBtnLoadingFlag = true // 登录按钮显示加载loading
          that.Login({ loginParams: loginParams, isSaveStorage: that.isAutoLogin }) // 打开自动登录将保存在localStorage中，否则保存在内存中。
            .then((res) => {
              this.loginSuccess(res)
            })
            .catch(err => {
              that.showLoginErrorInfo = (err.msg || JSON.stringify(err))
              that.loginBtnLoadingFlag = false
            })
        }
      })
    },
    loginSuccess (res) {
      this.$router.push({ path: '/' })
      // 延迟 1 秒显示欢迎信息
      setTimeout(() => {
        this.$notification.success({
          message: '欢迎',
          description: `${timeFix()}，欢迎回来`
        })
      }, 1000)
      this.showLoginErrorInfo = ''
    },
    refVercode () { // 刷新图片验证码
      const that = this
      // 获取图形验证码
      vercode().then(res => {
        that.vercodeImgSrc = res.imageBase64Data
        that.vercodeToken = res.vercodeToken
      })
    }
  }
}
</script>

<style lang="less" scoped>
.user-layout-login {
  label {
    font-size: 14px;
  }

  .forge-password {
    font-size: 14px;
    color: @jee-theme;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .register {
      float: right;
    }
  }
  .code {
    display: flex;
    justify-content: space-between;
    .code-input {
      width: 216px;
    }
    .code-img {
      width: 137px;
      height: 40px;
      background-color: #ddd;
      img{
        width: 137px;
        height: 40px;
      }
    }
  }
  .submit {
    margin-top: 50px;
  }
}

</style>
