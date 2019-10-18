<template>
  <div class="sys-regs page-view">
    <Split v-model="splitRate" min="160px">
      <div slot="left" class="page-left">
        <Tree :data="treeItems" :load-data="loadItems" :render="treeNodeRender"
          @on-add="onAdd" @on-edit="onEdit" @on-remove="onRemove"
          @on-select="onSelect"></Tree>
      </div>
      <div v-if="currentReg" slot="right" class="page-body">
        <div class="body-header flex">
          <div class="header-main flex-main">
            {{ currentReg.code }} : {{ displayName }}
          </div>
          <div class="header-tail">
            <Button v-if="!isCtrlLocked" type="primary" @click="onEditorSave">保存</Button>
          </div>
        </div>

        <div class="body-content">
          <div v-if="currentReg.desc" class="reg-desc">
            {{ currentReg.desc }}
          </div>
          <div v-if="isCtrlLocked">
            当前节点不支持编辑
          </div>
          <div v-else class="editor-container">
            <reg-data-editor ref="dataEditor" :reg="currentReg" />
          </div>
        </div>
      </div>
      <div v-else slot="right" class="page-body-none">
        点击节点编辑注册值
      </div>
    </Split>

    <reg-editor-modal ref="editorModal" @on-create="onEditorCreate" @on-update="onEditorUpdate" />
  </div>
</template>

<script>
import TreeCell from '../components/tree-cell'
import { RegEditorModal } from '../components/reg-editor'
import { RegDataEditor } from '../components/reg-data-editor'


export default {
  components: {
    RegEditorModal,
    RegDataEditor
  },

  data () {
    return {
      currentReg: null,
      treeItems: [],
      splitRate: 0.3,
    }
  },

  computed: {
    displayName () {
      let { name } = this.currentReg || {}
      name = this.$util.format.truncate(name, 10)
      return name
    },

    isCtrlLocked () {
      let { ctrls } = this.currentReg || {}
      return (ctrls && ctrls.locked)
    }
  },

  methods: {
    onSelect (e) {
      this.currentNode = e.target
      let { data } = e.target
      
      this.currentReg = data
    },

    onEditorSave () {
      let data = this.$refs.dataEditor.getEditorData()

      if (!data) {
        this.$app.toast('数据存在错误，请修正后再保存。')
        return
      }

      this.saveRegData().then(() => {
        this.$app.toast('保存成功！', {
          type: 'success'
        })
      })
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

    async saveRegData () {
      let regService = this.$service('regs')
      let { reg, regData } = this.$refs.dataEditor

      let result = await regService.patch(reg.id, {
        data: regData
      })

      this.$set(reg, 'data', result.data)
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
  height: 100%;
  padding-left:10px;

  &-none {
    padding: 20px;
  }
}

.body-header {
  line-height: 40px;
  padding: 0 16px;
  border-bottom: 1px solid @border-color;
}

.body-content {
  padding: 10px;
  height: 100%;
}

.editor-container {
  padding: 10px 0;
  height: 500px;
}
</style>
