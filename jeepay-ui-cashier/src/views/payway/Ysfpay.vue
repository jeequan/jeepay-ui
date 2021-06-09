<template>
  <div>
    <header class="header">
      <div class="header-text">付款给{{ merchantName }}</div>
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
        <div  class="input-c-div-1">{{ amount }}</div>
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
            云闪付支付
          </div>
        </div>
      </li>
    </ul>
    <div class="bnt-pay">
      <!-- <div
        class="bnt-pay-text"
        style="background-color:#ff534d"
        @click="pay"
      >
        付款
      </div> -->
    </div>
  </div>
</template>

<script>
import {getPayPackage}from '@/api/api'
import config from "@/config";
export default {

  data: function (){
    return {
      merchantName: 'jeepay',  // 付款的商户默认
      avatar: require("../../assets/images/ysf.jpg"), // 商户头像默认
      amount: 1,  // 支付金额默认
      resData : {},
      wxImg: require("../../assets/images/ysf.jpg") // 微信支付图片
    }
  },

  mounted() {
    // this.pay(); //自动调起
  },

  methods: {

    pay: function (){

      let that = this;
      getPayPackage(this.amount).then(res => {

        console.log(res)

        if (!window.AlipayJSBridge) {
          document.addEventListener('AlipayJSBridgeReady', function(){
            that.doAlipay(res.alipayTradeNo);
          }, false);
        }else{
          that.doAlipay(res.alipayTradeNo);
        }

      }).catch(res => {
        that.$router.push({name: config.errorPageRouteName, params: {errInfo: res.msg}})
      });
    },


    doAlipay(alipayTradeNo){

      // eslint-disable-next-line no-undef
      AlipayJSBridge.call("tradePay", {
        tradeNO: alipayTradeNo
      }, function (data) {
        if ("9000" == data.resultCode) {
          alert('支付成功！');
        }else{ //其他
        }
      });
    },

  }


}
</script>
<style lang="css" scoped>
 @import './pay.css';
</style>