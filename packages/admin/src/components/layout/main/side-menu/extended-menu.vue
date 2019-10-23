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
      util
    }
  },

  computed: {
    routeName () {
      return this.$route.name
    },

    activeName () {
      let routeName = this.$route.name || ''

      let activeName = routeName
      
      let nameParts = routeName.split(':')
      if (nameParts.length > 1) {
        activeName = nameParts[0]
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
