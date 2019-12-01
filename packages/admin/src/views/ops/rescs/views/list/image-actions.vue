<template>
  <div v-show="visible" class="image-actions page-actions">
    <image-uploader ref="uploader" @submit="onUploadSubmit" />
  </div>
</template>

<script>
import { ImageUploader } from '../../components/image'

export default {
  components: {
    ImageUploader
  },

  props: {
    name: String,
    visible: Boolean
  },

  methods: {
    onUpload () {
      this.$refs.uploader.open()
    },

    onUploadSubmit (e) {
      this.$emit('upload', this.name, e)
      this.$emit('submit', this.name, e)
    }
  }
}
</script>