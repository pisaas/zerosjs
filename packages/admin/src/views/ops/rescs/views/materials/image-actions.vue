<template>
  <div v-show="visible" class="image-actions page-actions">
    <resc-uploader ref="uploader"
      modal-title="图片上传"
      store-key="app/material" resc-type="image"
      open-file close-when-completed
      @completed="onUploadCompleted" />
  </div>
</template>

<script>
import RescUploader from '../../components/uploader'

export default {
  components: {
    RescUploader
  },

  props: {
    name: String,
    visible: Boolean
  },

  methods: {
    onUpload () {
      this.$refs.uploader.open()
    },

    onUploadCompleted (e) {
      // post process
      this.$emit('upload', this.name, e)
      this.$emit('submit', this.name, e)
    }
  }
}
</script>