<template>
  <div>
    <header class="header">
      <div class="header-text">付款给 {{ payOrderInfo.mchName }}</div>
      <div class="header-img">
        <img :src="avatar ? avatar : icon_member_default" alt="" />
      </div>
    </header>
    <div class="plus-input">
      <!-- ￥字符 货币的符号-->
      <div class="S">
        <img src="../../assets/icon/S.svg" alt="" />
      </div>

      <!-- 手写输入框 -->
      <div  class="input-c">
        <div  class="input-c-div-1">{{ payOrderInfo.amount/100 }}</div>
      </div>
      <!-- 手写输入框的提示文字 -->
      <div v-show="!amount" class="placeholder">请输入金额</div>
    </div>
    <ul class="plus-ul" >
      <!-- 支付板块 -->
      <li style="border-radius:10px;">
        <!-- 支付金额板块 -->
        <div class="img-div">
          <img :src="wxImg" alt="" />
          <div class="div-text">
            支付宝支付
          </div>
        </div>
      </li>
    </ul>
    <div class="bnt-pay">
      <div
        class="bnt-pay-text"
        style="background-color:#1678ff"
        @click="pay"
      >
        付款
      </div>
    </div>
  </div>
</template>

<script>
import { getPayPackage, getPayOrderInfo } from '@/api/api'
import config from "@/config";
export default {

  data: function (){
    return {
      merchantName: 'jeepay',  // 付款的商户默认
      avatar: require("../../assets/images/zfb.jpeg"), // 商户头像默认
      amount: 1,  // 支付金额默认
      resData : {},
      wxImg: require("../../assets/images/zfb.jpeg"), // 微信支付图片
      payOrderInfo: {}, //订单信息
    }
  },

  mounted() {
     this.setPayOrderInfo(true); //获取订单信息 & 调起支付插件
  },

  methods: {

    setPayOrderInfo(isAutoPay){
      const that = this
      getPayOrderInfo().then(res => {
        that.payOrderInfo = res

        if(isAutoPay){
          that.pay()
        }
      }).catch(res => {
        that.$router.push({name: config.errorPageRouteName, params: {errInfo: res.msg}})
      });
    },

    pay: function (){

      let that = this;
      getPayPackage(this.amount).then(res => {

        //订单创建异常
        if(res.code != '0') {
          return alert(res.msg);
        }

        if(res.data.orderState != 1 ) { //订单不是支付中，说明订单异常
          return alert(res.data.errMsg);
        }

        if (!window.AlipayJSBridge) {
          document.addEventListener('AlipayJSBridgeReady', function(){
            that.doAlipay(res.data.alipayTradeNo);
          }, false);
        }else{
          that.doAlipay(res.data.alipayTradeNo);
        }

      }).catch(res => {
        that.$router.push({name: config.errorPageRouteName, params: {errInfo: res.msg}})
      });
    },


    doAlipay(alipayTradeNo){

      const that = this

      // eslint-disable-next-line no-undef
      AlipayJSBridge.call("tradePay", {
        tradeNO: alipayTradeNo
      }, function (data) {
        if ("9000" == data.resultCode) {
          // alert('支付成功！');

          // //重定向
          if(that.payOrderInfo.returnUrl){
            location.href = that.payOrderInfo.returnUrl;
          }else{
            alert('支付成功！');
            window.AlipayJSBridge.call('closeWebview')
          }

          //‘8000’：后台获取支付结果超时，暂时未拿到支付结果;
        // ‘6004’：支付过程中网络出错， 暂时未拿到支付结果;
        }else if("8000" == data.resultCode || "6004" == data.resultCode){ //其他

          alert(JSON.stringify(data));
          window.AlipayJSBridge.call('closeWebview')

        }else{ ///其他异常信息， 需要取消订单
          alert('用户已取消！');
          window.AlipayJSBridge.call('closeWebview')
        }
      });
    },

  }


}
</script>
<style lang="css" scoped>
 @import './pay.css';
</style>