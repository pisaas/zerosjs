<template>
  <div class="page-section" :class="{
    'no-padding': noPadding,
    'no-padding-top': noPaddingTop
  }">
    <div v-if="showHead" class="page-section-head">
      <div class="header">
        <div v-if="showTitle" class="title">{{ title }}</div>
        <slot name="header"></slot>
      </div>
      <div v-if="showExtra" class="extra">
        <slot name="extra" />
      </div>
    </div>

    <div v-if="showBody" class="page-section-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'page-section',

  props: {
    noPadding: Boolean,
    noPaddingTop: Boolean,
    title: String
  },

  computed: {
    showExtra () {
      return this.$slots.extra !== undefined
    },

    showHeader () {
      return this.$slots.header !== undefined
    },

    showTitle () {
      if (this.showHeader) {
        return false
      }

      return this.title || this.$slots.title !== undefined
    },

    showHead () {
      return this.showExtra || this.showTitle || this.showHeader
    },

    showBody () {
      return this.$slots.default !== undefined
    }
  },

  data () {
    return {
    }
  },

  methods: {
  }
}
</script>

<style lang="less">
.page-section {
  padding: 10px;

  &.no-padding {
    padding: 0;

    &-top {
      padding-top: 0;
    }
  }

  &-head {
    display: flex;
    padding: 16px 0;

    &>.header {
      flex: 1;

      &>.title {
        font-size: 14px;
        font-weight: bold;
        padding: 0 5px;
      }
    }
  }

  &-body {
  }
}
</style>
