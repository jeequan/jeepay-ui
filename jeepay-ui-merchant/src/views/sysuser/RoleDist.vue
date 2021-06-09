<template>
  <a-drawer :visible="isShow" title="分配角色" width="30%" :maskClosable="false" @close="isShow = false">

    <div>
      <div :style="{ borderBottom: '1px solid #E9E9E9' }">
        <a-checkbox
          :indeterminate="checkedVal.length != 0 && allRoleList.length != checkedVal.length"
          :checked="checkedVal.length != 0 && allRoleList.length === checkedVal.length"
          @change="onCheckAllChange">
          全选
        </a-checkbox>
      </div>
      <br />
      <a-checkbox-group v-model="checkedVal" :options="allRoleList"/>
    </div>

    <div class="drawer-btn-center">
      <a-button :style="{ marginRight: '8px' }" @click="isShow = false" icon="close">取消</a-button>
      <a-button type="primary" @click="handleOkFunc" :loading="confirmLoading" icon="check">保存</a-button>
    </div>
  </a-drawer>

</template>

<script>
import { uSysUserRoleRela, req, reqLoad, API_URL_ROLE_LIST, API_URL_USER_ROLE_RELA_LIST } from '@/api/manage'
export default {

  props: {
    callbackFunc: { type: Function }
  },

  data () {
    return {
      confirmLoading: false, // 显示确定按钮loading图标
      isShow: false, // 是否显示弹层/抽屉
      recordId: null, // 更新对象ID

      allRoleList: [], // 全部的角色集合 {label: '', value: ''}
      checkedVal: [] // 已选择的数据集合
    }
  },
  created () {
  },
  methods: {

    show: function (recordId) { // 弹层打开事件
      const that = this

      // 重置数据
      that.allRoleList = []
      that.checkedVal = []
      that.confirmLoading = false // 关闭loading
      that.recordId = recordId

      // 查询所有角色列表
      reqLoad.list(API_URL_ROLE_LIST, { pageSize: -1 }).then(res => {
        if (res.total <= 0) {
          return this.$message.error(`当前暂无角色，请先行添加`)
        }

        that.allRoleList = []
        res.records.map(role => {
          that.allRoleList.push({ label: role.roleName, value: role.roleId })
          that.isShow = true
        })

        // 查询已分配的列表
        req.list(API_URL_USER_ROLE_RELA_LIST, { pageSize: -1, userId: recordId }).then(relaRes => {
          relaRes.records.map(rela => {
              that.checkedVal.push(rela.roleId)
          })
        })
      })
    },

    handleOkFunc: function () { // 点击【确认】按钮事件
      const that = this

      that.confirmLoading = true // 显示loading
      uSysUserRoleRela(this.recordId, this.checkedVal).then(res => {
        that.$message.success('更新成功！')
        this.isShow = false

        if (that.callbackFunc !== undefined) {
          that.callbackFunc() // 刷新列表
        }
      }).catch(res => { that.confirmLoading = false }) // 恢复loading
    },

    onCheckAllChange: function (e) { // 点击全选/非全选的状态更改
      const that = this

      this.checkedVal = []
      if (e.target.checked) { // 全选
        this.allRoleList.map(role => { that.checkedVal.push(role.value) })
      }
    }
  }
}
</script>
