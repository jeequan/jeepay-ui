<template>
  <div>
    <header class="header">
      <div class="header-text">付款给{{ payOrderInfo.mchName }}</div>
      <div class="header-img">
        <img :src="avatar ? avatar : icon_member_default" alt="" />
      </div>
    </header>
    <div class="plus-input">
      <!-- ￥字符 货币的符号-->
      <div class="S">
        <img src="../../assets/icon/S.svg" alt="" />
      </div>

      <!-- 输入框光标 -->
      <!-- <div class="ttt">
        <div
          class="input-c-div"
          style="background: #07c160"
        ></div>
      </div> -->

      <!-- 手写输入框 -->
      <div  class="input-c"  style="width: 100%">
        <div  v-if="payOrderInfo.amount" class="input-c-div-1">{{ payOrderInfo.amount/100 }}</div>
        <input style="height: 120px;"  type="number" v-else v-model="amount" placeholder="请输入金额">
        <!-- 数字金额后边的光标 -->
        <!-- <div class="input-c-div" style="background:#07c160"></div> -->
      </div>
      <!-- 手写输入框的提示文字 -->
      <!-- <div v-show="!amount" class="placeholder">请输入金额</div> -->
    </div>
    <ul class="plus-ul" >
      <!-- 支付板块 -->
      <li
        style="border-radius:10px;"
      >
        <!-- 支付金额板块 -->
        <div class="img-div">
          <img :src="wxImg" alt="" />
          <div class="div-text">
            微信支付
          </div>
        </div>
      </li>
    </ul>
    <!-- 备注板块 ，目前不需要添加备注，隐藏-->
    <!-- <div class="remark-k" :class="payType != 'wx' ? 'margin-top-30' : ''">
      <div class="remark">
        <div class="remark-hui" v-show="remark">{{ remark }}</div>
        <div @click="myDialogStateFn">{{ remark ? "修改" : "添加备注" }}</div>
      </div>
    </div> -->
    <!-- dialog 对话框 目前不需要添加备注，隐藏-->
    <!-- <MyDialog
      v-show="myDialogState"
      @myDialogStateFn="myDialogStateFn"
      :remark="remark"
    >
    </MyDialog> -->

    <!-- 键盘板块 目前不需要键盘 隐藏 -->
    <!-- <div class="keyboard-plus" v-if="isAllowModifyAmount">
      <Keyboard
        @delTheAmount="delTheAmount"
        @conceal="conceal"
        @enterTheAmount="enterTheAmount"
        @payment="payment"
        :money="money"
        :concealSate="concealSate"
        :typeColor="typeColor[payType]"
      ></Keyboard>
    </div> -->

    <!-- jeepay中，付款的点击事件 由 payment 修改为 pay  -->
    <!-- jeepay中，付款页面是唯一的，颜色不在需要v-bind，去掉即可 -->
    <!-- <div class="bnt-pay" v-if="!isAllowModifyAmount"> -->
    <div class="bnt-pay">
      <div
        class="bnt-pay-text"
        style="background-color:#07c160"
        @click="pay"
      >
        付款
      </div>
    </div>
  </div>
</template>

<script>
// import MyDialog from "./../dialog/dialog";  // 添加备注弹出的对话框
// import Keyboard from "./../keyboard/keyboard";  // 手写键盘
import {getPayPackage, getPayOrderInfo }from '@/api/api'
import config from "@/config";
export default {
  // 注册备注对话框，和 手写键盘组件，由于这里是直接掉起支付事件，所以目前不应用
  // components: { MyDialog, Keyboard },
  data: function (){
    return {
      merchantName: 'jeepay',  // 付款的商户默认
      avatar: require("../../assets/icon/wx.svg"), // 商户头像默认
      amount: null,  // 支付金额默认
      resData : {},
      wxImg: require("../../assets/icon/wx.svg"), // 微信支付图片
      payOrderInfo: {}, //订单信息
    }
  },

  mounted() {
    this.setPayOrderInfo(); //获取订单信息 & 调起支付插件
  },

  methods: {

    setPayOrderInfo(){
      const that = this
      getPayOrderInfo().then(res => {
        that.payOrderInfo = res

        if(res.amount){
          this.amount = res.amount / 100;
          that.pay()
        }

      }).catch(res => {
        that.$router.push({name: config.errorPageRouteName, params: {errInfo: res.msg}})
      });
    },

    // 支付事件
    pay: function (){

      if(isNaN(this.amount) || this.amount <= 0){
        return alert('请输入金额');
      }

      // 该函数执行效果慢
      let that = this;
      getPayPackage(this.amount).then(res => {

        if(res.code != '0') {
          return alert(res.msg);
        }

        if(res.data.orderState != 1 ) { //订单不是支付中，说明订单异常
          return alert(res.data.errMsg);
        }

        that.resData = res.data;
        if (typeof WeixinJSBridge == "undefined"){
          if( document.addEventListener ){
            document.addEventListener('WeixinJSBridgeReady', that.onBridgeReady, false);
          }else if (document.attachEvent){
            document.attachEvent('WeixinJSBridgeReady', that.onBridgeReady);
            document.attachEvent('onWeixinJSBridgeReady', that.onBridgeReady);
          }
        }else{
          that.onBridgeReady();
        }

      }).catch(res => {
        that.$router.push({name: config.errorPageRouteName, params: {errInfo: res.msg}})
      });
    },


    /* 唤醒微信支付*/
    onBridgeReady() {

      let that = this;

      // eslint-disable-next-line no-undef
      WeixinJSBridge.invoke(
          'getBrandWCPayRequest', JSON.parse(that.resData.payInfo),
          function(res) {
            if (res.err_msg == "get_brand_wcpay_request:ok") {
              // 使用以上方式判断前端返回,微信团队郑重提示：
              //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
              // //重定向
              if(that.payOrderInfo.returnUrl){
                location.href = that.payOrderInfo.returnUrl;
              }else{
                alert('支付成功！');
                window.WeixinJSBridge.call('closeWindow')
              }

            }
            if (res.err_msg == "get_brand_wcpay_request:cancel") {
              alert("支付取消");
              window.WeixinJSBridge.call('closeWindow')
            }
            if (res.err_msg == "get_brand_wcpay_request:fail") {
              alert('支付失败:' + JSON.stringify(res))
              window.WeixinJSBridge.call('closeWindow')
            }
            if (res.err_msg == "total_fee") {
              alert('缺少参数')
              window.WeixinJSBridge.call('closeWindow')
            }
          }
      );
    },

  }


}
</script>
<style lang="css" scoped>
 @import './pay.css';
</style>