<template>
  <div class="sys-regs page-view">
    <Split v-model="splitRate" min="160px">
      <div slot="left" class="page-left">
        <Tree :data="treeItems" :load-data="loadItems" :render="treeNodeRender"
          @on-add="onAdd" @on-edit="onEdit" @on-remove="onRemove"></Tree>
      </div>
      <div slot="right" class="page-body">
        Right Pane
      </div>
    </Split>

    <reg-editor-modal ref="editorModal" @on-create="onEditorCreate" @on-update="onEditorUpdate" />
  </div>
</template>

<script>
import TreeCell from '../components/tree-cell'
import { RegEditorModal } from '../components/reg-editor'


export default {
  components: {
    RegEditorModal
  },

  data () {
    return {
      currentNode: null,
      treeItems: [],
      splitRate: 0.3,
    }
  },

  methods: {
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

    onReload (e) {
    },

    onRemove (e) {
      this.currentNode = e.target
      let { root, node, data } = e.target

      if (data.children && data.children.length) {
        this.$app.alert('当前节点存在子节点，请删除所有子节点再进行删除。')
        return
      }

      let regService = this.$service('regs')

      let treeNode = this.currentNode.treeNode

      regService.remove(data.id).then(() => {
        const parent = this.getParentData({ root, node })
        const index = parent.children.indexOf(data)
        parent.children.splice(index, 1)

        this.currentNode = null

        // 刷新父节点
        this.reloadNode({ root, data: parent })
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
      const index = parent.children.indexOf(data)

      let item = await this.loadItem(data.id)
      item.expand = data.expand
      item.children = data.children
      parent.children[index] = item

      // 对parent children排序
      let items = this.sortItems(parent.children)

      this.$set(parent, 'children', items)
    },

    async loadItem (id) {
      let regService = this.$service('regs')

      let res = await regService.get(id)
      let item = this.toTreeItem(res)
      return res
    },

    getParentData ({ root, node }) {
      const parentKey = root.find(it => it === node).parent
      const parent = root.find(it => it.nodeKey === parentKey).node
      return parent
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
  },

  mounted () {
    this.loadRoot()
  }
}
</script>

<style lang="less" scoped>
.sys-regs {
  height: 100%;
  padding-top: 0;
}

.page-left {
  padding: 10px 30px 10px 0;
}

.page-body {
  padding: 10px;
}
</style>
