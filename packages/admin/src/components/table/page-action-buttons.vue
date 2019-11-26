<template>
  <Dropdown class="page-action-buttons" :class="{ 'no-padding': noPadding }"
    trigger="custom" :visible="visible"
    @on-click="onDropDownClick" @on-clickoutside="onDropDownClickOutside">
    <Button :disabled="isDisabled" @click="onBtnClick">
       <span>操作</span>
       <Icon class="icon-right" type="ios-arrow-down" />
    </Button>
    <DropdownMenu ref="dropdownMenu" slot="list">
      <slot />
    </DropdownMenu>
  </Dropdown>
</template>

<script>
export default {
  name: 'page-action-buttons',

  props: {
    noPadding: Boolean,
    disabled: Boolean,
    current: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    }
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

    checkDisabled () {
      let items = []
      let menu = this.$refs.dropdownMenu

      if (menu) {
        items = menu.$children
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
.page-action-buttons {
  padding-left: @space-base;

  &.no-padding {
    padding-left: 0;
  }
}
</style>