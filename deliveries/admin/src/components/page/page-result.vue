<template>
  <div class="page-result">
    <div class="result-body">
      <div v-if="showIcon" class="icon">
        <slot name="icon">
          <icon :type="icon" />
        </slot>
      </div>
      <div v-if="showTitle" class="title">
        <slot name="title">
          <span class="text">{{ title }}</span>
        </slot>
      </div>
      <div v-if="showDesc" class="desc">
        <slot>{{ desc }}</slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'page-result',

  props: {
    icon: String,
    title: String,
    desc: String
  },

  computed: {
    showIcon () {
      return this.icon || this.$slots.icon !== undefined
    },

    showTitle () {
      return this.title || this.$slots.title !== undefined
    },

    showDesc () {
      return this.desc || this.$slots.default !== undefined
    },
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
.page-result {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .result-body {
    text-align: center;
    margin-top: -150px;

    &>.icon {
      font-size: 60px;
      line-height: 60px;
    }

    &>.title {
      &>.text {
        font-size: 18px;
        line-height: 50px;
      }
    }

    &>.desc {
      opacity: 0.8;
    }
  }
}
</style>