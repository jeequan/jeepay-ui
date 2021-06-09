<template>
  <div style="padding-bottom:50px">
    <p v-if="hasEnt">请选择权限： </p>
    <!-- 树状结构 -->
    <a-tree :tree-data="treeData" :replaceFields="replaceFields" v-model="checkedKeys" :checkable="true"/>
  </div>
</template>

<script>
import { getEntTree, API_URL_ROLE_ENT_RELA_LIST, req } from '@/api/manage'
export default {

  data () {
    return {
      hasEnt: this.$access('ENT_UR_ROLE_DIST'),
      recordId: null, // 更新对象ID
      treeData: [],
      replaceFields: { key: 'entId', title: 'entName' }, // 配置替换字段
      checkedKeys: [], // 已选中的节点
      allEntList: {} // 由于antd vue关联操作，无法直接获取到父ID, 需要内部自行维护一套数据结构 {entId: {pid, children}}
    }
  },
  methods: {

    initTree: function (recordId) { // 弹层打开事件
      const that = this

      // 判断是否有权限访问
      if (!this.hasEnt) {
        return false
      }

      // 重置数据
      that.checkedKeys = []
      that.treeData = []
      that.allEntList = {}

      that.recordId = recordId
      // 获取全部权限的树状结构
      getEntTree('MGR').then(res => {
        that.treeData = res

        // 存储所有的菜单权限集合
        this.recursionTreeData(res, (item) => {
          that.allEntList[item.entId] = { pid: item.pid, children: item.children || [] }
        })

        // 查询所有的已分配的权限集合 (默认为 0 ， 无数据)
        req.list(API_URL_ROLE_ENT_RELA_LIST, { roleId: recordId || 'NONE', pageSize: -1 }).then(res2 => {
          const checkedEntIdList = [] // 所有已分配的权限集合（兼容antd vue 仅保留子节点）

          res2.records.map(item => {
            if (that.allEntList[item.entId] && that.allEntList[item.entId].children.length <= 0) { // 说明是子节点
              checkedEntIdList.push(item.entId)
            }
          })

          that.checkedKeys = checkedEntIdList
        })
      })
    },

    getSelectedEntIdList: function () { // 获取已选择的列表集合
      // 判断是否有权限访问
      if (!this.hasEnt) {
        return false
      }
      const that = this
      const reqData = []

      this.checkedKeys.map(item => {
        const pidList = [] // 当前权限的所有的父节点IDList
        that.getAllPid(item, pidList)
        pidList.map(pid => {
          if (reqData.indexOf(pid) < 0) {
            reqData.push(pid)
          }
        })
      })
      return reqData
    },
    // 递归遍历树状结构数据
    recursionTreeData (entTreeData, func) {
      for (let i = 0; i < entTreeData.length; i++) {
        const thisEnt = entTreeData[i]
        if (thisEnt.children && thisEnt.children.length > 0) {
          this.recursionTreeData(thisEnt.children, func)
        }
        func(thisEnt)
      }
    },
    getAllPid (entId, array) { // 获取所有的PID
      if (this.allEntList[entId] && entId !== 'ROOT') {
        array.push(entId)
        this.getAllPid(this.allEntList[entId].pid, array)
      }
    }
  }
}
</script>
