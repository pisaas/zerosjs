<template>
  <div :class="`file-upload border border-${borderStyle}`">
    <div v-if="!$slots.default" class="btn-upload">
      <i class="picon icon-upload" />
    </div>

    <slot />

    <input ref="file" type="file" :accept="accept" @change="onFileSelected()" />
  </div>
</template>

<script>
export default {
  props: {
    border: [String, Boolean],
    accept: String
  },

  computed: {
    borderStyle () {
      let border = this.border

      if (typeof border === 'boolean') {
        if (border === false) {
          border = 'none'
        } else if (border === true) {
          border = 'dashed'
        }
      }

      border = border || 'dashed'

      return border
    }
  },

  methods: {
    onFileSelected () {
      let file = this.getFile()
      this.$emit('file-selected', file)
    },

    getFile () {
      let input = this.$refs.file
      if (!input || !input.files || !input.files.length) {
        return
      }

      let file = input.files[0]

      return file
    },

    reset () {
      this.$refs.file.value = ''
    }
  }
}
</script>

<style lang="less" scoped>
.file-upload {
  position: relative;

  &.border {
    border-color: @border-color;
    border-radius: 4px;

    &-none {
      border: 0;
    }
    &-dashed {
      border: 1px dashed;
    }
  }

  input {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 100;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0;
  }
}
</style>
