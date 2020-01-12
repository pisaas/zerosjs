<template>
  <div class="editor-view-audio"
    :class="{ 'ProseMirror-selectednode': selected }">
    
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

    src () {
      return this.attrs.src
    }
  },

  watch: {
  },

  methods: {
  }
}
</script>

<style lang="less" scoped>
.editor-view-audio {
  display: inline-block;
}
</style>