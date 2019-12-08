<template>
  <Modal v-model="showModal"
    class-name="image-selector-modal fixed"
    :title="title" :width="800" footer-hide
    @on-visible-change="onVisibleChange">
    <image-selector ref="imgSelector" />
  </Modal>
</template>

<script>
import ImageSelector from './selector'

export default {
  components: {
    ImageSelector
  },

  props: {
    title: {
      type: String,
      default: '选择图片'
    }
  },

  data () {
    return {
      showModal: false
    }
  },

  methods: {
    onVisibleChange (visible) {
      if (!visible) {
        this.onClose()
      }
    },

    onClose () {
      this.reset()
      this.$emit('close')
    },

    onUploadCompleted (items) {
      this.$emit('completed', items)
    },

    open (params) {
      this.$refs.imgSelector.load(params)
      this.showModal = true
    },

    close () {
      this.showModal = false
    },

    reset () {
      this.showModal = false
      this.$refs.imgSelector.reset()
    }
  },

  mounted () {
  }
}
</script>
