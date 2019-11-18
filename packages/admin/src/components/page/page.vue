<template>
  <div class="page" :class="{
    'no-padding': noPadding,
    'no-border': noBorder,
    'full-height': fullHeight,
    'margin': margin
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
    noBorder: Boolean,
    fullHeight: Boolean,
    margin: Boolean
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
    background: white;
    border-radius: 4px;
    padding: 5px;
    box-shadow: 0 0 3px 0 @border-color;
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

  &.no-border {
    .page__bd {
      padding: 0;
      box-shadow: none;
      background: @bg-color;
    }
  }

  &.margin {
    display: flex;
    justify-content: center;
    .page__bd {
      display: flex;
      justify-content: center;
      width: 1200px;
    }
  }
}
</style>
