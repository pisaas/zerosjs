<template>
  <div class="image-upload">
    <div class="upload-trigger">
      <slot>
        <Button type="primary" icon="md-cloud-upload" @click="openUpload">上传</Button>
      </slot>
    </div>

    <uploader-model ref="uploaderModel" />
  </div>
</template>

<script>
import UploaderModel from './uploader-model.vue'

export default {
  components: {
    UploaderModel
  },

  props: {
  },

  computed: {
  },

  methods: {
    openUpload () {
      this.$refs.uploaderModel.open()
    }
  }
}
</script>

<style lang="less" scoped>
.image-uploader {
  position: relative;
}
</style>
