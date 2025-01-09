<template>
  <a-row :gutter="[24, 24]" style="width: 100%">
    <!-- 卡片默认新增框 -->
    <a-col
      v-if="addAuthority"
      :xxl="24 / span.xxl"
      :xl="24 / span.xl"
      :lg="24 / span.lg"
      :md="24 / span.md"
      :sm="24 / span.sm"
      :xs="24 / span.xs"
      @click="$emit('addJeepayCard')"
    >
      <div class="jeepay-card-add" :style="{ height: height + 'px' }">
        <div class="jeepay-card-add-top">
          <img src="~@/assets/svg/add-icon.svg" alt="add-icon" class="jeepay-card-add-icon" />
          <img
            src="~@/assets/svg/add-icon-hover.svg"
            alt="add-icon"
            class="jeepay-card-add-icon-hover"
          />
        </div>
        <div class="jeepay-card-add-text">新建{{ name }}</div>
      </div>
    </a-col>
    <!-- 数据 -->
    <a-col
      v-for="(item, key) in vdata.cardList"
      :key="key"
      :xxl="24 / span.xxl"
      :xl="24 / span.xl"
      :lg="24 / span.lg"
      :md="24 / span.md"
      :sm="24 / span.sm"
      :xs="24 / span.xs"
    >
      <slot name="cardContentSlot" :record="item" />
      <slot name="cardOpSlot" :record="item" />
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const props = defineProps({
  span: { type: Object, default: () => ({ xxl: 6, xl: 4, lg: 4, md: 3, sm: 2, xs: 1 }) },
  height: { type: Number, default: 200 },
  name: { type: String, default: '' },
  addAuthority: { type: Boolean, default: false },
  reqCardListFunc: { type: Function, default: () => () => ({}) },
})

const vdata = reactive({
  cardList: [] as any,
})

function refCardList() {
  props.reqCardListFunc().then((resData) => {
    vdata.cardList = resData
  })
}
refCardList()

defineExpose({ refCardList })
</script>

<style lang="less" scoped>
.jeepay-card-add {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed rgba(0, 0, 0, 0.15);
  background: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  box-sizing: border-box;
  cursor: pointer;
}
.jeepay-card-add-top {
  width: 80px;
  height: 80px;
  position: relative;
}
.jeepay-card-add:hover {
  border-color: rgba(25, 83, 255, 0.3);
  background: rgba(25, 83, 255, 0.06);
  transition: all 0.3s ease-in-out;
}
.jeepay-card-add:hover .jeepay-card-add-icon {
  opacity: 0;
  transition: all 0.2s ease-in-out;
}
.jeepay-card-add:hover .jeepay-card-add-icon-hover {
  opacity: 1;
  transition: all 0.5s ease-in-out;
}
.jeepay-card-add:hover .jeepay-card-add-text {
  color: rgba(25, 83, 255, 1);
  transition: all 0.3s ease-in-out;
}
.jeepay-card-add-icon {
  position: absolute;
  width: 80px;
  height: 80px;
  opacity: 1;
}
.jeepay-card-add-icon-hover {
  position: absolute;
  width: 80px;
  height: 80px;
  opacity: 0;
}
.jeepay-card-add-text {
  padding-top: 5px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.35);
}
</style>
