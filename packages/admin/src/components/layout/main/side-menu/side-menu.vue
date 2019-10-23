<template>
  <div v-if="topRoute" class="layout-side-menu fs">
    <div class="menu-header">
      <!-- 需要放在菜单上面的内容，如Logo，写在side-menu标签内部，如下 -->
      <div class="logo flex-center" @click="$app.goHome()">
        <img :src="`${appLogo}-avatar`" />
        <!-- <div>{{ appName }}</div> -->
      </div>
    </div>
    <extended-menu
      v-show="!collapsed"
      :routes="topVisibleRoutes"
      :iconSize="iconSize"
      :defaultIcon="defaultIcon"
      @on-change="onChange">
    </extended-menu>
    <collapsed-menu
      v-show="collapsed"
      :routes="topVisibleRoutes"
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
    appLogo () {
      return this.$app.appBasic('logo')
    },

    topRoute () {
      return this.$app.topRoute()
    },

    topVisibleRoutes () {
      let topRoutes = this.$store.getters['app/topRoutes']
      let vRoutes = this.retrieveVisibleRoutes(topRoutes)
      return vRoutes
    },

    subVisibleRoutes () {
      let topRoute = this.topRoute
      if (!topRoute) {
        return []
      }
      let vRoutes = this.retrieveVisibleRoutes(topRoute.children)
      return vRoutes
    }
  },

  methods: {
    onChange (name) {
      this.$emit('on-change', name)
    },

    retrieveVisibleRoutes (routes) {
      let thiz = this

      if (!routes || !routes.length) {
        return []
      }

      let vRoutes = []

      routes.forEach((r) => {
        if (!r) {
          return
        }

        if (r.meta && r.meta.hideInMenu === true) {
          return
        }
        
        let vr = Object.assign({}, r)
        vr.children = thiz.retrieveVisibleRoutes(r.children)
        vRoutes.push(vr)
      })

      return vRoutes;
    }
  }
}
</script>

<style lang="less" scoped>
.layout-side-menu {
  overflow: scroll;

  .menu-header {
    height: 50px;
    line-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;

    .logo {
      img {
        height: 30px;
        width: auto;
      }
    }
  }
}
</style>

<style lang="less">
.layout-side-menu {
  .ivu-menu {
    color: white;
  }

  .ivu-menu-light {
    background: @layout-sider-background;

    &.ivu-menu-vertical {
      .ivu-menu-item {
        opacity: 0.5;
        padding: 14px 20px;

        &:hover {
          opacity: 0.8;
          color: white;
        }

        &-active {
          opacity: 1;
          color: white;
          font-weight: bold;
          background: lighten(@layout-sider-background, 5%);
        }
      }

      &:after {
        background: transparent;
      }
    }
  }
}
</style>
