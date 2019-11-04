<template>
  <div class="layout-side-menu fs">
    <div class="menu-header">
      <!-- 需要放在菜单上面的内容，如Logo，写在side-menu标签内部，如下 -->
      <div class="logo flex-center" @click="$zeros.goHome()">
        <img :src="`${admLogo}-avatar`" />
        <!-- <div>{{ appName }}</div> -->
      </div>
    </div>
    <extended-menu
      v-show="!collapsed"
      :routes="routes"
      :iconSize="iconSize"
      :defaultIcon="defaultIcon"
      @on-change="onChange">
    </extended-menu>
    <collapsed-menu
      v-show="collapsed"
      :routes="routes"
      :iconSize="iconSize"
      :iconColor="iconColor"
      :defaultIcon="defaultIcon"
      @on-change="onChange" >
    </collapsed-menu>
  </div>
</template>

<script>
import { retrieveVisibleRoutes } from '../util'

import ExtendedMenu from './extended-menu.vue'
import CollapsedMenu from './collapsed-menu.vue'

export default {
  components: {
    ExtendedMenu,
    CollapsedMenu
  },

  props: {
    routes: {
      type: Array,
      default: () => { return [] }
    },
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
    }
  },

  computed: {
    admLogo () {
      return this.$zeros.zerosBasic('logo')
    }
  },

  methods: {
    onChange (name) {
      this.$emit('on-change', name)
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
        padding: 10px 15px;

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
