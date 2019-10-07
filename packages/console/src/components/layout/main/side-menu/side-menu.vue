<template>
  <div v-if="topRoute" class="side-menu fs">
    <div v-show="!collapsed" class="menu-top">
      <span class="q-ml-sm">{{ util.menuTitle(topRoute) }}</span>
    </div>
    <extended-menu
      v-show="!collapsed"
      :routes="subRoutes"
      :iconSize="iconSize"
      :defaultIcon="defaultIcon"
      @on-change="onChange">
    </extended-menu>
    <collapsed-menu
      v-show="collapsed"
      :routes="subRoutes"
      :iconSize="iconSize"
      :iconColor="iconColor"
      :defaultIcon="defaultIcon"
      @on-change="onChange" >
    </collapsed-menu>
  </div>
</template>

<script>
import util from '../util'

import ExtendedMenu from './extended-menu.vue'
import CollapsedMenu from './collapsed-menu.vue'

export default {
  components: {
    ExtendedMenu,
    CollapsedMenu
  },

  props: {
    collapsed: {
      type: Boolean,
      default: false
    },
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
    topRoute () {
      return this.$app.topRoute()
    },

    subRoutes () {
      let topRoute = this.topRoute
      if (!topRoute) {
        return []
      }
      let menus = topRoute.children
      return menus
    }
  },

  methods: {
    onChange (name) {
      this.$router.push({
        name: name
      })

      this.$emit('on-change', name)
    }
  }
}
</script>

<style lang="less" scoped>
.side-menu {
  overflow: scroll;
}

.menu-top {
  display: flex;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  padding: 10px 40px;
}
</style>

<style lang="less">
.ivu-menu {
  color: white;
}

.ivu-menu-light {
  background: @layout-sider-background;

  &.ivu-menu-vertical {
    .ivu-menu-item-active {
      background: lighten(@layout-sider-background, 5%) !important;
    }
    &:after {
      background: transparent;
    }
  }
}
</style>
