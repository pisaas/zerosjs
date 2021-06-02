<template>
  <Dropdown class="list-actions" transfer
    :class="{ 'no-padding': noPadding, 'show-disabled': showDisabled }"
    trigger="custom" :visible="visible"
    @on-click="onDropDownClick" @on-clickoutside="onDropDownClickOutside">
    <Button :disabled="isDisabled" @click="onBtnClick">
       <span>操作</span>
       <Icon class="icon-right" type="ios-arrow-down" />
    </Button>
    <DropdownMenu slot="list" class="list-actions-dropdown">
      <slot />
    </DropdownMenu>
  </Dropdown>
</template>

<script>
export default {
  name: 'list-actions',

  provide () {
    return {
      listActions: this
    }
  },

  props: {
    noPadding: Boolean,
    disabled: Boolean,
    showDisabled: Boolean,
    data: Object
  },

  data () {
    return {
      visible: false,
      isAllSubDisabled: false
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
    onBtnClick () {
      if (this.isDisabled ) {
        return
      }

      this.visible = !this.visible
    },

    onDropDownClick (name) {
      if (this.isDisabled ) {
        return
      }

      this.visible = false
      this.$emit('on-click', name)
    },

    onDropDownClickOutside () {
      this.visible = false
    },

    triggerFn (action, data) {
      if (data === undefined) {
        data = this.data
      }
      
      this.$emit('trigger', action, data)
    },

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
    }
  }
}
</script>

<style lang="less" scoped>
.list-actions {
  padding-left: @space-base;

  &.no-padding {
    padding-left: 0;
  }
}
</style>