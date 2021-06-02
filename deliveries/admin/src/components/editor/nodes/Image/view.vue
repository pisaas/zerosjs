<template>
  <div class="editor-view-image"
    :class="{ 'ProseMirror-selectednode': selected }">
    <!-- <img :src="imgSrc" :style="imgStyle" /> -->
    <image-resizer
      ref="imgResizer"
      :src="imgSrc"
      :width="imgWidth"
      :autoload="false"
      @click="onClick"
      @resizing="onResizing"
      @resized="onResized" />
  </div>
</template>

<script>
export default {
  props: ['node', 'view', 'getPos', 'editor', 'selected'],

  data () {
    return {
    }
  },

  computed: {
    attrs () {
      if (!this.node) {
        return {}
      }
      return this.node.attrs || {}
    },

    imgSrc () {
      return this.attrs.src
    },

    imgWidth () {
      return this.attrs.width
    },

    imgStyle () {
      let { width } = this.attrs

      let style = ''
      if (width) {
        style += `width: ${width};`
      }
      
      return style
    }
  },

  watch: {
    selected () {
      this.loadResizer(this.selected)
    }
  },

  methods: {
    onClick () {
    },

    loadResizer (flag) {
      this.$refs.imgResizer.load(flag)
    },

    onResizing (e) {
    },

    onResized (e) {
      if (!e || !e.width) {
        return
      }

      const view = this.view
      const node = this.node

      const transaction = view.state.tr.setNodeMarkup(this.getPos(), null, {
        src: node.attrs.src,
        width: e.width + 'px'
      })

      view.dispatch(transaction)
    }
  }
}
</script>

<style lang="less" scoped>
.editor-view-image {
  display: inline-block;
}
</style>