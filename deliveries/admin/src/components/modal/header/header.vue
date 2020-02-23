<template>
  <div class="modal-header">
    <modal-fullscreen-icon v-if="fullscreenable" :fullscreen="fullscreen"
      @click="onFullscreenClick" />
    <div v-if="showTitle" class="header-title">{{ title }}</div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'ModalHeader',
  
  props: {
    title: String,
    fullscreen: Boolean,
    fullscreenable: Boolean
  },

  computed: {
    showTitle () {
      return !!this.title && !this.$slots.default;
    }
  },

  methods: {
    onFullscreenClick (e) {
      this.$emit('fullscreen-click', e)
    }
  }
}
</script>

<style lang="less" scoped>
.modal-header {
  display: inline-block;
  width: 100%;
  height: 20px;
}

.header-title {
  line-height: 20px;
  font-size: @font-size-large;
  color: @title-color;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>