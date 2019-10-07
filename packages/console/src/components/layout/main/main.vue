<template>
  <Layout class="main-layout fs">
    <Header>
      <div class="layout-header row">
        <!-- 需要放在菜单上面的内容，如Logo，写在side-menu标签内部，如下 -->
        <div class="layout-logo flex-center" @click="$app.goHome()">
          <div class="logo-max flex-center">
            <img :src="`${appLogo}-avatar`" />
            <!-- <div>{{ appName }}</div> -->
          </div>
        </div>

        <Divider type="vertical" class="header-divider" />

        <!-- <side-trigger :collapsed="collapsed" @on-change="onCollpasedChange" /> -->
        <div class="flex-main">
          <module-menu :collapsed="collapsed" @on-change="turnToPage" />
        </div>

        <div class="q-pr-sm">
          <user-dropdown />
        </div>
      </div>
    </Header>
    <Layout>
      <Sider v-show="showSide" class="layout-sider"
        collapsible :collapsed-width="70" v-model="collapsed">
        <side-menu ref="sideMenu" :collapsed="collapsed" @on-change="turnToPage" />
      </Sider>
      <Content class="layout-content">
        <Card class="content-container" :bordered="false">
          <div v-if="showHeader" class="content-header" slot="title">
            {{ util.menuTitle($route) }}
          </div>
          <router-view />
        </Card>
      </Content>
    </Layout>
  </Layout>
</template>

<script>
import util from './util'

import ModuleMenu from './module-menu'
import SideMenu from './side-menu'
// import SideTrigger from './side-trigger'
import UserDropdown from './user-dropdown'

export default {
  components: {
    ModuleMenu,
    SideMenu,
    // SideTrigger,
    UserDropdown
  },

  data () {
    return {
      util,
      collapsed: false
    }
  },

  computed: {
    showSide () {
      let showSide = true
      if (this.$route.meta &&
        this.$route.meta.hideSide === true) {
        showSide = false
      }
      return showSide
    },

    showHeader () {
      let showHeader = true
      if (this.$route.meta &&
        this.$route.meta.hideHeader === true) {
        showHeader = false
      }
      return showHeader
    },

    appName () {
      return this.$app.appBasic('name')
    },

    appLogo () {
      return this.$app.appBasic('logo')
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

  .header-divider {
    background: darken(@dark, 20%);
    height: calc(~"100% - 1rem");
    margin: 0.5rem;
  }
}

.layout-logo {
  height: @layout-header-height;
  color: white;
  cursor: pointer;
  padding: 0 0.5rem;

  text-align: center;

  img,.logo-max>div {
    height: 30px;
    width: auto;
  }

  .logo-max>div {
    line-height: 30px;
    font-size: 18px;
    font-weight: bold;
    padding: 0 10px;
  }
}

.layout-content {
  height: 100%;
  min-width: 600px;

  .content-container {
    border-radius: 0;
    height: 100%;
    overflow: scroll;
  }

  .content-header {
    font-weight: bold;
    font-size: 16px;
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
