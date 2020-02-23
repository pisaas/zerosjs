<template>
  <div v-if="image" class="msg-image">
    <img :src= "imageUrl" @click="onImgClick" />
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

    image () {
      if (!this.content) {
        return null
      }

      return this.content.image
    },

    imageUrl () {
      if (!this.image) {
        return null
      }
      let img = this.image

      let url = img.url

      if (url) {
        url = this.$resc.msgImgSlimUrl(url)
      } else if (img.base64) {
        url = img.base64
      }

      return url
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
    onImgClick () {
      this.$emit('img-click', this.image)
    }
  }
}
</script>

<style lang="less" scoped>
.msg-image {
  img {
    max-width: 12rem;
    max-height: 12rem;
  }
}
</style>
