<template>
  <Menu v-if="routes && routes.length" ref="menu"
    class="extended-menu no-selection" width="auto"
    :active-name="activeName" @on-select="onMenuSelect">
    <template v-for="item in routes">
      <MenuItem :name="item.name" :key="item.name">
        <Icon :type="util.menuIcon(item)" :size="iconSize"></Icon>
        <span class="layout-text" :key="item.name">{{ util.menuTitle(item) }}</span>
      </MenuItem>
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
      activeName: null
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
      
      let nameParts = routeName.split(':')

      if (nameParts.length > 1) {
        activeName = nameParts.slice(0, 1)
      }

      this.activeName = activeName
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
  height: 100%;
}
</style>
