<template>
  <DropdownItem v-if="isCollapsedAction" class="list-item-action dropdown"
    :class="{ 'hidden': isHidden }"
    :name="action" :disabled="disabled">
    <div @click="onClick">{{ label }}</div>
  </DropdownItem>
  <Tooltip v-else class="list-item-action tooltip" transfer
    :class="{ 'hidden': isHidden }" :placement="placement" :disabled="!showLabel">
    <Button class="btn-action" :icon="icon" @click="onClick" :disabled="disabled" />
    <div v-if="showLabel" slot="content" class="label">{{ label }}</div>
  </Tooltip>
</template>

<script>
export default {
  name: 'list-item-action',

  inject: ['itemActions'],

  props: {
    disabled: Boolean,
    showDisabled: Boolean,
    icon: String,
    label: String,
    data: Object,
    action: String,
    placement: {
      type: String,
      default: 'top-start'
    }
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
    },

    showLabel () {
      return !!this.label
    },

    isCollapsedAction () {
      if (this.itemActions) {
        return this.itemActions.collapsed
      }

      return false
    }
  },

  watch: {
    disabled () {
      if (this.itemActions && this.itemActions.checkDisabled) {
        this.itemActions.checkDisabled()
      }
    }
  },

  mounted () {
  },

  methods: {
    onClick () {
      if (this.itemActions && this.itemActions.triggerFn) {
        this.itemActions.triggerFn(this.action, this.data)
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