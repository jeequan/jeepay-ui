<template>
  <div style="padding-bottom: 50px">
    <p v-if="vdata.hasEnt">请选择权限：</p>
    <!-- 树状结构 -->
    <a-tree
      :tree-data="vdata.treeData"
      :fieldNames="vdata.replaceFields"
      v-model:checkedKeys="vdata.checkedKeys"
      :checkable="true"
    />
  </div>
</template>

<script setup lang="ts">
import { getEntTree, API_URL_ROLE_ENT_RELA_LIST, req } from '@/api/manage'
import { reactive, getCurrentInstance } from 'vue'

const { $infoBox, $access } = getCurrentInstance()!.appContext.config.globalProperties

const vdata = reactive({
  hasEnt: $access('ENT_UR_ROLE_DIST'),
  recordId: null, // 更新对象ID
  treeData: [],
  replaceFields: { key: 'entId', title: 'entName' }, // 配置替换字段
  checkedKeys: [], // 已选中的节点
  allEntList: {}, // 由于antd vue关联操作，无法直接获取到父ID, 需要内部自行维护一套数据结构 {entId: {pid, children}}
})

function initTree(recordId) {
  // 弹层打开事件

  // 判断是否有权限访问
  if (!vdata.hasEnt) {
    return false
  }

  // 重置数据
  vdata.checkedKeys = []
  vdata.treeData = []
  vdata.allEntList = {}

  vdata.recordId = recordId
  // 获取全部权限的树状结构
  getEntTree().then((res) => {
    vdata.treeData = res

    // 存储所有的菜单权限集合
    recursionTreeData(res, (item) => {
      vdata.allEntList[item.entId] = { pid: item.pid, children: item.children || [] }
    })

    // 查询所有的已分配的权限集合 (默认为 0 ， 无数据)
    req
      .list(API_URL_ROLE_ENT_RELA_LIST, { roleId: recordId || 'NONE', pageSize: -1 })
      .then((res2) => {
        const checkedEntIdList: any = [] // 所有已分配的权限集合（兼容antd vue 仅保留子节点）

        res2.records.map((item) => {
          if (vdata.allEntList[item.entId] && vdata.allEntList[item.entId].children.length <= 0) {
            // 说明是子节点
            checkedEntIdList.push(item.entId)
          }
        })

        vdata.checkedKeys = checkedEntIdList
      })
  })
}

function getSelectedEntIdList() {
  // 获取已选择的列表集合
  // 判断是否有权限访问
  if (!vdata.hasEnt) {
    return false
  }
  const reqData: any = []

  vdata.checkedKeys.map((item) => {
    const pidList = [] // 当前权限的所有的父节点IDList
    getAllPid(item, pidList)
    pidList.map((pid) => {
      if (reqData.indexOf(pid) < 0) {
        reqData.push(pid)
      }
    })
  })
  return reqData
}
// 递归遍历树状结构数据
function recursionTreeData(entTreeData, func) {
  for (let i = 0; i < entTreeData.length; i++) {
    const thisEnt = entTreeData[i]
    if (thisEnt.children && thisEnt.children.length > 0) {
      recursionTreeData(thisEnt.children, func)
    }
    func(thisEnt)
  }
}
function getAllPid(entId, array) {
  // 获取所有的PID
  if (vdata.allEntList[entId] && entId !== 'ROOT') {
    array.push(entId)
    getAllPid(vdata.allEntList[entId].pid, array)
  }
}

defineExpose({ initTree, getSelectedEntIdList })
</script>
