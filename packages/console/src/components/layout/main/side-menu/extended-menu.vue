<template>
  <Menu v-if="routes && routes.length" ref="menu" class="extended-menu"
    width="auto" :active-name="activeName" :open-names="openNames"
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
  props: {
    routes: Array,
    iconSize: Number
  },

  data () {
    return {
      util,
      activeName: null,
      openNames: []
    }
  },

  computed: {
    routeName () {
      return this.$route.name
    }
  },

  watch: {
    $route () {
      this.onRouteChange()
    }
  },

  mounted () {
    this.onRouteChange()
  },

  methods: {
    onMenuSelect (active) {
      this.$emit('on-change', active)
    },

    onRouteChange () {
      this.$nextTick(() => {
        this.routeChange()
      })
    },

    routeChange () {
      let routeName = this.$route.name
      if (!routeName) {
        return
      }

      let activeName = routeName
      let openNames = []
      
      let nameParts = routeName.split(':')

      if (nameParts.length > 1) {
        activeName = nameParts.slice(0, 2).join(':')
        openNames = [activeName]
      }

      if (nameParts.length > 2) {
        activeName = nameParts.slice(0, 3).join(':')
      }

      this.activeName = activeName
      this.openNames = openNames
    }
  },

  updated () {
    this.$nextTick(() => {
      if (this.$refs.menu) {
        this.$refs.menu.updateOpened()
      }
    })
  }
}
</script>

<style lang="less" scoped>
.extended-menu {
  height: calc(100vh - @layout-header-height);
}
</style>
