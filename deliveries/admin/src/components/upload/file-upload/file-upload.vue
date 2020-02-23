<template>
  <div :class="`file-upload border border-${borderStyle}`">
    <div v-if="!$slots.default" class="btn-upload">
      <i class="picon icon-upload" />
    </div>

    <slot />
    <form ref="iptForm">
      <input ref="file" type="file" :accept="accept" :multiple="multipleStr"
        @change="onFileSelected()" />
    </form>
  </div>
</template>

<script>
export default {
  props: {
    border: [String, Boolean],
    accept: String,
    multi: Boolean
  },

  computed: {
    multipleStr () {
      if (this.multi) {
        return 'multiple'
      }
      return false
    },

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
      let files = this.getFiles()

      if (!files.length) {
        return
      }

      if (this.multi) {
        this.$emit('file-selected', files)
      } else {
        this.$emit('file-selected', files[0])
      }

      this.$emit('selected', files)

      this.$refs.iptForm.reset()
    },

    getFiles () {
      let input = this.$refs.file
      return input.files
    },

    reset () {
      let input = this.$refs.file
      input.value = ''
      
      if(!/safari/i.test(navigator.userAgent)){
        input.type = ''
        input.type = 'file'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.file-upload {
  position: relative;
  display: inline-block;

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
