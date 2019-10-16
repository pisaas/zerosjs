<template>
  <div v-if="data" class="reg-cell">
    <div v-if="data.__empty" class="empty-cell">暂无</div>
    <div v-else class="node-cell" :class="{ 'selected': data.selected }"
      :title="title">
      <span class="q-pr-xs">
        <Icon v-if="data.selected" type='ios-folder' />
        <Icon v-else type='ios-folder-outline' />
      </span>
      <span class="node-cell-title" @click="onSelect">{{ displayTitle }}</span>
      <span class="node-cell-tail fr">
        <div class="node-cell-actions">
          <ButtonGroup class="padding-sm">
            <!-- <Button size="small" type="text" @click="onReload">
              <Icon type="md-refresh" />
            </Button> -->
            <Button size="small" type="text" @click="onAdd">
              <Icon type="md-add" />
            </Button>
            <Button v-if="!data.readonly" size="small" type="text" @click="onEdit">
              <Icon type="md-create" />
            </Button>
            <Button v-if="!data.readonly && data.leaf" size="small" type="text" @click="onRemove">
              <Icon type="md-trash" />
            </Button>
          </ButtonGroup>
        </div>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  components: {
  },

  props: {
    root: Array,
    node: Object,
    data: Object,
  },

  data () {
    return {
    }
  },

  computed: {
    treeNode () {
      return this.$cmpt.findComponentUpward(this, 'TreeNode')
    },

    title () {
      let data = this.data || {}
      let title = data.title || data.name || ''

      return title
    },

    displayTitle () {
      let title = this.$util.format.truncate(this.title, 10)
      return title
    }
  },

  methods: {
    onReload () {
      let treeNode = this.treeNode

      treeNode.dispatch('Tree', 'on-reload', {
        target: this
      });
    },

    onAdd () {
      let treeNode = this.treeNode
      treeNode.dispatch('Tree', 'on-add', {
        target: this
      });
    },

    onEdit () {
      let treeNode = this.treeNode
      treeNode.dispatch('Tree', 'on-edit', {
        target: this
      });
    },

    onRemove () {
      let treeNode = this.treeNode
      treeNode.dispatch('Tree', 'on-remove', {
        target: this
      });
    },
    
    onSelect () {
      let treeNode = this.treeNode

      if (treeNode) {
        treeNode.handleSelect()
      }
    }
  },

  mounted () {
  }
}
</script>

<style lang="less" scoped>
.reg-cell {
  display: inline-block;
  width: 100%;
}

.empty-cell {
  opacity: 0.5;
}

.node-cell {
  &-title {
    display: inline-block;
    margin: 0;
    padding: 0 4px;
    border-radius: 3px;
    cursor: pointer;
    vertical-align: top;
    color: #515a6e;
    transition: all .2s ease-in-out;

    &:hover {
      background: #eaf4fe;
    }

    &.selected {
      background: #d5e8fc;
    }
  }

  &-actions {

  }

  &.seleced {
    .node-cell-title {
      background: #d5e8fc;
    }
  }
}
</style>
