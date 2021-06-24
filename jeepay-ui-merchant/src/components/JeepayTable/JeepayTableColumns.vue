<!--
  Jeepay 通用列，添加更多菜单项

  @author terrfly
  @site https://www.jeepay.vip
  @date 2021/5/8 07:18
-->
<script>
export default {
  name: 'JeepayTableColumns', // 定义组件名称
  render (createElement, context) {
    const slots = []
    this.$slots.default.map(item => {
      if (item.tag) {
        slots.push(item)
      }
      return false
    })
    if (slots.length <= 3) { // 小于等于三个直接渲染
      return createElement(
        'div',
        { style: 'display:flex; justify-content: space-evenly;' },
        slots // 子节点数组
      )
    } else {
      const firstEL = [slots[0], slots[1]]
      const menuEL = []
      for (let i = 2; i < slots.length; i++) {
        menuEL.push(<a-menu-item>{slots[i]}</a-menu-item>)
      }
      return <div style="display:flex; justify-content: space-evenly;"> {firstEL}
                  <a-dropdown>
                      <a-button style="line-height:32px" type="link" class="ant-dropdown-link">更多<a-icon type="down" /></a-button>
                      <a-menu slot="overlay">
                        {menuEL}
                      </a-menu>
                  </a-dropdown>
             </div>
    }
  }
}
</script>
