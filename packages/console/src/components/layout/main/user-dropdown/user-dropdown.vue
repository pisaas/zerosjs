<template>
  <div class="user-dropdown">
    <Dropdown v-if="user" transfer @on-click="onDropdownClick" placement="bottom-end">
      <Avatar :src="user.avatar" size="small" />
      <span v-if="!isXsPage" class="user-name q-ml-sm">{{ $util.format.truncate(userDisplayName, 10) }}</span>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
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
      return this.$store.getters['usr/basic']
    },

    userDisplayName () {
      return this.$store.getters['usr/displayName']
    },

    // 是否小页面
    isXsPage () {
      return this.$env.viewSizeName() === 'xs'
    }
  },

  methods: {
    onDropdownClick (name) {
      switch (name) {
        case 'account':
          this.onAccount()
          break
        case 'logout':
          this.logout()
          break
      }
    },

    onAccount () {
    },

    logout () {
      this.$service.logout().then(() => {
        this.$uni.reload()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.user-dropdown {
  cursor: pointer;
  color: white;
}
</style>
