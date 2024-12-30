<template>
  <a-drawer
    :title="vdata.isAdd ? '新增操作员' : '修改操作员'"
    placement="right"
    :closable="true"
    @ok="handleOkFunc"
    v-model:open="vdata.isShow"
    width="600"
    @close="onClose"
    :maskClosable="false"
  >
    <!-- <a-modal :confirmLoading="confirmLoading"> -->

    <a-form
      ref="infoFormModel"
      :model="vdata.saveObject"
      layout="vertical"
      :rules="rules"
      style="padding-bottom: 50px"
    >
      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-item label="用户登录名:" name="loginUsername">
            <a-input v-model:value="vdata.saveObject.loginUsername" :disabled="!vdata.isAdd" />
          </a-form-item>
        </a-col>

        <a-col :span="10">
          <a-form-item label="用户姓名：" name="realname">
            <a-input v-model:value="vdata.saveObject.realname" />
          </a-form-item>
        </a-col>

        <a-col :span="10">
          <a-form-item label="手机号：" name="telphone">
            <a-input v-model:value="vdata.saveObject.telphone" />
          </a-form-item>
        </a-col>

        <a-col :span="10">
          <a-form-item label="编号：" name="userNo">
            <a-input v-model:value="vdata.saveObject.userNo" />
          </a-form-item>
        </a-col>

        <a-col :span="10">
          <a-form-item label="请选择性别：" name="sex">
            <a-radio-group v-model:value="vdata.saveObject.sex">
              <a-radio :value="1">男</a-radio>
              <a-radio :value="2">女</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>

        <a-col :span="10">
          <a-form-item label="是否为超级管理员：" name="isAdmin">
            <a-radio-group v-model:value="vdata.saveObject.isAdmin">
              <a-radio :value="1">是</a-radio>
              <a-radio :value="0">否</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>

        <a-col :span="10">
          <a-form-item label="状态：" name="state">
            <a-radio-group v-model:value="vdata.saveObject.state">
              <a-radio :value="1">启用</a-radio>
              <a-radio :value="0">停用</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>
      <a-divider orientation="left" v-if="vdata.resetIsShow">
        <a-tag color="#FF4B33">账户安全</a-tag>
      </a-divider>

      <div style="display: flex; flex-direction: row">
        <a-row justify="space-between" type="flex" style="width: 100%">
          <a-col :span="10">
            <a-form-item label="" v-if="vdata.resetIsShow">
              重置密码：
              <a-checkbox v-model:checked="vdata.sysPassword.resetPass"></a-checkbox>
            </a-form-item>
          </a-col>
          <a-col :span="10">
            <a-form-item label="" v-if="vdata.sysPassword.resetPass">
              恢复默认密码：
              <a-checkbox
                v-model:checked="vdata.sysPassword.defaultPass"
                @click="isResetPass"
              ></a-checkbox>
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <div v-if="vdata.sysPassword.resetPass">
        <div v-show="!vdata.sysPassword.defaultPass">
          <a-row justify="space-between" type="flex">
            <a-col :span="10">
              <a-form-item label="新密码：" name="newPwd">
                <a-input-password
                  autocomplete="new-password"
                  v-model:value="vdata.newPwd"
                  :disabled="vdata.sysPassword.defaultPass"
                />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item label="确认新密码：" name="confirmPwd">
                <a-input-password
                  autocomplete="new-password"
                  v-model:value="vdata.sysPassword.confirmPwd"
                  :disabled="vdata.sysPassword.defaultPass"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>
      </div>

      <div class="drawer-btn-center">
        <a-button :style="{ marginRight: '8px' }" @click="onClose">取消</a-button>
        <a-button type="primary" @click="handleOkFunc" :loading="vdata.confirmLoading">
          保存
        </a-button>
      </div>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { req, API_URL_SYS_USER_LIST } from '@/api/manage'
import { Base64 } from 'js-base64'
import { reactive, getCurrentInstance, ref } from 'vue'
const { $infoBox, $access, $hasAgentEnt } = getCurrentInstance()!.appContext.config.globalProperties

const props = defineProps({
  callbackFunc: { type: Function, default: () => ({}) },
})

const vdata: any = reactive({
  newPwd: '', //  新密码
  resetIsShow: false, // 重置密码是否展现
  sysPassword: {
    resetPass: false, // 重置密码
    defaultPass: true, // 使用默认密码
    confirmPwd: '', //  确认密码
  },
  loading: false, // 按钮上的loading
  value: 1, // 单选框默认的值
  confirmLoading: false, // 显示确定按钮loading图标
  isAdd: true, // 新增 or 修改页面标识
  isShow: false, // 是否显示弹层/抽屉
  saveObject: {}, // 数据对象
  recordId: null, // 更新对象ID
})

const infoFormModel = ref()

const rules: any = reactive({
  realname: [{ required: true, message: '请输入用户姓名', trigger: 'blur' }],
  telphone: [
    { required: true, pattern: /^[1][0-9]{10}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  userNo: [{ required: true, message: '请输入编号', trigger: 'blur' }],
  loginUsername: [],
  newPwd: [
    { required: false, trigger: 'blur' },
    {
      validator: (rule, value, callBack) => {
        if (!vdata.sysPassword.defaultPass) {
          if (vdata.newPwd.length < 6 || vdata.newPwd.length > 12) {
            callBack('请输入6-12位新密码')
          }
        }
        callBack()
      },
    },
  ], // 新密码
  confirmPwd: [
    { required: false, trigger: 'blur' },
    {
      validator: (rule, value, callBack) => {
        if (!vdata.sysPassword.defaultPass) {
          vdata.newPwd === vdata.sysPassword.confirmPwd
            ? callBack()
            : callBack('新密码与确认密码不一致')
        } else {
          callBack()
        }
      },
    },
  ], // 确认新密码
})

function show(recordId) {
  // 弹层打开事件
  if (infoFormModel.value) {
    infoFormModel.value.resetFields()
  }

  vdata.isAdd = !recordId
  // 数据恢复为默认数据
  vdata.saveObject = {
    isAdmin: 1,
    state: 1,
    sex: 1,
  }
  rules.loginUsername = []
  vdata.confirmLoading = false // 关闭loading

  if (vdata.isAdd) {
    rules.loginUsername.push({
      required: true,
      pattern: /^[a-zA-Z][a-zA-Z0-9]{5,17}$/,
      message: '请输入字母开头，长度为6-18位的登录名',
      trigger: 'blur',
    })
  }

  if (!vdata.isAdd) {
    // 修改信息 延迟展示弹层
    vdata.resetIsShow = true // 展示重置密码板块
    vdata.recordId = recordId
    req.getById(API_URL_SYS_USER_LIST, recordId).then((res) => {
      vdata.saveObject = res
    })
    vdata.isShow = true
  } else {
    vdata.isShow = true // 立马展示弹层信息
  }
}
function handleOkFunc() {
  // 点击【确认】按钮事件
  infoFormModel.value.validate().then((valid) => {
    if (valid) {
      // 验证通过
      // 请求接口
      vdata.loading = true // 打开按钮上的 loading
      vdata.confirmLoading = true // 显示loading
      if (vdata.isAdd) {
        req
          .add(API_URL_SYS_USER_LIST, vdata.saveObject)
          .then((res) => {
            $infoBox.message.success('新增成功')
            vdata.isShow = false
            vdata.loading = false
            props.callbackFunc() // 刷新列表
          })
          .catch((res) => {
            vdata.confirmLoading = false
          })
      } else {
        vdata.sysPassword.confirmPwd = Base64.encode(vdata.sysPassword.confirmPwd)
        Object.assign(vdata.saveObject, vdata.sysPassword) // 拼接对象
        req
          .updateById(API_URL_SYS_USER_LIST, vdata.recordId, vdata.saveObject)
          .then((res) => {
            $infoBox.message.success('修改成功')
            vdata.isShow = false
            props.callbackFunc() // 刷新列表
            vdata.resetIsShow = false // 取消展示
            vdata.sysPassword.resetPass = false
            vdata.sysPassword.defaultPass = true // 是否使用默认密码默认为true
            resetPassEmpty() // 清空密码
          })
          .catch((res) => {
            vdata.confirmLoading = false
            vdata.resetIsShow = false // 取消展示
            vdata.sysPassword.resetPass = false
            vdata.sysPassword.defaultPass = true // 是否使用默认密码默认为true
            resetPassEmpty() // 清空密码
          })
      }
    }
  })
}
// 关闭抽屉
function onClose() {
  vdata.isShow = false
  vdata.resetIsShow = false // 取消重置密码板块展示
  resetPassEmpty() // 清空密码
  vdata.sysPassword.resetPass = false // 关闭密码输入
  vdata.sysPassword.defaultPass = true // 是否使用默认密码默认为true
}
// 使用默认密码重置是否为true
function isResetPass() {
  if (!vdata.sysPassword.defaultPass) {
    vdata.newPwd = ''
    vdata.sysPassword.confirmPwd = ''
  }
}
// 保存后清空密码
function resetPassEmpty() {
  vdata.newPwd = ''
  vdata.sysPassword.confirmPwd = ''
}

defineExpose({ show })
</script>
