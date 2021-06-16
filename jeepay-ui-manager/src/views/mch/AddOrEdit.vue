<template>
  <a-drawer
    :maskClosable="false"
    :visible="visible"
    :title=" isAdd ? '新增商户' : '修改商户' "
    @close="onClose"
    :body-style="{ paddingBottom: '80px' }"
    width="40%"
    class="drawer-width"

  >
    <a-form-model v-if="visible" ref="infoFormModel" :model="saveObject" layout="vertical" :rules="rules">
      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-model-item label="商户名称" prop="mchName">
            <a-input
              placeholder="请输入商户名称"
              v-model="saveObject.mchName"
            />
          </a-form-model-item>
        </a-col>
        <a-col :span="10">
          <a-form-model-item label="登录名" prop="loginUserName">
            <a-input
              placeholder="请输入商户登录名"
              v-model="saveObject.loginUserName"
              :disabled="!this.isAdd"
            />
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-model-item label="商户简称" prop="mchShortName">
            <a-input
              placeholder="请输入商户简称"
              v-model="saveObject.mchShortName"
            />
          </a-form-model-item>
        </a-col>
        <a-col :span="10">
          <a-form-model-item label="联系人姓名" prop="contactName">
            <a-input
              placeholder="请输入联系人姓名"
              v-model="saveObject.contactName"
            />
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row justify="space-between" type="flex">
        <a-col :span="10">
          <a-form-model-item label="联系人邮箱" prop="contactEmail">
            <a-input
              placeholder="请输入联系人邮箱"
              v-model="saveObject.contactEmail"
            >
            </a-input>
          </a-form-model-item>
        </a-col>
        <a-col :span="10">
          <a-form-model-item label="联系人手机号" prop="contactTel">
            <a-input
              placeholder="请输入联系人手机号"
              v-model="saveObject.contactTel"
            >
            </a-input>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row justify="space-between" type="flex">
        <a-col :span="10" style="position:relative">
          <a-form-model-item label="商户类型" prop="type">
            <!-- 商户类型 气泡弹窗 -->
            <a-radio-group v-model="saveObject.type" :disabled="this.isAdd?false:true">
              <a-radio :value="1">
                普通商户
              </a-radio>
              <a-radio :value="2">
                特约商户
              </a-radio>
            </a-radio-group>
          </a-form-model-item>
          <div id="components-popover-demo-placement">
            <div
              class="typePopover"
            >
              <!-- title可省略，就不显示 -->
              <a-popover placement="top">
                <template slot="content">
                  <p>普通商户是指商户自行申请入驻微信或支付宝，无服务商协助，单独调接口。</p>
                  <p>特约商户是指由微信或支付宝的服务商协助商户完成入驻，商户下单走的是服务商接口。</p>
                </template>
                <template slot="title">
                  <span>商户类型</span>
                </template>
                <a-icon type="question-circle" />
              </a-popover>
            </div>
          </div>
        </a-col>
        <a-col :span="10" v-if="saveObject.type == 2">
          <a-form-model-item label="服务商号" prop="isvNo">
            <a-select v-model="saveObject.isvNo" placeholder="请选择服务商">
              <a-select-option v-for="d in isvList" :value="d.isvNo" :key="d.isvNo">
                {{ d.isvName + " [ ID: " + d.isvNo + " ]" }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="10">
          <a-form-model-item label="状态" prop="state">
            <a-radio-group v-model="saveObject.state">
              <a-radio :value="1">
                启用
              </a-radio>
              <a-radio :value="0">
                禁用
              </a-radio>
            </a-radio-group>
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row justify="space-between" type="flex">
        <a-col :span="24">
          <a-form-model-item label="备注" prop="remark">
            <a-input v-model="saveObject.remark" placeholder="请输入备注" type="textarea" />
          </a-form-model-item>
        </a-col>
      </a-row>

      <!-- 重置密码板块 -->
      <a-row justify="space-between" type="flex">
        <a-col :span="24">
          <a-divider orientation="left" v-if="resetIsShow">
            <a-tag color="#FF4B33">
              账户安全
            </a-tag>
          </a-divider>
        </a-col>
      </a-row>
      <div>
        <a-row justify="space-between" type="flex">
          <a-col :span="10">
            <a-form-model-item label="" v-if="resetIsShow" >
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
        <!-- <div v-else> -->
        <div v-show="!this.sysPassword.defaultPass">
          <a-row justify="space-between" type="flex">
            <a-col :span="10">
              <a-form-model-item label="新密码：" prop="newPwd">
                <a-input-password autocomplete="new-password" v-model="newPwd" :disabled="sysPassword.defaultPass"/>
              </a-form-model-item>
            </a-col>

            <a-col :span="10">
              <a-form-model-item label="确认新密码：" prop="confirmPwd">
                <a-input-password autocomplete="new-password" v-model="sysPassword.confirmPwd" :disabled="sysPassword.defaultPass"/>
              </a-form-model-item>
            </a-col>
          </a-row>
        </div>
      </div>

    </a-form-model>
    <div class="drawer-btn-center" >
      <a-button icon="close" :style="{ marginRight: '8px' }" @click="onClose" style="margin-right:8px">
        取消
      </a-button>
      <a-button type="primary" icon="check" @click="handleOkFunc" :loading="btnLoading">
        保存
      </a-button>
    </div>
  </a-drawer>

</template>

<script>
import { API_URL_MCH_LIST, API_URL_ISV_LIST, req } from '@/api/manage'
import { Base64 } from 'js-base64'
export default {

  props: {
    callbackFunc: { type: Function }
  },

  data () {
    const checkIsvNo = (rule, value, callback) => { // 校验类型为特约商户是否选择了服务商
      if (this.saveObject.type === 2 && !value) {
        callback(new Error('请选择服务商'))
      }
      callback()
    }
    return {
      newPwd: '', //  新密码
      resetIsShow: false, // 重置密码是否展现
      sysPassword: {
        resetPass: false, // 重置密码
        defaultPass: true, // 使用默认密码
        confirmPwd: '' //  确认密码
      },
      btnLoading: false,
      isAdd: true, // 新增 or 修改页面标志
      saveObject: {}, // 数据对象
      recordId: null, // 更新对象ID
      visible: false, // 是否显示弹层/抽屉
      isvList: null, // 服务商下拉列表
      rules: {
        mchName: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
        loginUserName: [{ required: true, pattern: /^[a-zA-Z][a-zA-Z0-9]{5,17}$/, message: '请输入字母开头，长度为6-18位的登录名', trigger: 'blur' }],
        mchShortName: [{ required: true, message: '请输入商户简称', trigger: 'blur' }],
        contactName: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
        isvNo: [{ validator: checkIsvNo, trigger: 'blur' }],
        contactEmail: [{ required: false, pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/, message: '请输入正确的邮箱地址', trigger: 'blur' }],
        contactTel: [{ required: true, pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }],
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
    show: function (recordId) { // 弹层打开事件
      this.isAdd = !recordId
      this.saveObject = { 'state': 1, 'type': 1 } // 数据清空
      if (this.$refs.infoFormModel !== undefined) {
        this.$refs.infoFormModel.resetFields()
      }
      const that = this
      req.list(API_URL_ISV_LIST, { 'pageSize': -1, 'state': 1 }).then(res => { // 服务商下拉选择列表
        that.isvList = res.records
      })
      if (!this.isAdd) { // 修改信息 延迟展示弹层
        console.log(555)
        that.resetIsShow = true // 展示重置密码板块
        that.recordId = recordId
        req.getById(API_URL_MCH_LIST, recordId).then(res => {
          that.saveObject = res
        })
        this.visible = true
      } else {
        that.visible = true // 立马展示弹层信息
      }
    },
    handleOkFunc: function () { // 点击【确认】按钮事件
        const that = this
        this.$refs.infoFormModel.validate(valid => {
          if (valid) { // 验证通过
            // 请求接口
            if (that.isAdd) {
              this.btnLoading = true
              req.add(API_URL_MCH_LIST, that.saveObject).then(res => {
                that.$message.success('新增成功')
                that.visible = false
                that.callbackFunc() // 刷新列表
                that.btnLoading = false
              }).catch(res => {
                that.btnLoading = false
              })
            } else {
              that.sysPassword.confirmPwd = Base64.encode(that.sysPassword.confirmPwd)
              console.log(that.sysPassword.confirmPwd)
              Object.assign(that.saveObject, that.sysPassword) // 拼接对象
              console.log(that.saveObject)
              req.updateById(API_URL_MCH_LIST, that.recordId, that.saveObject).then(res => {
                that.$message.success('修改成功')
                that.visible = false
                that.callbackFunc() // 刷新列表
                that.btnLoading = false
                that.resetIsShow = true // 展示重置密码板块
                that.sysPassword.resetPass = false
                that.sysPassword.defaultPass = true	// 是否使用默认密码默认为true
                that.resetPassEmpty(that) // 清空密码
              }).catch(res => {
                that.btnLoading = false
                that.resetIsShow = true // 展示重置密码板块
                that.sysPassword.resetPass = false
                that.sysPassword.defaultPass = true	// 是否使用默认密码默认为true
                that.resetPassEmpty(that) // 清空密码
              })
            }
          }
        })
    },
    onClose () {
      this.visible = false
      this.resetIsShow = false // 取消重置密码板块展示
      this.sysPassword.resetPass = false
      this.resetPassEmpty(this)
      this.sysPassword.defaultPass = true	// 是否使用默认密码默认为true
    },
    searchFunc: function () { // 点击【查询】按钮点击事件
      this.$refs.infoTable.refTable(true)
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
<style lang="less">
  .typePopover {
    position: absolute;
    top: 0;
    left:62px;
  }
</style>
