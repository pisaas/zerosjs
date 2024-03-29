<template>
  <div v-if="data" class="cat-cell no-selection">
    <div v-if="data.__empty" class="empty-cell">暂无</div>
    <div v-else class="node-cell" :class="{ 'selected': data.selected }"
      :title="title">
      <span class="q-pr-xs">
        <Icon type='ios-folder' />
      </span>
      <span class="node-cell-title" @click="onSelect">
        {{ displayTitle }}
      </span>
      <span class="node-cell-tail fr">
        <div class="node-cell-actions">
          <ButtonGroup v-if="isLock && locked" class="padding-sm">
            <Button size="small" type="text" @click="onLock(false)">
              <Icon type="md-unlock" />
            </Button>
          </ButtonGroup>
          <ButtonGroup v-else class="padding-sm">
            <!-- <Button size="small" type="text" @click="onReload">
              <Icon type="md-refresh" />
            </Button> -->
            <Button v-if="isAllowed('c')" size="small" type="text" @click="onAdd">
              <Icon type="md-add" />
            </Button>
            <Button v-if="isAllowed('w')" size="small" type="text" @click="onEdit">
              <Icon type="md-create" />
            </Button>
            <Button v-if="isAllowed('d')" size="small" type="text" @click="onRemove">
              <Icon type="md-trash" />
            </Button>
            <Button v-if="isLock" size="small" type="text" @click="onLock()">
              <Icon type="md-lock" />
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
      locked: true
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
    },

    isLock () {
      let data = this.data || {}
      let ctrls = data.ctrls || {}
      let modes = data.modes || []
      return (ctrls.locked === true || modes.includes('l'))
    }
  },

  methods: {
    onLock (flag) {
      flag = (flag !== false)
      this.locked = flag
    },

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
      let data = this.data || {}

      let treeNode = this.treeNode
      if (data.selected) {
        if (data.children) {
          treeNode.handleExpand()
        }
        return
      }

      if (treeNode) {
        treeNode.handleSelect()

        treeNode.dispatch('Tree', 'on-select', {
          target: this
        });
      }
    },

    isAllowed (op) {
      if (!op) {
        return false
      }

      let data = this.data || {}
      let ctrls = data.ctrls || {}
      let modes = data.modes || []

      if (op === 'w' && !this.locked && !ctrls.locked) {
        return true
      }

      let flag = modes.includes(op)

      if (!flag) {
        return false
      }

      if (op === 'd') {
        flag = (data.leaf === true)
      }
      
      return flag
    }
  },

  mounted () {
  }
}
</script>

<style lang="less" scoped>
.cat-cell {
  display: inline-block;
  width: calc(100% - 10px);
  min-width: 200px;
}

.empty-cell {
  opacity: 0.5;
}

.node-cell {
  display: flex;
  padding: 0 8px;
  border-radius: 2px;

  &-title {
    flex: 1;
    display: inline-block;
    margin: 0;
    padding: 0 4px;
    border-radius: 3px;
    cursor: pointer;
    vertical-align: top;
    transition: all .2s ease-in-out;
  }

  &:hover {
    color: lighten(@primary, 10%);
  }

  &.selected {
    color: @primary;
  }
}
</style>
