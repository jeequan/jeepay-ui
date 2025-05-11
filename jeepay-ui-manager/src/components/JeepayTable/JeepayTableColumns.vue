<script lang="tsx">
import { h } from 'vue'
import JeeMenu from './JeepayMenu.vue'
import { MenuItem } from 'ant-design-vue'
import JeepayDrChildren from './JeepayDrChildren.vue'
// 将 v-if= false的过滤掉
function filterFunc(item) {
  return typeof item.type != 'symbol' // v-if =false type = symbol , 否则为 object
}

export default {
  setup(props, { slots, attrs, emit }) {
    // 20240522 @terrfly 解决 父组件动态更新了数量 而该Column还是按照原始的下拉方式进行展示的问题。
    // 原因为: 默认按照固定格式返回了渲染函数， 而vue不会重新执行setup而是会多次调用渲染函数， 所以渲染函数应该判断而不是setup .
    // https://cn.vuejs.org/guide/extras/render-function.html#declaring-render-function 请确保返回的是一个函数而不是一个值！setup() 函数在每个组件中只会被调用一次，而返回的渲染函数将会被调用多次。
    return () => {
      // 20220415 @terrfly修改， 解决不动态渲染的问题：
      // 查询所有可显示的 插槽元素，  注意： filterSlots 不可以在页面渲染使用， 仅仅作为判断使用
      // 注意！！ ：：   页面渲染只有直接使用slots.default() 才可以动态改变， 例如修改状态更新下拉按钮效果 ，  如果定义变量， 则不会动态渲染。
      const filterSlots = slots.default().filter(filterFunc)

      // 因为有可能存在多个子属性 所以不能用一级属性做判断 取出所有子属性 然后数组降维 判断长度
      if (filterSlots.map((v) => v.children).flat().length <= 2) {
        // 小于等于三个直接渲染
        return h(
          'div',
          { style: 'display:flex; justify-content: center;' },
          slots.default().filter(filterFunc) // 子节点数组
        )
      } else {
        // 下拉效果

        return (
          <div>
            {[slots.default().filter(filterFunc)[0]]}
            <JeeMenu>
              {slots
                .default()
                .filter(filterFunc)
                .filter((r, index) => index >= 1)
                .map((item: any) => {
                  if (item.type == 'dr-children' && item.children.length) {
                    const title = item.props.title
                    return (
                      <JeepayDrChildren title={title}>
                        {item.children
                          .filter((r) => r.props)
                          .map((v) => (
                            <MenuItem>{v}</MenuItem>
                          ))}
                      </JeepayDrChildren>
                    )
                  } else {
                    return <MenuItem>{item}</MenuItem>
                  }
                })}
            </JeeMenu>
          </div>
        )
      }
    }
  },
}
</script>
