<template>
  <a-drawer :visible="isShow" :title=" isAdd ? '新增角色' : '修改角色' " width="30%" :maskClosable="false" @close="isShow = false">

    <a-form-model ref="infoFormModel" :model="saveObject" :label-col="{span: 4}" :wrapper-col="{span: 15}" :rules="rules">

      <a-form-model-item label="角色名称：" prop="roleName">
        <a-input v-model="saveObject.roleName" />
      </a-form-model-item>

    </a-form-model>

    <!-- 角色权限分配 -->
    <RoleDist ref="roleDist" />

    <div class="drawer-btn-center">
      <a-button :style="{ marginRight: '8px' }" @click="isShow = false" icon="close">取消</a-button>
      <a-button type="primary" @click="handleOkFunc" :loading="confirmLoading" icon="check">保存</a-button>
    </div>

  </a-drawer>

</template>

<script>
import { API_URL_ROLE_LIST, req } from '@/api/manage'
import RoleDist from './RoleDist'
export default {

  components: { RoleDist },

  props: {
    callbackFunc: { type: Function }
  },

  data () {
    return {
      confirmLoading: false, // 显示确定按钮loading图标
      isAdd: true, // 新增 or 修改页面标识
      isShow: false, // 是否显示弹层/抽屉
      saveObject: {}, // 数据对象
      recordId: null, // 更新对象ID
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
  },
  methods: {
    show: function (recordId) { // 弹层打开事件
      this.isAdd = !recordId
      this.saveObject = {} // 数据清空
      this.confirmLoading = false // 关闭loading

      if (this.$refs.infoFormModel !== undefined) {
        this.$refs.infoFormModel.resetFields()
      }

      const that = this

      // 初始化角色权限分配功能
      this.$nextTick(() => that.$refs.roleDist.initTree(recordId))

      if (!this.isAdd) { // 修改信息 延迟展示弹层
        that.recordId = recordId
        req.getById(API_URL_ROLE_LIST, recordId).then(res => { that.saveObject = res })
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

            that.confirmLoading = true // 显示loading

            // 保存选择的权限信息
            const selectedEntIdList = that.$refs.roleDist.getSelectedEntIdList()
            that.saveObject.entIdListStr = selectedEntIdList ? JSON.stringify(selectedEntIdList) : ''

            if (that.isAdd) {
              req.add(API_URL_ROLE_LIST, that.saveObject).then(res => {
                that.$message.success('新增成功')
                that.isShow = false
                that.callbackFunc() // 刷新列表
              }).catch(res => { that.confirmLoading = false })
            } else {
              req.updateById(API_URL_ROLE_LIST, that.recordId, that.saveObject).then(res => {
                that.$message.success('修改成功')
                that.isShow = false
                that.callbackFunc() // 刷新列表
              }).catch(res => { that.confirmLoading = false })
            }
          }
        })
    }
  }
}
</script>
