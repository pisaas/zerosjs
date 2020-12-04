<template>
  <Menu v-if="routes && routes.length" ref="menu"
    class="layout-sub-menu no-selection" width="auto"
    :active-name="activeName" :open-names="openNames"
    @on-select="onMenuSelect">
    <template v-for="item in routes">
      <MenuItem v-if="!item.children || !item.children.length" :name="item.name" :key="item.name">
        <Icon :type="util.menuIcon(item)" :size="iconSize"></Icon>
        <span class="layout-text" :key="item.name">{{ util.menuTitle(item) }}</span>
      </MenuItem>
      <Submenu v-else :name="item.name" :key="item.name">
        <template slot="title">
          <Icon :type="util.menuIcon(item)" :size="iconSize"></Icon>
          <span class="layout-text">{{ util.menuTitle(item) }}</span>
        </template>
        <template v-for="child in item.children">
          <MenuItem :name="child.name" :key="child.name" class="submenu-item-2">
            <span class="layout-text">{{ util.menuTitle(child) }}</span>
            <Icon class="active-arrow" type="md-arrow-dropright" :size="iconSize"></Icon>
          </MenuItem>
        </template>
      </Submenu>
    </template>
  </Menu>
</template>

<script>
import util from '../util'

export default {
  components: {
  },

  props: {
    routes: Array,

    defaultIcon: {
      type: String,
      default: 'md-apps'
    },

    iconColor: {
      type: String,
      default: 'white'
    },
    
    iconSize: {
      type: Number,
      default: 20
    }
  },

  data () {
    return {
      util
    }
  },

  computed: {
    openNames () {
      let routes = this.routes

      return routes.filter((r) => {
        return r.children && r.children.length
      }).map((r) => {
        return r.name
      })
    },

    activeName () {
      let route = this.$route
      let routeName = route.name
      let routeMeta = route.meta

      if (!routeName) {
        return null
      }

      let activeName = routeName

      if (routeMeta && routeMeta.hideInMenu && routeMeta.belongTo) {
        activeName = routeMeta.belongTo
      }

      let nameParts = activeName.split(':')
      if (nameParts.length >= 4) {
        activeName = nameParts.slice(0, 4).join(':')
      } else if (nameParts.length >= 3) {
        activeName = nameParts.slice(0, 3).join(':')
      }
      
      return activeName
    }
  },

  watch: {
    openNames () {
      // FIXED: menu bug 未更新openNames
      this.$nextTick(() => {
        if (this.$refs.menu) {
          this.$refs.menu.updateOpened()
        }
      })
    },

    activeName () {
      // FIXED: menu bug 未更新activeName
      this.$nextTick(() => {
        if (this.$refs.menu) {
          this.$refs.menu.updateActiveName()
        }
      })
    }
  },

  mounted () {
  },

  methods: {
    onMenuSelect (active) {
      this.$emit('on-change', active)
    }
  }
}
</script>

<style lang="less" scoped>
.layout-sub-menu {
  overflow: auto;
  height: 100%;
  padding: 10px;
}
</style>

<style lang="less">
.layout-sub-menu {
  &.ivu-menu-vertical {
    .ivu-menu-submenu-title {
      padding: 10px 5px;

      &-icon {
        right: 0;
      }
    }

    .ivu-menu-item {
      padding: 8px 5px;
      border-radius: 3px;

      &-active {
        &:after {
          display: none !important;
        }
      }

      &.submenu-item-2 {
        padding-left: 15px !important;
      }

      .active-arrow {
        display: none;
        float: right;
        line-height: 18px;
        margin-right: 0;
      }

      &-active.submenu-item-2 {
        .active-arrow {
          display: block;
        }
      }
    }
  }
}
</style>
