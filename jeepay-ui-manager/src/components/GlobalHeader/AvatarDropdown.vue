<template>
  <a-dropdown placement="bottomRight">
    <span class="ant-pro-account-avatar">
      <a-avatar size="small" :src="greetImg" class="antd-pro-global-header-index-avatar" />
      <span>{{ currentUserName }}</span>
    </span>
    <template v-slot:overlay>
      <a-menu class="ant-pro-drop-down menu" :selected-keys="[]">

        <a-menu-item v-if="$access('ENT_C_USERINFO')" key="settings" @click="handleToSettings">
          <a-icon type="setting" />
          账户设置
        </a-menu-item>

        <a-menu-divider />

        <a-menu-item key="logout" @click="handleLogout">
          <a-icon type="logout" />
          退出登录
        </a-menu-item>

      </a-menu>
    </template>
  </a-dropdown>
</template>

<script>

export default {
  name: 'AvatarDropdown',
  props: {
  },
  data: function () {
    return {
      // greetImg: '', // 头像图片地址
      sex: ''
    }
  },
  computed: {
    // 返回用户名
    currentUserName () {
      return this.$store.state.user.userName
    },
    // 返回头像
    greetImg () {
      return this.$store.state.user.avatarImgPath
    }
  },
  methods: {
    handleToSettings () {
      this.$router.push({ name: 'ENT_C_USERINFO' })
    },
    handleLogout: function (e) {
      this.$infoBox.confirmPrimary('确认退出?', '', () => {
        this.$store.dispatch('Logout').then(() => {
          this.$router.push({ name: 'login' })
        })
      })
    }
  }

}
</script>

<style lang="less" scoped>
.ant-pro-drop-down {
  /deep/ .action {
    margin-right: 8px;
  }
  /deep/ .ant-dropdown-menu-item {
    min-width: 160px;
  }
}
</style>
