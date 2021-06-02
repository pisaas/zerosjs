<template>
  <a @click="handleChange" type="text" :class="['sider-trigger', collapsed ? 'collapsed' : '']">
    <div class="row flex-center fh">
      <Icon :type="icon" :size="20" />
    </div>
  </a>
</template>
<script>
export default {
  props: {
    collapsed: Boolean,
    icon: {
      type: String,
      default: 'md-menu'
    }
  },
  methods: {
    handleChange () {
      this.$emit('on-change', !this.collapsed)
    }
  }
}
</script>

<style lang="less" scoped>
.trans{
  transition: transform .2s ease;
}

.sider-trigger{
  line-height: @layout-header-height;
  display: inline-block;
  text-align: center;
  cursor: pointer;
  padding: 0 0.5rem;
  color: @dark;

  i{
    .trans;
    vertical-align: top;
  }

  &.collapsed i{
    transform: rotateZ(90deg);
    .trans;
  }
}
</style>
