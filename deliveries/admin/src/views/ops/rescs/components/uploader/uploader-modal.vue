<template>
  <Modal v-model="showModal"
    class-name="image-uploader-modal fixed"
    :title="title" :width="500" footer-hide
    @on-visible-change="onVisibleChange">
    <uploader-panel ref="uploaderPanel" @all-completed="onUploadCompleted" />
  </Modal>
</template>

<script>
import UploaderPanel from './uploader-panel'

export default {
  components: {
    UploaderPanel
  },

  props: {
    title: {
      type: String,
      default: '上传'
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
      this.$refs.uploaderPanel.load(params)
      this.showModal = true
    },

    close () {
      this.showModal = false
    },

    reset () {
      this.showModal = false
      this.$refs.uploaderPanel.reset()
    }
  },

  mounted () {
  }
}
</script>
