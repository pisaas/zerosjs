<template>
  <div class="page" :class="{
    'no-padding': noPadding,
    'full-height': fullHeight
  }">
    <div v-if="showHeader" class="page__hd">
      <slot name="header"></slot>
    </div>
    <div class="page__bd">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'page',

  props: {
    noPadding: Boolean,
    fullHeight: Boolean
  },

  data () {
    return {
    }
  },

  computed: {
    showHeader () {
      return this.$slots.header !== undefined
    }
  },

  methods: {
  }
}
</script>

<style lang="less">
.page {
  padding: 10px;

  .page__bd {
    width: 100%;
    height: 100%;
  }

  &.full-height {
    height: 100%;
    overflow: scroll;
  }

  &.no-padding {
    padding: 0;

    .page__bd {
      padding: 0;
    }
  }
}
</style>
