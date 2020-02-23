<template>
  <Layout class="main-layout fs">
    <Header>
      <div class="layout-header row">
        <div class="flex-main">
          <router-view name="header" />

          <span v-if="!showSide" class="header-logo">
            <img :src="`${admLogo}-avatar`" />
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
</template>

<script>
import { menuTitle, retrieveVisibleRoutes } from './util'

import UserDropdown from './user-dropdown'

export default {
  components: {
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

  .header-logo {
    float: left;
    padding: 10px;
    img {
      height: 30px;
    }
  }

  .header-title {
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
      height: 100%;
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
