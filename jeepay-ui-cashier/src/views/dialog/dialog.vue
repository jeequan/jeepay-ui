<!--
 * @Author: your name
 * @Date: 2020-12-23 09:04:09
 * @LastEditors: 王会峰
 * @LastEditTime: 2021-01-13 11:04:20
 * @FilePath: \pay\src\components\dialog\dialog.vue
 * @SendWord: 永无BUG vite⚡
-->
<template>
  <div class="dialog">
    <div class="dialog-box">
      <div class="dialog-remark">添加备注</div>
      <div class="dialog-input">
        <input
          type="text"
          placeholder="最多输入10个字"
          maxlength="10"
          v-model="remarkC2"
        />
      </div>
      <div class="dialog-bnt">
        <div class="dialog-bnt-l" @click="myDialogStateFn(false)">取消</div>
        <div class="dialog-bnt-r" @click="myDialogStateFn(true)">确认</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MyDialog",
  data() {
    return {
      //   remark: "",
      remarkC: "",
      remarkC2: "",
    };
  },
  props: {
    remark: {
      type: String,
      default: () => "",
    },
  },
  /*  mounted() {
      this.remarkC = this.remark
  }, */
  created() {
    this.remarkC = this.remark;
    this.remarkC2 = this.remark;
  },
  methods: {
    myDialogStateFn(remarkSate) {
      let remark = this.remarkC2;
      let remarkC = this.remarkC;
      this.$emit("myDialogStateFn", remarkSate ? remark + "" : remarkC + "");
      !remarkSate && (this.remarkC2 = remarkC);
      remarkSate && (this.remarkC = remark);
    },
  },
};
</script>
<style lang="css" scoped>
.dialog {
  z-index: 999;
  top: 0;
  left: 0;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
}
.dialog-box {
  width: 600px;
  height: 359px;
  background: #ffffff;
  border-radius: 15px;
  padding: 50px 0;
}
.dialog-remark {
  width: 100%;
  height: 46px;
  font-size: 33px;
  font-family: PingFang SC, PingFang SC-Bold;
  font-weight: 700;
  text-align: center;
  color: #000000;
}
.dialog-input {
  margin: 50px auto;
  width: 510px;
  height: 60px;
  border-bottom: 1px solid #cccccc;
}
.dialog-input input {
  margin-bottom: 5px;
  width: 100%;
  height: 46px;
  font-size: 33px;
  font-family: PingFang SC, PingFang SC-Regular;
  font-weight: 400;
  text-align: left;
  border: none;
  outline: none;
}

.dialog-bnt {
  display: flex;
  justify-content: space-between;
  width: 100%;
  border-top: 1px solid #e5e5e5;
}
.dialog-bnt div {
  width: 50%;
  height: 100px;
  font-size: 30px;
  font-family: PingFang SC, PingFang SC-Medium;
  font-weight: 500;
  text-align: center;
  line-height: 100px;
}
.dialog-bnt-l {
  color: #b2b2b2;
  border-right: 1px solid #e5e5e5;
}
.dialog-bnt-r {
  /* border-left: 1px solid #e5e5e5; */
  color: #587cca;
}
</style>