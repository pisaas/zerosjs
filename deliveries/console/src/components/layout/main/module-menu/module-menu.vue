<template>
  <div class="module-menu row">
    <Menu class="extended-menu" mode="horizontal" theme="dark"
      :active-name="topRouteName">
      <MenuItem v-for="it in topRoutes" :name="it.name" :to="it.path" :key="it.name">
        <Icon :type="util.menuIcon(it, defaultIcon)" :size="iconSize" />{{ util.menuTitle(it) }}
      </MenuItem>
    </Menu>
    <Dropdown class="collapsed-menu" transfer placement="bottom-start"
      @on-click="onDropdownClick">
      <Button type="text" ghost>
        <Icon type="md-menu" size="20"></Icon>
      </Button>
      <DropdownMenu slot="list">
        <DropdownItem v-for="it in topRoutes" :name="it.name" :to="it.path" :key="it.name">
          <Icon :size="iconSize" :type="util.menuIcon(it, defaultIcon)"></Icon>
          <span style="padding-left:10px;">{{ util.menuTitle(it) }}</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
import util from '../util'

export default {
  props: {
    collapsed: Boolean,
    iconSize: {
      type: Number,
      default: 20
    },
    defaultIcon: {
      type: String,
      default: 'md-apps'
    }
  },

  data () {
    return {
      util
    }
  },

  computed: {
    topRoutes () {
      return this.$store.getters['app/topRoutes']
    },

    topRouteName () {
      let topRoute = this.$app.topRoute()
      if (!topRoute) {
        return null
      }
      return topRoute.name
    }
  },

  mounted () {
  },

  methods: {
    onDropdownClick (active) {
      this.$emit('on-change', active)
    }
  }
}
</script>

<style lang="less" scoped>
.extended-menu {
  display: block;
}

.collapsed-menu {
  display: none;
}

@media screen and (max-width: 600px){
  .extended-menu {
    display: none;
  }

  .collapsed-menu {
    display: block;
  }
}
</style>

<style lang="less">
.extended-menu {
  &.ivu-menu-horizontal {
    height: 50px;
    line-height: 50px;
  }
}
</style>
