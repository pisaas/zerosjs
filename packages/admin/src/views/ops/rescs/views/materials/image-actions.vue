<template>
  <div v-show="visible" class="image-actions page-actions">
    <resc-uploader ref="uploader"
      class="inline"
      modal-title="图片上传"
      upload-text="上传图片"
      upload-icon="md-image"
      store-key="app/material" resc-type="image"
      open-file close-when-completed multi
      @completed="onUploadCompleted" />

    <span class="q-ml-md">
      <Button type="primary" icon="md-film" @click="$refs.imgSelectorModal.open()">选择图片</Button>
    </span>

    <image-selector-modal ref="imgSelectorModal" />
  </div>
</template>

<script>
import RescUploader from '@resc-components/uploader'
import { ImageSelectorModal } from '@resc-components/image/selector'

export default {
  components: {
    RescUploader,
    ImageSelectorModal
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