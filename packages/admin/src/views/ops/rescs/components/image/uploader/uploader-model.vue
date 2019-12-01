<template>
  <Modal ref="editorModal" v-model="showModal"
    class-name="image-uploader-modal"
    title="上传图片" :width="600"
    :loading="loading" footer-hide
    @on-visible-change="onVisibleChange">
    <uploader-panel ref="uploaderPanel" />
  </Modal>
</template>

<script>
import UploaderPanel from './uploader-panel'

export default {
  components: {
    UploaderPanel
  },

  data () {
    return {
      showModal: false,
      loading: true
    }
  },

  computed: {
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

    onUpload (e) {
      this.resetLoading()

      if (!e || !e.id) {
        return
      }
      
      this.$emit('upload', e)
      this.$emit('submit', e)
    },

    open () {
      this.showModal = true
    },

    close () {
      this.showModal = false
    },

    reset () {
      this.showModal = false
      this.resetLoading()
    },

    resetLoading () {
      this.loading = false

      this.$nextTick(() => {
        this.loading = true
      })
    }
  },

  mounted () {
  }
}
</script>
