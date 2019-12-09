<template>
  <Modal v-model="showModal"
    class-name="image-cropper-modal"
    :title="title" :width="800" footer-hide
    @on-visible-change="onVisibleChange">
    <image-cropper ref="imgCropper"
      @cancel="onClose" @cropped="onCropped" />
  </Modal>
</template>

<script>
import ImageCropper from './cropper'

export default {
  components: {
    ImageCropper
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
    onCancel (e) {
      this.$emit('cancel', e)
      this.close()
    },

    onCropped (e) {
      this.$emit('cropped', e)
      this.close()
    },

    onVisibleChange (visible) {
      if (!visible) {
        this.onClose()
      }
    },

    onClose () {
      this.reset()
      this.$emit('close')
    },

    open (params) {
      this.$refs.imgCropper.load(params)
      this.showModal = true
    },

    close () {
      this.showModal = false
    },

    reset () {
      this.showModal = false
      this.$refs.imgCropper.reset()
    }
  },

  mounted () {
  }
}
</script>
