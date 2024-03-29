<template>
  <Layout class="app-layout fs">
    <Sider v-show="showSide" class="layout-sider" v-model="collapsed" collapsible
      :width="100" :collapsed-width="70">
      <side-menu ref="sideMenu" :routes="topRoutes"
        :collapsed="collapsed" @on-change="turnToPage" />
    </Sider>

    <Layout>
      <transition name="slide-left">
        <Sider v-show="isSubmenu && !collapsed" class="layout-sub-sider" :width="130">
          <div class="sub-header">
            {{ topRouteTitle }}
          </div>
          <sub-menu ref="subMenu" :routes="subVisibleRoutes" @on-change="turnToPage" />
        </Sider>
      </transition>

      <Layout class="layout-main">
        <Header class="layout-header">
          <div class="header-container row">
            <div class="flex-main">
              <router-view name="header" />
              <span v-if="!showSide" class="header-logo">
                <img :src="`${admLogo}-avatar`" />
                <!-- <div>{{ appName }}</div> -->
              </span>
              <span class="header-title">
                {{ displayTitle }}
              </span>
            </div>
            <div class="q-pr-sm">
              <user-dropdown />
            </div>
          </div>
        </Header>

        <Content class="layout-content">
          <div class="content-container">
            <div class="content-body">
              <router-view />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  </Layout>
</template>

<script>
import { menuTitle, retrieveVisibleRoutes } from './util'

import SideMenu from './side-menu'
import SubMenu from './sub-menu'
import UserDropdown from './user-dropdown'

export default {
  components: {
    SideMenu,
    SubMenu,
    UserDropdown
  },

  data () {
    return {
      collapsed: false,
      currentReg: null
    }
  },

  computed: {
    admLogo () {
      return this.$app.zerosBasic('logo')
    },

    displayTitle () {
      return menuTitle(this.$route)
    },

    showSide () {
      let showSide = true
      let routeMeta = this.$route.meta

      if (routeMeta && routeMeta.hideSide === true) {
        showSide = false
      }

      return showSide
    },

    topRoutes () {
      let topRoutes = this.$router.topRoutes('app').filter((r) => {
        return this.$router.isAppPageName(r.name)
      })
      return topRoutes
    },

    topRoute () {
      let routeName = this.$route.name
      return this.$router.topRoute(routeName, 1)
    },

    topRouteTitle () {
      let topRoute = this.topRoute

      if (!topRoute) {
        return ''
      }

      return menuTitle(topRoute)
    },

    isSubmenu () {
      return this.subVisibleRoutes.length
    },

    subVisibleRoutes () {
      let topRoute = this.topRoute
      if (!topRoute || !this.$router.isAppPageName(topRoute.name)) {
        return []
      }
      let vRoutes = retrieveVisibleRoutes(topRoute.children)
      return vRoutes
    }
  },

  mounted () {
    if (this.$env.viewSizeName() === 'xs') {
      this.collapsed = true
    }
  },

  beforeCreate () {
    let isAppLoaded = this.$app.isAppLoaded()
    if (!isAppLoaded) {
      this.$router.tryPush('/apps')
    }
  },

  methods: {
    onCollpasedChange (state) {
      this.collapsed = state
    },

    turnToPage (route) {
      let { name, params, query } = {}

      if (typeof route === 'string') {
        name = route
      } else {
        name = route.name
        params = route.params
        query = route.query
      }

      this.$router.tryPush({ name, params, query })
    },
  }
}
</script>

<style lang="less" scoped>
@headerHeight: 50px;

.layout-sub-sider {
  background: @bg-color;
  position: relative;
  padding-top:  @headerHeight;

  .sub-header {
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    width: 100%;
    height: @headerHeight;
    border: 1px solid @border-color;
    border-top: 0;
    border-left: 0;
    display: flex;
    align-items: center;
    padding-left: 20px;
    font-size: 14px;
    font-weight: bold;
  }
}

.layout-main {
  position: relative;
  padding-top: @headerHeight;
}

.layout-header {
  position: absolute;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  height: @headerHeight;

  .header-container {
    height: 100%;
    padding: 0 15px;
    border-bottom: 1px solid @border-color;

    .header-logo {
      float: left;
      padding: 10px;
      img {
        height: 30px;
      }
    }

    .header-title {
      font-size: 14px;
    }
  }
}

.layout-content {
  height: calc(100vh - @headerHeight);
  min-width: 600px;
  overflow: auto;

  .content-container {
    border-radius: 0;
    height: 100%;

    .content-body {
      // overflow: auto;
      height: 100%;
    }
  }
}

@media screen and (max-width: 600px){
  .layout-content {
    min-width: 300px;
  }
}
</style>
