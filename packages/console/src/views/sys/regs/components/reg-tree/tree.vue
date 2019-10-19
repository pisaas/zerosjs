<template>
  <div class="cmpt-reg-tree">
    <div class="tree-top">
      <span class="q-ml-sm">注册</span>
    </div>
    <div class="tree-container">
      <Tree :data="treeItems" :load-data="loadItems" :render="treeNodeRender"
          @on-add="onAdd" @on-edit="onEdit" @on-remove="onRemove"
          @on-select="onSelect"></Tree>
    </div>
    
    <reg-editor-modal ref="editorModal" @on-create="onEditorCreate" @on-update="onEditorUpdate" />
  </div>
</template>

<script>
import TreeCell from './tree-cell'
import { RegEditorModal } from '../reg-editor'

export default {
  components: {
    RegEditorModal
  },

  props: {
  },

  data () {
    return {
      currentReg: null,
      currentNode: null,
      treeItems: [],
    }
  },

  computed: {
  },

  mounted () {
    this.loadRoot()
  },

  methods: {
    onSelect (e) {
      this.currentNode = e.target
      let { data } = e.target
      
      this.currentReg = data

      this.$emit('on-node-select', this.currentReg)
    },

    onAdd (e) {
      this.currentNode = e.target

      let { data } = e.target
      this.$refs.editorModal.create(data.id)
    },

    onEdit (e) {
      this.currentNode = e.target

      let { data } = e.target
      this.$refs.editorModal.update(data.id)
    },

    onRemove (e) {
      let { root, node, data } = e.target

      if (data.children && data.children.length) {
        this.$app.alert('当前节点存在子节点，请删除所有子节点再进行删除。')
        return
      }

      this.$app.confirm({
        title: '删除节点',
        content: '<p>删除后将无法恢复，请谨慎操作！确认删除？</p>',
        onOk: () => {
          this.removeItem({ root, node, data })
        }
      })
    },

    onEditorCreate (res) {
      this.$refs.editorModal.close()

      if (!this.currentNode) {
        return
      }

      // 重新加载父节点下所有子节点
      let curNode = this.currentNode
      let { root, node, data } = curNode

      this.loadChildren(data.id).then((items) => {
        curNode.data.children = items

        this.reloadNode({ root, node, data }).then(() => {
          curNode.treeNode.handleExpand()
        })
      })
    },

    onEditorUpdate () {
      this.$refs.editorModal.close()

      let { root, node, data } = this.currentNode
      
      // 更新当前节点数据
      this.reloadNode({ root, node, data })
    },

    async removeItem ({ root, node, data }) {
      let regService = this.$service('regs')

      await regService.remove(data.id)

      const parent = this.getParentData({ root, node })

      const index = parent.children.indexOf(data)
      parent.children.splice(index, 1)
      this.currentNode = null

      // 刷新父节点
      await this.reloadNode({ root, data: parent })
    },

    async loadItems (item, callback) {
      let items = await this.loadChildren(item.id)
      
      callback(items)
    },

    async loadChildren (pid) {
      let regService = this.$service('regs')

      let regData = await regService.find({ query: { pid } })
      
      let items = this.toTreeItems(regData)

      if (!items || !items.length) {
        items = [{ __empty: true }]
      }

      return items
    },

    async loadRoot () {
      let regService = this.$service('regs')

      let regData = await regService.find()
      let items = this.toTreeItems(regData)

      this.treeItems = items
    },

    async reloadNode (params) {
      // 更新当前节点数据
      let { root, node, data } = params

      if (!node) {
        node = root.find(it => it.nodeKey === data.nodeKey)
      }

      const parent = this.getParentData({ root, node })

      if (!parent) {
        this.$emit('on-node-change', data)
        return
      }

      const index = parent.children.indexOf(data)

      let item = await this.loadItem(data.id)
      item.expand = data.expand
      item.children = data.children
      parent.children[index] = item

      // 对parent children排序
      let items = this.sortItems(parent.children)

      this.$set(parent, 'children', items)
      
      this.currentReg = item

      this.$emit('on-node-change', item)
    },

    async loadItem (id) {
      let regService = this.$service('regs')

      let res = await regService.get(id)
      let item = this.toTreeItem(res)
      return res
    },

    getParentData ({ root, node }) {
      const parentKey = root.find(it => it === node).parent

      const parentNode = root.find(it => it.nodeKey === parentKey)

      if (!parentNode) {
        return null
      }
      
      return parentNode.node
    },

    toTreeItems (regData) {
      let regItems = regData.data || []
      
      let treeItems = regItems.map((it) => {
        let item = this.toTreeItem(it)
        return item
      })

      return treeItems
    },

    toTreeItem (regItem) {
      let item = Object.assign({}, regItem)

      let isLeaf = (regItem.leaf === true)

      if (!isLeaf) {
        item.loading = false
        item.children = item.children || []
      }

      return item
    },

    sortItems (items) {
      if (!items || !items.length) {
        return []
      }

      items.sort((a, b) => {
        if (a.sn > b.sn) {
          return 1
        } else if (a.sn < b.sn) {
          return -1
        }

        if (a.id > b.id) {
          return 1
        } else if (a.id < b.id) {
          return -1
        }

        return 0
      })

      return items
    },

    treeNodeRender (h, { root, node, data }) {
      return h(TreeCell, { props: { root, node, data } })
    }
  }
}
</script>

<style lang="less" scoped>
.cmpt-reg-tree {
  color: white;
}

.tree-top {
  display: flex;
  align-items: center;
  color: white;
  font-size: 16px;
  padding: 10px 40px;
}
</style>

<style lang="less">
.cmpt-reg-tree {
  .ivu-tree ul li {
    margin: 5px 0;
  }
}
</style>