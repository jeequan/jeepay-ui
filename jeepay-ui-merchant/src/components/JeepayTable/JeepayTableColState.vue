<!--
  Jeepay 通用状态切换按钮，  支持switch和badge两个格式， 根据权限进行判断

  @author terrfly
  @site https://www.jeepay.vip
  @date 2021/5/8 07:18
-->
<template>
  <div>

    <template v-if="!showSwitchType">
      <div v-if="state == 0" ><a-badge status="error" text="停用" /></div>
      <div v-else-if="state == 1" ><a-badge status="processing" text="启用" /></div>
      <div v-else ><a-badge status="warning" text="未知" /></div>
    </template>

    <template v-if="showSwitchType">
      <a-switch class="els" checked-children="启用" un-checked-children="停用" :checked="switchChecked" @change="onChangeInner" />
    </template>

  </div>
</template>

<script>
export default {
  name: 'JeepayTableColState', // 定义组件名称

  // 传递数据参数 ( 父-->子 参数 )
  props: {
    state: { type: Number, default: -1 }, // 初始化列表数据， 默认true
    showSwitchType: { type: Boolean, default: false }, // 默认 badge
    onChange: { type: Function, default: (checked) => { return new Promise(resolve => { resolve() }) } } // change回调事件
  },
  data: function () {
        return { switchChecked: false }
  },
  mounted () {
    this.switchChecked = this.state === 1
  },
  watch: {
    state: function (o, n) {
      this.switchChecked = this.state === 1
    }
  },
  methods: {
    onChangeInner: function (checked) {
      const that = this
      this.switchChecked = checked

      // 回调输出 0 和 1; 成功不需要处理， 失败需要经状态变更为原始状态
      this.onChange((checked ? 1 : 0)).then().catch(res => {
        that.$nextTick(() => { that.switchChecked = !checked })
      })
    }
  }
}
</script>
