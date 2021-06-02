<template>
  <Menu v-if="routes && routes.length" ref="menu" class="collapsed-menu"
    theme="light" width="auto" :active-name="activeName"
    @on-select="onMenuSelect">
    <template v-for="item in routes">
      <MenuItem class="menu-item" :name="item.name" :key="item.name">
        <Dropdown v-if="!item.children || !item.children.length"
          class="menu-item-cont" transfer placement="right-start"
          @on-click="onDropdownClick">
          <Icon class="menu-item-icon" :size="iconSize" :color="iconColor" :type="util.menuIcon(item)"></Icon>
          <DropdownMenu style="width: 200px;" slot="list">
            <DropdownItem :name="item.name">
              <Icon :type="util.menuIcon(item)"></Icon>
              <span style="padding-left:10px;">{{ util.menuTitle(item) }}</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown v-else class="menu-item-cont" transfer placement="right-start" @on-click="onDropdownClick">
          <Icon class="menu-item-icon" :size="iconSize" :color="iconColor" :type="util.menuIcon(item)"></Icon>
          <DropdownMenu style="width: 200px;" slot="list">
            <template v-for="(child, i) in item.children">
              <DropdownItem :name="child.name" :key="i">
                <Icon :size="iconSize" :type="util.menuIcon(child)"></Icon>
                <span style="padding-left:10px;">{{ util.menuTitle(child) }}</span>
              </DropdownItem>
            </template>
          </DropdownMenu>
        </Dropdown>
      </MenuItem>
    </template>
  </Menu>
</template>

<script>
import util from '../util'

export default {
  props: {
    routes: Array,
    defaultIcon: String,
    iconSize: Number,
    iconColor: String
  },

  data () {
    return {
      util,
      activeName: null
    }
  },

  computed: {
  },

  methods: {
    onMenuSelect () {
    },

    onDropdownClick (active) {
      this.$emit('on-change', active)
    }
  }
}
</script>

<style lang="less" scoped>
.menu-item-icon {
  height: 20px;
}
</style>
