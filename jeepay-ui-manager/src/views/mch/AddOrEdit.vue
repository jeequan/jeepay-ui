<template>
  <a-drawer
    v-model:open="vdata.open"
    :mask-closable="false"
    :title="vdata.isAdd ? '新增商户' : '修改商户'"
    :body-style="{ paddingBottom: '80px' }"
    width="40%"
    class="drawer-width"
    @close="onClose"
  >
    <a-form
      ref="infoFormModel"
      :model="vdata.saveObject"
      layout="vertical"
      :rules="rules"
      name="basic"
    >
      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-item label="商户名称" name="mchName">
            <a-input v-model:value="vdata.saveObject.mchName" placeholder="请输入商户名称" />
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item label="登录名" name="loginUserName">
            <a-input
              v-model:value="vdata.saveObject.loginUserName"
              placeholder="请输入商户登录名"
              :disabled="!vdata.isAdd"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-item label="商户简称" name="mchShortName">
            <a-input v-model:value="vdata.saveObject.mchShortName" placeholder="请输入商户简称" />
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item label="联系人姓名" name="contactName">
            <a-input v-model:value="vdata.saveObject.contactName" placeholder="请输入联系人姓名" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-item label="联系人邮箱" name="contactEmail">
            <a-input v-model:value="vdata.saveObject.contactEmail" placeholder="请输入联系人邮箱" />
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item label="联系人手机号" name="contactTel">
            <a-input v-model:value="vdata.saveObject.contactTel" placeholder="请输入联系人手机号" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row justify="space-between" type="flex">
        <a-col :span="10" style="position: relative">
          <a-form-item label="商户类型" name="type">
            <!-- 商户类型 气泡弹窗 -->
            <a-radio-group
              v-model:value="vdata.saveObject.type"
              :disabled="vdata.isAdd ? false : true"
            >
              <a-radio :value="1">普通商户</a-radio>
              <a-radio :value="2">特约商户</a-radio>
            </a-radio-group>
          </a-form-item>
          <div id="components-popover-demo-placement">
            <div class="typePopover">
              <!-- title可省略，就不显示 -->
              <a-popover placement="top">
                <template #content>
                  <p>普通商户是指商户自行申请入驻微信或支付宝，无服务商协助，单独调接口。</p>
                  <p>
                    特约商户是指由微信或支付宝的服务商协助商户完成入驻，商户下单走的是服务商接口。
                  </p>
                </template>
                <template #title>
                  <span>商户类型</span>
                </template>
                <a-icon type="question-circle" />
              </a-popover>
            </div>
          </div>
        </a-col>
        <a-col v-if="vdata.saveObject.type == 2" :span="10">
          <a-form-item label="服务商号" name="isvNo">
            <a-select
              v-model:value="vdata.saveObject.isvNo"
              placeholder="请选择服务商"
              :disabled="!vdata.isAdd"
            >
              <a-select-option v-for="d in vdata.isvList" :key="d.isvNo" :value="d.isvNo">
                {{ d.isvName + ' [ ID: ' + d.isvNo + ' ]' }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item label="状态" name="state">
            <a-radio-group v-model:value="vdata.saveObject.state">
              <a-radio :value="1">启用</a-radio>
              <a-radio :value="0">禁用</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row justify="space-between" type="flex">
        <a-col :span="24">
          <a-form-item label="备注" name="remark">
            <a-textarea v-model:value="vdata.saveObject.remark" placeholder="请输入备注" />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 重置密码板块 -->
      <a-row justify="space-between" type="flex">
        <a-col :span="24">
          <a-divider v-if="vdata.resetIsShow" orientation="left">
            <a-tag color="#FF4B33">账户安全</a-tag>
          </a-divider>
        </a-col>
      </a-row>
      <div>
        <a-row justify="space-between" type="flex">
          <a-col :span="10">
            <a-form-item v-if="vdata.resetIsShow" label="">
              重置密码：
              <a-checkbox v-model:checked="vdata.sysPassword.resetPass" />
            </a-form-item>
          </a-col>
          <a-col :span="10">
            <a-form-item v-if="vdata.sysPassword.resetPass" label="">
              恢复默认密码：
              <a-checkbox v-model:checked="vdata.sysPassword.defaultPass" @click="isResetPass" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <div v-if="vdata.sysPassword.resetPass">
        <!-- <div v-else> -->
        <div v-show="!vdata.sysPassword.defaultPass">
          <a-row justify="space-between" type="flex">
            <a-col :span="10">
              <a-form-item label="新密码：" name="newPwd">
                <a-input-password
                  v-model:value="vdata.newPwd"
                  autocomplete="new-password"
                  :disabled="vdata.sysPassword.defaultPass"
                />
              </a-form-item>
            </a-col>

            <a-col :span="10">
              <a-form-item label="确认新密码：" name="confirmPwd">
                <a-input-password
                  v-model:value="vdata.sysPassword.confirmPwd"
                  autocomplete="new-password"
                  :disabled="vdata.sysPassword.defaultPass"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>
      </div>
    </a-form>
    <div class="drawer-btn-center">
      <a-button :style="{ marginRight: '8px' }" style="margin-right: 8px" @click="onClose">
        取消
      </a-button>
      <a-button type="primary" :loading="vdata.btnLoading" @click="handleOkFunc">保存</a-button>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { API_URL_MCH_LIST, API_URL_ISV_LIST, req } from '@/api/manage'
import { Base64 } from 'js-base64'
import { reactive, ref, getCurrentInstance } from 'vue'
const { $infoBox, $access, $hasAgentEnt, $SYS_NAME_MAP } =
  getCurrentInstance()!.appContext.config.globalProperties

const props: any = defineProps({
  callbackFunc: { type: Function },
})

const infoFormModel = ref()

const vdata: any = reactive({
  newPwd: '', //  新密码
  resetIsShow: false, // 重置密码是否展现
  sysPassword: {
    resetPass: false, // 重置密码
    defaultPass: true, // 使用默认密码
    confirmPwd: '', //  确认密码
  },
  btnLoading: false,
  isAdd: true, // 新增 or 修改页面标志
  saveObject: {}, // 数据对象
  recordId: null, // 更新对象ID
  open: false, // 是否显示弹层/抽屉
  isvList: null, // 服务商下拉列表
})

const checkIsvNo = (rule, value) => {
  // 校验类型为特约商户是否选择了服务商
  if (vdata.saveObject.type === 2 && !value) {
    return Promise.reject('请选择服务商')
  }
  return Promise.resolve()
}

const rules: any = reactive({
  mchName: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
  loginUserName: [
    {
      required: true,
      pattern: /^[a-zA-Z][a-zA-Z0-9]{5,17}$/,
      message: '请输入字母开头，长度为6-18位的登录名',
      trigger: 'blur',
    },
  ],
  mchShortName: [{ required: true, message: '请输入商户简称', trigger: 'blur' }],
  contactName: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
  isvNo: [{ validator: checkIsvNo, trigger: 'blur' }],
  contactEmail: [
    {
      required: false,
      pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
      message: '请输入正确的邮箱地址',
      trigger: 'blur',
    },
  ],
  contactTel: [
    { required: true, pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  newPwd: [
    { required: false, trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (!vdata.sysPassword.defaultPass) {
          if (vdata.newPwd.length < 6 || vdata.newPwd.length > 12) {
            return Promise.reject('请输入6-12位新密码')
          }
        }
        return Promise.resolve()
      },
    },
  ], // 新密码
  confirmPwd: [
    { required: false, trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (!vdata.sysPassword.defaultPass) {
          if (vdata.newPwd === vdata.sysPassword.confirmPwd) {
            return Promise.resolve()
          } else {
            return Promise.reject('新密码与确认密码不一致')
          }
        } else {
          return Promise.resolve()
        }
      },
    },
  ], // 确认新密码
})

function show(recordId) {
  // 弹层打开事件
  vdata.isAdd = !recordId

  vdata.saveObject = { state: 1, type: 1 } // 数据清空
  if (infoFormModel.value) {
    infoFormModel.value.resetFields()
  }
  req.list(API_URL_ISV_LIST, { pageSize: -1, state: 1 }).then((res) => {
    // 服务商下拉选择列表
    vdata.isvList = res.records
  })
  if (!vdata.isAdd) {
    // 修改信息 延迟展示弹层
    vdata.resetIsShow = true // 展示重置密码板块
    vdata.recordId = recordId

    req.getById(API_URL_MCH_LIST, recordId).then((res) => {
      vdata.saveObject = res
    })
    vdata.open = true
  } else {
    vdata.open = true // 立马展示弹层信息
  }
}
function handleOkFunc() {
  // 点击【确认】按钮事件
  infoFormModel.value.validate().then((valid) => {
    if (valid) {
      // 验证通过
      // 请求接口
      if (vdata.isAdd) {
        vdata.btnLoading = true
        req
          .add(API_URL_MCH_LIST, vdata.saveObject)
          .then((res) => {
            $infoBox.message.success('新增成功')
            vdata.open = false
            props.callbackFunc() // 刷新列表
            vdata.btnLoading = false
          })
          .catch((res) => {
            vdata.btnLoading = false
          })
      } else {
        vdata.sysPassword.confirmPwd = Base64.encode(vdata.sysPassword.confirmPwd)
        console.log(vdata.sysPassword.confirmPwd)
        Object.assign(vdata.saveObject, vdata.sysPassword) // 拼接对象

        req
          .updateById(API_URL_MCH_LIST, vdata.recordId, vdata.saveObject)
          .then((res) => {
            $infoBox.message.success('修改成功')
            vdata.open = false
            props.callbackFunc() // 刷新列表
            vdata.btnLoading = false
            vdata.resetIsShow = true // 展示重置密码板块
            vdata.sysPassword.resetPass = false
            vdata.sysPassword.defaultPass = true // 是否使用默认密码默认为true
            resetPassEmpty() // 清空密码
          })
          .catch((res) => {
            vdata.btnLoading = false
            vdata.resetIsShow = true // 展示重置密码板块
            vdata.sysPassword.resetPass = false
            vdata.sysPassword.defaultPass = true // 是否使用默认密码默认为true
            resetPassEmpty() // 清空密码
          })
      }
    }
  })
}
function onClose() {
  vdata.open = false
  vdata.resetIsShow = false // 取消重置密码板块展示
  vdata.sysPassword.resetPass = false
  resetPassEmpty()
  vdata.sysPassword.defaultPass = true // 是否使用默认密码默认为true
}
function searchFunc() {
  // 点击【查询】按钮点击事件
  vdata.$refs.infoTable.refTable(true)
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
  vdata.open = false
}

defineExpose({ show })
</script>
<style lang="less" scoped>
.typePopover {
  position: absolute;
  top: 0;
  left: 62px;
}
</style>
