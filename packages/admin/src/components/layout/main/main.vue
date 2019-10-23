<template>
  <Layout class="main-layout fs">
    <Sider class="layout-sider" v-model="collapsed" collapsible
      :width="110" :collapsed-width="70">
      <side-menu ref="sideMenu" :collapsed="collapsed" @on-change="turnToPage" />
    </Sider>
    <Layout>
      <Header>
        <div class="layout-header row">
          <div class="flex-main">
            <span class="module-title">
              {{ util.menuTitle($route) }}
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
</template>

<script>
import util from './util'

import { SideMenu, SubMenu } from './side-menu'
import UserDropdown from './user-dropdown'

export default {
  components: {
    SideMenu,
    SubMenu,
    UserDropdown
  },

  data () {
    return {
      util,
      collapsed: false,
      currentReg: null
    }
  },

  computed: {
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
