<template>
  <div class="list-item-actions" :class="{
    'disabled': isDisabled,
    'show-disabled': showDisabled
  }">
    <div class="actions-wrapper">
      <Dropdown v-if="collapsed" transfer>
        <slot name="trigger">
          <Button class="btn-action" :icon="icon" :disabled="isDisabled" />
        </slot>
        <DropdownMenu slot="list">
          <slot />
        </DropdownMenu>
      </Dropdown>
      <template v-else>
        <slot />
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'list-item-actions',

  provide () {
    return {
      itemActions: this
    }
  },

  props: {
    collapsed: Boolean,
    disabled: Boolean,
    showDisabled: Boolean,
    icon: {
      type: String,
      default: 'ios-more'
    },
    data: Object
  },

  data () {
    return {
      visible: false,
      isAllSubDisabled: false
    }
  },

  watch: {
    current () {
      this.currentPage = this.current
    }
  },

  computed: {
    isDisabled () {
      if (this.disabled === true) {
        return true
      }

      // 检查所有 DropdownItem 都为disabled
      if (this.isAllSubDisabled) {
        return true
      }

      return false
    }
  },

  mounted () {
    this.checkDisabled()
  },

  methods: {
    checkDisabled () {
      let items = []

      let defaultSlot = this.$slots.default
      if (defaultSlot && defaultSlot.length) {
        items = defaultSlot.map((it) => {
          return it.componentInstance
        })
      }

      let disabled = false

      if (!items || !items.length) {
        disabled = true
      } else {
        disabled = !(items.some((it) => {
          return !it.disabled
        }))
      }

      this.isAllSubDisabled = disabled
    },

    triggerFn (action, data) {
      if (data === undefined) {
        data = this.data
      }
      
      this.$emit('trigger', action, data)
    }
  }
}
</script>

<style lang="less">
.list-item-actions {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  // display: none;

  &.disabled {
    display: none;

    &.show-disabled {
      display: block;
    }
  }

  .actions-wrapper {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .btn-action {
    font-size: 18px;
    padding: 0;
    opacity: 0.8;
    font-weight: normal;
    background: transparent;
    border: 0;

    &:focus {
      box-shadow: none;
    }
  }
}
</style>