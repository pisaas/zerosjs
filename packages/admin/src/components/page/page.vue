<template>
  <div class="page" :class="{
    'no-padding': noPadding,
    'full-height': fullHeight,
    'fixed': fixed
  }">
    <div v-if="showHeader" class="page-header" :style="headerStyle">
      <slot name="header"></slot>
    </div>
    <div class="page-body" :style="bodyStyle">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'page',

  props: {
    noPadding: Boolean,
    fullHeight: Boolean,
    fixed: Boolean,
    headerHeight: {
      type: String,
      default: '38px'
    }
  },

  data () {
    return {
    }
  },

  computed: {
    showHeader () {
      return this.$slots.header !== undefined
    },

    headerStyle () {
      if (!this.fixed) {
        return null
      }

      return `height: ${this.headerHeight};`;
    },

    bodyStyle () {
      if (!this.fixed) {
        return null
      }

      let headerHeight = this.headerHeight || '0px';

      return `padding-top: ${headerHeight};`;
    }
  },

  methods: {
  }
}
</script>

<style lang="less">
.page {
  padding: 10px;
  position: relative;

  .page-body {
    width: 100%;
    height: 100%;
  }

  &.fixed {
    height: 100%;
    padding: 0;
    background: @panel-color;

    .page-header {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 100;
      background: @panel-color;
      padding-top: 5px;
    }

    .page-body {
      overflow: scroll;
      height: 100%;
    }
  }

  &.full-height {
    height: 100%;
    overflow: scroll;
  }

  &.no-padding {
    padding: 0;

    .page-body {
      padding: 0;
    }
  }
}
</style>
