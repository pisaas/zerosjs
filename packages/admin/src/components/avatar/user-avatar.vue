<template>
  <Avatar :size="size" :shape="shape"
    :src="avatarSrc" :icon="avatarIcon">
  </Avatar>
</template>

<script>
export default {
  name: 'user-avatar',

  props: {
    uid: String,
    uname: String,
    size: [String, Number],
    shape: String,
    icon: String,
    src: String
  },

  computed: {
    avatarSrc () {
      if (this.src) {
        return this.src
      }
      return undefined
    },

    avatarIcon () {
      if (this.icon) {
        return this.icon
      }
      return 'ios-person'
    }
  }
}
</script>