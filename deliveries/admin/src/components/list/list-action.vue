<template>
  <DropdownItem  class="list-action" :class="{ 'hidden': isHidden }"
    :name="action" :disabled="disabled" :divided="divided">
    <div @click="onClick">
      <slot>{{ label }}</slot>
    </div>
  </DropdownItem>
</template>

<script>
export default {
  name: 'list-action',

  inject: ['listActions'],

  props: {
    disabled: Boolean,
    showDisabled: Boolean,
    label: String,
    data: Object,
    action: String,
    divided: Boolean
  },

  data () {
    return {
    }
  },

  computed: {
    isHidden () {
      if (this.disabled && !this.showDisabled) {
        return true
      }
      return false
    }
  },

  watch: {
    disabled () {
      if (this.listActions && this.listActions.checkDisabled) {
        this.listActions.checkDisabled()
      }
    }
  },

  mounted () {
  },

  methods: {
    onClick () {
      if (this.listActions && this.listActions.triggerFn) {
        this.listActions.triggerFn(this.action, this.data)
      }

      this.$emit('click', this.action, this.data)
    }
  }
}
</script>

<style lang="less">
.list-item-action {
  .btn-action {
  }
}
</style>