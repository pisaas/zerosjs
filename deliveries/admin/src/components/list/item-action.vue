<template>
  <div v-if="type === 'custom'" class="list-item-action"
    :class="{ 'hidden': isHidden }">
    <slot></slot>
  </div>
  <Poptip v-else-if="type === 'poptip'" class="list-item-action"
    :class="{ 'hidden': isHidden }"
    transfer :placement="placement">
    <slot></slot>
    <slot name="content" slot="content"></slot>
  </Poptip>
  <DropdownItem v-else-if="isCollapsedAction" class="list-item-action dropdown"
    :class="{ 'hidden': isHidden }"
    :name="action" :disabled="disabled" :divided="divided">
    <slot>
      <div @click="onClick">{{ label }}</div>
    </slot>
  </DropdownItem>
  <Tooltip v-else class="list-item-action tooltip" transfer
    :class="{ 'hidden': isHidden }" :placement="placement" :disabled="!showLabel">
    <slot>
      <Button class="btn-action" :icon="icon" @click="onClick" :disabled="disabled" />
      <div v-if="showLabel" slot="content" class="label">{{ label }}</div>
    </slot>
  </Tooltip>
</template>

<script>
export default {
  name: 'list-item-action',

  inject: ['itemActions'],

  props: {
    type: String,
    disabled: Boolean,
    showDisabled: Boolean,
    icon: String,
    label: String,
    data: Object,
    action: String,
    divided: Boolean,
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
      this.trigger()
      this.$emit('click', this.action, this.data)
    },

    trigger () {
      if (this.itemActions && this.itemActions.triggerFn) {
        this.itemActions.triggerFn(this.action, this.data)
      }
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