<template>
  <page class="page-topic-cats" full-height no-border>
    <Row v-if="catItems" class="cat-row">
      <cat-column :span="ColSpan"
        pid="0" :selItems="selItems"
        @add="onAdd" @select="onSelect" @remove="onRemove" @edit="onEdit" />

      <template v-for="curItem in selItems">
        <cat-column v-if="curItem && curItem.level < MaxCatLevel" :key="curItem.id" :span="ColSpan"
          :pid="curItem.id" :selItems="selItems"
          @add="onAdd" @select="onSelect" @remove="onRemove" @edit="onEdit" />
      </template>
    </Row>

    <cat-editor-modal ref="editorModal" @on-create="onEditorCreate" @on-update="onEditorUpdate" />
  </page>
</template>

<script>
import { CatLevels, MaxCatLevel } from '../../common'

import { CatEditorModal } from '../../components/cat-editor'
import { CatColumn } from '../../components/cat-column'

export default {
  components: {
    CatEditorModal,
    CatColumn
  },

  props: {
  },

  data () {
    return {
      ColSpan: parseInt(24 / CatLevels.length),
      CatLevels,
      MaxCatLevel,
      
      selItems: []
    }
  },

  computed: {
    catItems () {
      return this.$store.getters['tpc/catItems']
    },

    // 当前选择节点最后一项
    lastSelItem () {
      let selItems = this.selItems
      if (!selItems || !selItems.length) {
        return null
      }

      return selItems[selItems.length - 1]
    }
  },

  mounted () {
    this.loadRoot()
  },

  methods: {
    onSelect (item) {
      if (!item) {
        return
      }

      this.loadItems(item.id).then(() => {
        this.setSelItem(item.id)
      })
    },

    onAdd (pid) {
      if (!pid) {
        return
      }

      this.$refs.editorModal.create(pid)
    },

    onEdit (item) {
      if (!item || !item.id) {
        return
      }

      this.$refs.editorModal.update(item.id)
    },

    onRemove (item) {
      if (!item || !item.id) {
        return
      }
      
      let subItems = this.getSubItems(item.id)

      if (subItems && subItems.length) {
        this.$app.alert('当前节点存在子节点，请删除所有子节点再进行删除。')
        return
      }

      this.$app.confirm({
        title: '删除节点',
        content: '<p>删除后将无法恢复，请谨慎操作！确认删除？</p>',
        onOk: () => {
          this.removeItem(item.id)
        }
      })
    },

    onEditorCreate (res) {
      if (!res || !res.pid) {
        return
      }
      
      this.loadItems(res.pid, [ res.pid ])
    },

    onEditorUpdate (res) {
      this.$refs.editorModal.close()

      if (!res || !res.pid) {
        return
      }
      
      this.loadItems(res.pid)
    },

    setSelItem (id) {
      let item = this.getItemById(id)

      if (!item) {
        return
      }

      let selItems = this.selItems.concat()
      selItems[item.level] = item

      for (let i=(item.level + 1); i<selItems.length; i++) {
        selItems[i] = null
      }

      this.selItems = selItems
    },

    getSubItems (id) {
      if (!id) {
        return null
      }

      let subItems = this.catItems.filter((it)  => {
        return it.pid === id
      })

      return subItems
    },

    getItemById (id) {
      if (!id) {
        return null
      }

      let items = this.catItems || []

      let item = items.find((it) => {
        return it.id === id
      })

      return item
    },

    async removeItem (id) {
      await this.$store.dispatch('tpc/removeCat', { id })
    },

    async loadRoot () {
      let items = await this.loadItems('0')
      
      return items
    },

    async loadItems (pid, ids) {
      await this.$store.dispatch('tpc/loadCats', { pid, ids })
    }
  }
}
</script>

<style lang="less" scoped>
.cat-row {
  height: 100%;
  min-width: 800px;
}
</style>

<style lang="less">
.page.page-topic-cats {
  .page_bd {
    padding: 0;
  }
}
</style>