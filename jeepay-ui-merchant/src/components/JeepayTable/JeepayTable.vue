<!--
  Jeepay 通用表格, 支持基础分页， 检索

  @author terrfly
  @site https://www.jeepay.vip
  @date 2021/5/8 07:18
-->
<template>
  <div>
    <a-table
      :columns="tableColumns"
      :data-source="apiResData.records"
      :pagination="pagination"
      :loading="showLoading"
      @change="handleTableChange"
      :row-selection="rowSelection"
      :rowKey="rowKey"
      :scroll="{ x: scrollX }"
    >
      <!-- 自定义列插槽， 参考：https://github.com/feseed/admin-antd-vue/blob/master/src/components/ShTable.vue  -->
      <!--  eslint-disable-next-line -->
      <template v-for="colCustom in columnsCustomSlots" :slot="colCustom.customRender" slot-scope="record">
        <slot :name="colCustom.customRender" :record="record"></slot>
      </template>
    </a-table>
  </div>
</template>
<script>

export default {

  name: 'JeepayTable', // 定义组件名称

  // 传递数据参数 ( 父-->子 参数 )
  props: {
    initData: { type: Boolean, default: true }, // 初始化列表数据， 默认true
    tableColumns: Array, // 表格数组列
    reqTableDataFunc: { type: Function }, // 请求列表数据
    currentChange: { type: Function, default: (v1, v2) => {} }, // 更新当前选择行事件， 默认空函数
    searchData: Object, // 搜索条件参数
    pageSize: { type: Number, default: 10 }, // 默认每页条数
    rowSelection: Object, // checkbox选择
    rowKey: { type: [String, Function] }, // 定义rowKey 如果不定义将会出现（树状结构出问题， checkbox不消失等）
    scrollX: { type: Number, default: 980 } // 定义表格的最小宽度，在小就会出现横向的滚动条
  },

  data () {
    return {
      apiResData: { total: 0, records: [] }, // 接口返回数据
      iPage: { pageNumber: 1, pageSize: this.pageSize }, // 默认table 分页/排序请求后端格式
      pagination: { total: 0, current: 1, pageSize: this.pageSize, showSizeChanger: true, showTotal: total => `共${total}条` }, // ATable 分页配置项
      showLoading: false
    }
  },
  // 计算属性
  computed: {
    columnsCustomSlots () { // 自定义列插槽  1. 过滤器仅获取到包含slot属性的元素， 2. 返回slot数组
      return this.tableColumns.filter(item => item.scopedSlots).map(item => item.scopedSlots)
    }
  },
  mounted () {
    if (this.initData) { // 是否自动加载数据
      this.refTable(true)
    }
  },
  methods: {
    handleTableChange (pagination, filters, sorter) { // 分页、排序、筛选变化时触发
      this.pagination = pagination
      this.iPage = {
        pageSize: pagination.pageSize, // 每页条数
        pageNumber: pagination.current, // 当前页码
        sortField: sorter.columnKey, // 排序字段
        sortOrder: sorter.order, // 排序顺序
        ...filters // 过滤数据
      }
      this.refTable()
    },

    // 查询数据
    refTable (isToFirst = false) {
      const that = this
      if (isToFirst) {
        this.iPage.pageNumber = 1
        this.pagination.current = 1
      }
      // 更新检索数据
      this.showLoading = true
      this.reqTableDataFunc(Object.assign({}, this.iPage, this.searchData)).then(resData => {
        this.pagination.total = resData.total // 更新总数量
        this.apiResData = resData // 列表数据更新
        this.showLoading = false // 关闭loading

        // 数据为0 ，并且为当前页面没有在第一页则需要自动跳转到上一页（解决，删除第二页数据全部删除后无数据的情况 ）
        if (resData.records.length === 0 && this.iPage.pageNumber > 1) {
          that.$nextTick(() => {
            // 最大页码
            const maxPageNumber = (resData.total / this.iPage.pageSize) + ((resData.total % this.iPage.pageSize) === 0 ? 0 : 1)
            if (maxPageNumber === 0) { // 已经无数据
              return false
            }

            // 跳转到的页码
            const toPageSize = (this.iPage.pageNumber - 1) > maxPageNumber ? maxPageNumber : (this.iPage.pageNumber - 1)

            this.iPage.pageNumber = toPageSize
            this.pagination.current = toPageSize
            that.refTable(false)
          })
        }
        // 请求成功后，关闭查询按钮的loading
        that.$emit('btnLoadClose')
      }).catch(res => {
        this.showLoading = false
        that.$emit('btnLoadClose')
      }) // 关闭loading
    }
  }
}
</script>
