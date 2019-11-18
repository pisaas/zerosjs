<template>
  <i-col v-if="colLevel" class="cat-column" :span="span">
    <List class="cat-column-list panel-shadow">
      <div class="list-header" slot="header">
        {{ colLevel.name }}
      </div>

      <ListItem v-for="it in colItems" :key="it.id"
        class="list-item" :class="{ selected: (it.id === selColItemId) }"
        @click.native="onSelect(it)">
        <div class="list-item-content fw">{{ it.name }}</div>
        <div slot="extra" class="list-item-extra">
          <Icon v-if="!isLastCol" class="item-arrow" type="ios-arrow-forward" size="16"></Icon>

          <Icon class="item-action" type="ios-create" size="16" @click="onEdit(it)"></Icon>
          <Icon class="item-action" type="ios-trash" size="16" @click="onRemove(it)"></Icon>
        </div>
      </ListItem>
      
      <div class="list-footer" slot="footer">
        <Button type="info" long ghost @click="onAdd">新增分类</Button>
      </div>
    </List>
  </i-col>
</template>

<script>
import { CatLevels, MaxCatLevel } from '../../common'

export default {
  props: {
    span: [String, Number],
    selItems: Array,
    pid: String
  },

  data () {
    return {
    }
  },

  computed: {
    catItems () {
      return this.$store.getters['tpc/catItems']
    },

    parentItem () {
      let pid = this.pid

      if (pid === '0') {
        return null
      }

      let pItem = this.catItems.find((it) => {
        return it.id === pid
      })

      return pItem
    },

    colLevel () {
      let pItem = this.parentItem

      if (!pItem) {
        return CatLevels[0]
      }

      return CatLevels[pItem.level + 1]
    },

    colItems () {
      let pid = this.pid

      if (!pid) {
        return []
      }

      let cItems = this.catItems.filter((it) => {
        return it.pid === pid
      })

      return cItems
    },

    selColItem () {
      let selItems = this.selItems
      let colLevel = this.colLevel
      if (!colLevel || !selItems) {
        return null
      }

      let level = this.colLevel.level

      return selItems[level]
    },

    selColItemId () {
      if (!this.selColItem) {
        return null
      }
      return this.selColItem.id
    },

    isLastCol () {
      let colLevel = this.colLevel
      if (!colLevel) {
        return false
      }
      return MaxCatLevel === colLevel.level
    }
  },

  mounted () {
  },

  methods: {
    onSelect (item) {
      this.$emit('select', item)
    },

    onAdd () {
      this.$emit('add', this.pid, this.parentItem)
    },

    onEdit (item) {
      this.$emit('edit', item)
    },

    onRemove (item) {
      this.$emit('remove', item)
    }
  }
}
</script>

<style lang="less" scoped>
.cat-column {
  height: 100%;
  padding: 5px;

  &-list {
    height: 100%;
    padding: 5px;
    border-radius: 5px;
    background: white;

    .list-item {
      cursor: pointer;
      padding: 10px;

      &-extra {
        width: 50px;
        text-align: right;
        opacity: 0.8;
      }

      .item-arrow {
        display: none;
      }

      .item-action {
        display: none;
      }

      &:hover {
        background: @bg-color;

        .item-arrow {
          display: none !important;
        }

        .item-action {
          display: inline-block !important;
        }
      }

      &.selected {
        background: @bg-color;
        font-weight: bold;

        .item-arrow {
          display: inline-block;
        }
      }
    }

    .list-header {
      font-weight: bold;
      padding: 0 10px;
    }

    .list-footer {
      position: absolute;
      width: 100%;
      bottom: 0;
      left: 0;
      padding: 10px;
    }
  }
}
</style>

<style lang="less">
.cat-column {
  &-list {
    .ivu-list {
      &-container {
        height: calc(100% - 100px);
      }

      &-items {
        height: 100%;
        overflow: scroll;
      }
    }
  }
}
</style>