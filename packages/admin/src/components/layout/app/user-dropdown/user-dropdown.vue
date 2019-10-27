<template>
  <div class="user-dropdown">
    <Dropdown v-if="user" transfer @on-click="onDropdownClick" placement="bottom-end">
      <Avatar :src="user.avatar" size="small" />
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="switch">切换应用</DropdownItem>
        <DropdownItem name="account">账号信息</DropdownItem>
        <DropdownItem name="logout">退出</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
export default {
  props: {
  },

  data () {
    return {
    }
  },

  computed: {
    user () {
      return this.$zero.userBasic()
    },

    // 是否小页面
    isXsPage () {
      return this.$env.viewSizeName() === 'xs'
    }
  },

  methods: {
    onDropdownClick (name) {
      switch (name) {
        case 'switch':
          this.onSwitch()
          break
        case 'account':
          this.onAccount()
          break
        case 'logout':
          this.logout()
          break
      }
    },

    onSwitch () {
      this.$router.tryPush('/apps')
    },

    onAccount () {
    },

    logout () {
      this.$zero.logout()
    }
  }
}
</script>

<style lang="less" scoped>
.user-dropdown {
  cursor: pointer;
}
</style>
