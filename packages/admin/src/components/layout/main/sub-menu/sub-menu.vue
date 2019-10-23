<template>
  <Menu v-if="subRoutes && subRoutes.length" ref="menu"
    class="layout-sub-menu no-selection" width="auto"
    :active-name="activeName" :open-names="openNames"
    @on-select="onMenuSelect">
    <template v-for="item in subRoutes">
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
          <MenuItem :name="child.name" :key="child.name">
            <Icon :type="util.menuTitle(child)" :size="iconSize"></Icon>
            <span class="layout-text">{{ util.menuTitle(child) }}</span>
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
    subRoutes: Array,

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
      let subRoutes = this.subRoutes

      return subRoutes.map((r) => {
        return r.name
      })
    },

    activeName () {
      let routeName = this.$route.name || ''

      let activeName = routeName
      let nameParts = routeName.split(':')

      if (nameParts.length > 1) {
        activeName = nameParts.slice(0, 2).join(':')
      }
      
      if (nameParts.length > 2) {
        activeName = nameParts.slice(0, 3).join(':')
      }
      
      return activeName
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
  overflow: scroll;
  height: 100%;
}
</style>

<style lang="less">
.layout-sub-menu {
  &.ivu-menu-vertical {
    .ivu-menu-item,.ivu-menu-submenu-title {
      padding: 10px 15px;
    }
  }
}
</style>
