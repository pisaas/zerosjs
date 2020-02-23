<template>
  <Modal v-model="showModal"
    class-name="image-selector-modal"
    :title="title" :width="800" footer-hide
    @on-visible-change="onVisibleChange">
    <image-selector ref="imgSelector" :single="single"
      @cancel="onClose" @selected="onSelected" />
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
      default: '选择视频'
    },

    single: Boolean
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

    onSelected (e) {
      this.$emit('selected', e)
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
