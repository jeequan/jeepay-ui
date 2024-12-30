<template>
  <div style="padding: 30px">
    <!-- 操作行： 包括了新增等按钮 和 自动刷新等操作 -->
    <div class="but_auto">
      <div class="left_but">
        <slot name="opRow" />
        <!-- 插入左上角操作行 -->
      </div>
      <div class="auto_refre">
        <div v-if="autoRefTableConfig">
          <span style="margin-right: 10px; color: #a9b3b1">
            自动刷新：
            <span style="margin-right: 5px; color: #000">{{ autoRefTableSubTime }}s</span>
          </span>
          <div>
            <a-switch
              v-model:checked="autoRefTableBtnState"
              @change="autoRefTableBtnStateChangeFunc"
            />
          </div>
        </div>
        <div>
          <a-dropdown v-model:open="open">
            <!-- <a class="ant-dropdown-link" @click.prevent>
              选择列
              <DownOutlined />
            </a> -->
            <div class="changerow">
              <i class="bi bi-list" />
            </div>
            <template #overlay>
              <a-menu>
                <template v-for="(item, index) in tableColumns" :key="index">
                  <a-menu-item>
                    <a-checkbox v-model:checked="item.jeepayTableShow">
                      {{ item.title }}
                    </a-checkbox>
                  </a-menu-item>
                </template>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </div>
    <div>
      <!-- 统计数据展示 -->
      <slot name="data-view" />
    </div>
    <a-table
      :data-source="apiResData.records"
      :columns="tableColumns.filter((r) => r.jeepayTableShow)"
      :pagination="pagination"
      :loading="showLoading"
      :row-selection="rowSelection"
      :row-key="rowKey"
      @resize-column="
        (w, col) => {
          col.width = w
        }
      "
      @change="handleTableChange"
    >
      <template #bodyCell="{ text, record, index, column }">
        <slot name="bodyCell" :text="text" :record="record" :index="index" :column="column" />
      </template>
      <template #headerCell="{ title, column }">
        <slot name="headerCell" :title="title" :column="column" />
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { reactive, defineProps, onMounted, nextTick, ref, onUnmounted } from 'vue'

const emit = defineEmits(['btnLoadClose'])

//菜单关闭打开
const open = ref(false)

// 定义传入属性
const props: any = defineProps({
  columnResizable: { type: Boolean, default: true },
  tableColumns: { type: Array as any, default: () => [] },
  reqTableDataFunc: { type: Function, default: () => {} },
  searchData: { type: Object, default: () => {} }, // 搜索条件参数
  pageSize: { type: Number, default: 10 }, // 默认每页条数
  initData: { type: Boolean, default: true }, // 初始化列表数据， 默认true
  autoRefTableConfig: { type: Object, default: null }, // {defaultOpen: true, interval: 10}
  rowSelection: { type: Object, default: null },
  rowKey: { type: [String, Function], default: () => {} }, // 定义rowKey 如果不定义将会出现（树状结构出问题， checkbox不消失等）
})

// 自动刷新： 开启，关闭状态
let autoRefTableBtnState = ref(false) //默认关闭
let autoRefTableSubTime = ref(10) //剩余时间
let autoRefTableTimeoutObject: any = null // 自动刷新表格的setTimeOut对象，当前组件唯一

// 定义组件内变量
let iPage = { pageNumber: 1, pageSize: props.pageSize } // 默认table 分页/排序请求后端格式
let pagination = reactive({
  total: 0,
  current: 1,
  pageSize: props.pageSize,
  showTotal: (total) => `共${total}条`,
}) // ATable 分页配置项
let showLoading = ref(false) // loading效果
let apiResData = reactive({ total: 0, records: [] }) // 接口返回数据

onMounted(() => {
  props.tableColumns.forEach((item) => {
    item.jeepayTableShow = true // 默认全部显示
    if (props.columnResizable) {
      item.resizable = true // 自动添加列可拖拽效果
    }
  })

  if (props.initData) {
    // 是否自动加载数据

    refTable(true)
  }

  if (props.autoRefTableConfig) {
    autoRefTableBtnState.value = props.autoRefTableConfig.defaultOpen || false
    autoRefTableSubTime.value = props.autoRefTableConfig.interval || 10
  }

  // 自动刷新
  if (autoRefTableBtnState.value) {
    autoRefTableFunc()
  }
})

onUnmounted(() => {
  // 关闭定时器
  if (autoRefTableTimeoutObject) {
    clearTimeout(autoRefTableTimeoutObject)
  }
  autoRefTableBtnState.value = false
})

function autoRefTableFunc() {
  if (!autoRefTableBtnState.value) {
    return false
  }

  autoRefTableTimeoutObject = setTimeout(() => {
    let subTime = autoRefTableSubTime.value - 1
    if (subTime <= 0) {
      refTable(true).then(() => {
        autoRefTableSubTime.value = props.autoRefTableConfig.interval || 10
        autoRefTableFunc()
      })
    } else {
      autoRefTableSubTime.value = subTime
      autoRefTableFunc()
    }
  }, 1000)
}

function autoRefTableBtnStateChangeFunc(state) {
  if (state) {
    autoRefTableFunc()
  } else {
    if (autoRefTableTimeoutObject) {
      clearTimeout(autoRefTableTimeoutObject)
    }
  }
}

// 查询数据
function refTable(isToFirst = false) {
  if (isToFirst) {
    iPage.pageNumber = 1
    pagination.current = 1
  }

  // 更新检索数据
  showLoading.value = true
  return props
    .reqTableDataFunc(Object.assign({}, iPage, props.searchData))
    .then((bizData) => {
      pagination.total = bizData.total // 更新总数量

      Object.assign(apiResData, bizData) // 列表数据更新

      showLoading.value = false // 关闭loading
      // 数据为0 ，并且为当前页面没有在第一页则需要自动跳转到上一页（解决，删除第二页数据全部删除后无数据的情况 ）
      if (bizData.length === 0 && iPage.pageNumber > 1) {
        // alert()

        nextTick(() => {
          // 最大页码
          const maxpageNumberber =
            bizData.total / iPage.pageSize + (bizData.total % iPage.pageSize === 0 ? 0 : 1)
          if (maxpageNumberber === 0) {
            // 已经无数据
            return false
          }

          // 跳转到的页码
          const toPageSize =
            iPage.pageNumber - 1 > maxpageNumberber ? maxpageNumberber : iPage.pageNumber - 1

          iPage.pageNumber = toPageSize
          pagination.current = toPageSize
          refTable(false)
        })
      }
      // 请求成功后，关闭查询按钮的loading
      emit('btnLoadClose')
    })
    .catch((res) => {
      showLoading.value = false
      emit('btnLoadClose')
    }) // 关闭loading
}

function handleTableChange(paginationParams, filters, sorter) {
  // 分页、排序、筛选变化时触发

  // 合并响应式数据
  Object.assign(pagination, paginationParams)
  iPage = {
    pageSize: pagination.pageSize, // 每页条数
    pageNumber: pagination.current, // 当前页码
    sortField: sorter.columnKey, // 排序字段
    sortOrder: sorter.order, // 排序顺序
    ...filters, // 过滤数据
  }
  refTable()
}

// 暴露出去  https://www.jianshu.com/p/39d14c25c987
defineExpose({
  refTable,
})
</script>

<style lang="less">
// 调整antdv 的table默认padding高度
.ant-table-content {
  // overflow: auto !important;
  tr {
    th {
      padding: 8px 8px !important;
    }
    th:first-child {
      // 第一个表格 左填充16， 其他为8
      padding-left: 16px !important;
    }
    td {
      padding: 8px 8px !important;
    }
    td:first-child {
      padding-left: 16px !important;
    }
  }
}
</style>

<style lang="less" scoped>
.but_auto {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  .auto_refre {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 15px;
    div:nth-child(1) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 3px 0 3px;
    }
    .changerow {
      margin-left: 5px;
      background: rgba(41, 102, 92, 0.07);
      padding: 8px 10px 8px 10px !important;
      border-radius: 5px;
      margin-top: 2px;
      &:hover {
        background: rgba(0, 204, 187, 0.15);
        i {
          color: rgba(0, 204, 187);
        }
      }
    }
  }
}
</style>
