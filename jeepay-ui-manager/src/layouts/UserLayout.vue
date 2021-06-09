<template>

  <div id="userLayout" :class="['user-layout-wrapper']">
    <div class="container">
      <div class="user-layout-lang">
      </div>
      <div class="user-layout-content">
        <div class="top">
          <div class="header">
            <a href="/">
              <img src="~@/assets/logo.svg" class="logo" alt="logo">
            </a>
          </div>
          <div class="desc">
            <img src="~@/assets/svg/operate.svg" class="logo" alt="logo">
            <span>运营平台</span>
          </div>
        </div>

        <router-view />

        <div class="footer">
          <!--          <div class="links">-->
          <!--            <a href="_self">帮助</a>-->
          <!--            <a href="_self">隐私</a>-->
          <!--            <a href="_self">条款</a>-->
          <!--          </div>-->
          <!-- <div class="copyright">
            Copyright &copy; 2021 jeequan.com
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'UserLayout',
  components: {
  },
  mounted () {
    document.body.classList.add('userLayout')
  },
  beforeDestroy () {
    document.body.classList.remove('userLayout')
  }
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
    background: #f0f2f5 url(~@/assets/svg/background.svg) no-repeat 50%;
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
          margin-bottom:80px;

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
            color: rgba(0, 0, 0, .85);
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
          font-family: PingFang SC, PingFang SC-Medium;
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
