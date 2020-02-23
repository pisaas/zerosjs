<template>
  <div class="image-resizer">
    <resizer ref="resizer"
      :resizable="resizable"
      @resizing="onResizing"
      @resized="onResized">
    </resizer>

    <img :src="src" :style="imgStyle"
      @click="onImageClick"
      @load="onImageLoad" />
  </div>
</template>

<script>
import Resizer from './resize'

export default {
  name: 'image-resizer',

  components: {
    Resizer
  },

  props: {
    autoload: { type: Boolean, default: true },
    resizable: { type: Boolean, default: true },
    src: String,
    width: String,
  },

  data () {
    return {
      imgWidth: this.width,
      imgHeight: 0
    }
  },

  computed: {
    imgStyle () {
      let style = ''

      if (this.imgWidth) {
        style += `width: ${this.imgWidth};`
      }
      
      return style
    }
  },

  watch: {
  },

  created () {
  },

  mounted () {
  },

  beforeDestroy () {
  },

  methods: {
    load (flag) {
      this.$refs.resizer.load(flag)
    },

    onImageClick () {
      this.$emit('click')
    },

    onImageLoad () {
      if (this.autoload) {
        this.load()
      }
    },

    onResizing (e) {
      if (!e || !e.width) {
        return
      }
      
      this.imgWidth = `${e.width}px`

      this.$emit('resizing', e)
    },

    onResized (e) {
      this.imgWidth = `${e.width}px`
      this.$emit('resized', e)
    }
  }
}
</script>

<style lang="less" scoped>
.image-resizer {
  position: relative;
}
</style>