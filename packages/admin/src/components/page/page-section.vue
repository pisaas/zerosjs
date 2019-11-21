<template>
  <div class="page-section" :class="{
    'border': border,
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

    <div v-if="showFooter" class="page-section-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'page-section',

  props: {
    border: Boolean,
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

    showFooter () {
      return this.$slots.footer !== undefined
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
  padding: 10px 20px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 0 3px 0 @border-color;
  margin-bottom: 10px;

  &.no-padding {
    padding: 0;

    &-top {
      padding-top: 0;
    }
  }

  &-head {
    display: flex;
    padding: 10px 0;

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
    overflow: scroll;
    padding: 10px 0;
  }

  &-footer {
    padding: 10px 0;
  }

  &.border {
    .page-section {
      &-head {
        border-bottom: 1px solid @border-color;
      }

      &-footer {
        border-top: 1px solid @border-color;
      }
    }
  }
}
</style>
