<template>
  <Layout class="main-layout fs">
    <Sider class="layout-sider" v-model="collapsed" collapsible
      :width="100" :collapsed-width="70">
      <side-menu ref="sideMenu" :collapsed="collapsed" @on-change="turnToPage" />
    </Sider>
    <Layout>
      <Header>
        <div class="layout-header row">
          <div class="flex-main">
            <span class="module-title">
              {{ displayTitle }}
            </span>
          </div>

          <div class="q-pr-sm">
            <user-dropdown />
          </div>
        </div>
      </Header>

      <Layout>
        <Sider v-if="isSubmenu" class="layout-sub-sider" :width="130">
          <sub-menu ref="subMenu" :subRoutes="subVisibleRoutes" @on-change="turnToPage" />
        </Sider>
        
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
    displayTitle () {
      return menuTitle(this.$route)
    },

    isSubmenu () {
      return this.subVisibleRoutes.length
    },

    topRoute () {
      return this.$app.topRoute()
    },

    subVisibleRoutes () {
      let topRoute = this.topRoute
      if (!topRoute) {
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

      this.$router.push({ name, params, query })
    },
  }
}
</script>

<style lang="less" scoped>
.layout-header {
  height: 100%;
  padding: 0 15px;
  border-bottom: 1px solid @border-color;

  .module-title {
    font-size: 16px;
  }
}

.layout-sub-sider {
  background: @bg-color;
}

.layout-content {
  height: 100%;
  min-width: 600px;

  .content-container {
    border-radius: 0;
    height: 100%;

    .content-body {
      overflow: scroll;
      height: calc(100% - 50px);
    }
  }
}
</style>

<style lang="less" scoped>
@media screen and (max-width: 600px){
  .layout-content {
    min-width: 300px;
  }
}
</style>
