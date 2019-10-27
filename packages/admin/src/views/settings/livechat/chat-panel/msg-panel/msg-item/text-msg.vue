<template>
  <div v-if="text" class="msg-text">
    {{ text }}
  </div>
</template>

<script>
export default {
  props: {
    message: Object
  },

  data () {
    return {
    }
  },

  computed: {
    content () {
      if (!this.message) {
        return null
      }
      return this.message.c
    },

    text () {
      if (!this.content) {
        return null
      }

      return this.content.text
    },

    user () {
      if (!this.message) {
        return null
      }
      return this.message.u
    }
  },

  mounted () {
  },

  methods: {
  }
}
</script>

<style lang="less" scoped>
.msg-text {
  word-break: break-all;
}
</style>
