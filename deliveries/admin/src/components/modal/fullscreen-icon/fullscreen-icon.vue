<template>
  <a class="fullscreen-icon" @click="onClick">
    <Icon v-if="fullscreen" type="md-contract" />
    <Icon v-else type="md-expand" />
  </a>
</template>

<script>
export default {
  name: 'ModalFullscreenIcon',
  
  props: {
    fullscreen: Boolean
  },

  methods: {
    onClick () {
      this.$emit('click', !this.fullscreen)
    }
  }
}
</script>

<style lang="less" scoped>
.fullscreen-icon {
  position: absolute;
  top: 8px;
  right: 32px;
  padding: 5px;
  z-index: 1;
  overflow: hidden;
  cursor: pointer;
}
</style>

<style lang="less">
.fullscreen-icon .ivu-icon {
  font-size: 16px;
  color: @legend-color;

  &:hover {
    color: #444;
  }
}
</style>