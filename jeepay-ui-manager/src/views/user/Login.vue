<template>
  <div id="userLayout" :class="['user-layout-wrapper']">
    <div class="container">
      <div class="user-layout-lang" />
      <div class="user-layout-content">
        <div class="top">
          <div class="header">
            <a href="/">
              <img src="@/assets/logo.svg" class="logo" alt="logo" />
            </a>
          </div>
          <div class="desc">
            <img src="@/assets/svg/operate.svg" class="logo" alt="logo" />
            <span>运营平台</span>
          </div>
        </div>

        <div class="main">
          <a-form
            ref="formLogin"
            class="user-layout-login"
            model="formState"
            :rules="{ name: [{ required: true }] }"
            @submit="handleSubmit"
          >
            <!-- 错误提示信息 -->
            <a-alert
              v-if="showLoginErrorInfo"
              type="error"
              show-icon
              style="margin-bottom: 24px"
              :message="showLoginErrorInfo"
            />

            <a-form-item name="username">
              <a-input
                v-model:value="formState.username"
                size="large"
                type="text"
                placeholder="请输入账户"
              />
            </a-form-item>

            <a-form-item name="password">
              <a-input-password
                v-model:value="formState.password"
                size="large"
                placeholder="请输入密码"
              />
            </a-form-item>

            <div class="code">
              <a-form-item name="vercode">
                <a-input
                  v-model:value="formState.vercode"
                  class="code-input"
                  size="large"
                  type="text"
                  placeholder="请输入人机验证码"
                />
              </a-form-item>

              <div class="code-img" style="position: relative; background: #ddd">
                <img v-show="vercodeImgSrc" :src="vercodeImgSrc" @click="refVercode()" />
                <div v-show="isOverdue" class="vercode-mask" @click="refVercode()">
                  已过期 请刷新
                </div>
              </div>
            </div>

            <a-form-item>
              <!-- 自动登录 -->
              <a-checkbox v-model="isAutoLogin">自动登录</a-checkbox>
              <!-- 忘记密码 -->
              <a class="forge-password" style="float: right">忘记密码?</a>
            </a-form-item>

            <a-form-item class="submit">
              <a-button
                size="large"
                type="primary"
                html-type="submit"
                class="login-button"
                :loading="loginBtnLoadingFlag"
              >
                登录
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <div class="footer" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { timeFix } from '@/utils/util'
import { vercode } from '@/api/login'
import router from '@/router'
import { login } from '@/api/login'
import { useUserStore } from '@/store/modules/user'
import { ref, onMounted, reactive, getCurrentInstance } from 'vue'

const { $infoBox } = getCurrentInstance()!.appContext.config.globalProperties

const userStore = useUserStore()

let isOverdue = ref(false) // 设置过期样式
let isAutoLogin = true // 是否是自动登录
let loginBtnLoadingFlag = false // 登录按钮是否显示 加载状态
let showLoginErrorInfo = ref('') // 是否显示登录错误面板信息
let timer: any = null
// let usernameIcon = require('@/assets/svg/user.svg')  // 三个icon图标
// let passwordIcon = require('@/assets/svg/lock.svg')
// let vercodeIcon = require('@/assets/svg/code.svg')
let vercodeImgSrc = ref('') // 验证码图片
let vercodeToken = ref('') // 验证码验证token

let formLogin = ref()

let formState = reactive({
  username: '',
  password: '',
  vercode: '',
})

onMounted(() => {
  refVercode()
})

function handleSubmit(e) {
  let loginParams = {
    username: formState.username,
    password: formState.password,
    vercode: formState.vercode,
    vercodeToken: vercodeToken.value,
  }

  // 请求登录
  login(loginParams)
    .then((bizData) => {
      userStore.putToken(bizData['iToken'])
      router.push({ path: '/' })
      // 延迟 1 秒显示欢迎信息
      setTimeout(() => {
        $infoBox.notification.success({ message: '欢迎', description: `${timeFix()}，欢迎回来` })
      }, 1000)
      showLoginErrorInfo.value = ''
    })
    .catch((err) => {
      showLoginErrorInfo.value = err.msg || JSON.stringify(err)
    })
}

function refVercode() {
  // 刷新图片验证码
  vercode().then((res) => {
    vercodeImgSrc.value = res.imageBase64Data
    vercodeToken.value = res.vercodeToken

    isOverdue.value = false
    if (timer) clearInterval(timer) // 如果多次点击则清除已有的定时器
    // 超过60秒提示过期刷新
    timer = setInterval(() => {
      res.expireTime--
      if (res.expireTime <= 0) {
        isOverdue.value = true
        clearInterval(timer)
      }
    }, 1000)
  })
}
</script>

<style lang="less" scoped>
#userLayout.user-layout-wrapper {
  height: 100%;

  &.mobile {
    .container {
      .main {
        max-width: 368px;
        width: 98%;
      }
    }
  }

  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    background: #f0f2f5 url('../../assets/svg/background.svg') no-repeat 50%;
    background-size: cover;
    //padding: 50px 0 84px;
    position: relative;

    .user-layout-lang {
      width: 100%;
      // height: 40px;
      // line-height: 44px;
      height: 0;
      text-align: right;
    }

    .user-layout-content {
      .top {
        text-align: center;

        .header {
          height: 44px;
          line-height: 44px;
          margin-bottom: 80px;

          .badge {
            position: absolute;
            display: inline-block;
            line-height: 1;
            vertical-align: middle;
            margin-left: -12px;
            margin-top: -10px;
            opacity: 0.8;
          }

          .logo {
            height: 44px;
            vertical-align: top;
            border-style: none;
          }

          .title {
            font-size: 33px;
            color: rgba(0, 0, 0, 0.85);
            font-family: Avenir, 'Helvetica Neue', Arial, Helvetica, sans-serif;
            font-weight: 600;
            position: relative;
            top: 2px;
          }
        }
        .desc {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
          margin-bottom: 40px;
          font-size: 20px;
          font-family:
            PingFang SC,
            PingFang SC-Medium;
          font-weight: 500;
          color: #252626;
          letter-spacing: 1px;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 28px;
          line-height: 28px;

          span {
            margin-left: 10px;
          }
        }
      }

      .main {
        min-width: 260px;
        width: 368px;
        margin: 0 auto;
      }

      .footer {
        // position: absolute;
        width: 100%;
        bottom: 0;
        padding: 0 16px;
        margin: 48px 0 24px;
        text-align: center;

        .links {
          margin-bottom: 8px;
          font-size: 14px;
          a {
            color: rgba(0, 0, 0, 0.45);
            transition: all 0.3s;
            &:not(:last-child) {
              margin-right: 40px;
            }
          }
        }
        .copyright {
          color: rgba(0, 0, 0, 0.45);
          font-size: 14px;
        }
      }
    }

    a {
      text-decoration: none;
    }
  }
}
</style>

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
      img {
        width: 137px;
        height: 40px;
      }
    }
  }
  .submit {
    margin-top: 50px;
  }
}
.vercode-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0.8;
  text-align: center;
  line-height: 40px;
  color: #fff;
  &:hover {
    cursor: pointer;
  }
}
</style>
