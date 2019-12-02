<template>
  <div class="image-upload">
    <div class="upload-trigger">
      <template v-if="openFile">
        <file-upload :accept="uploaderAccept" :multi="multi"
          @selected="onFilesSelected">
          <slot>
            <Button type="primary" icon="md-cloud-upload">上传</Button>
          </slot>
        </file-upload>
      </template>
      <template v-else>
        <slot>
          <Button type="primary" icon="md-cloud-upload" @click="openUpload">上传</Button>
        </slot>
      </template>
    </div>

    <uploader-modal ref="uploaderModal" :title="modalTitle" @completed="onUploadCompleted" />
  </div>
</template>

<script>
import FileUpload from '@components/upload/file-upload'
import { RescMimeTypes } from '@resc-components/utils'

import UploaderModal from './uploader-modal.vue'

export default {
  components: {
    FileUpload,
    UploaderModal
  },

  props: {
    modalTitle: String,
    multi: Boolean,
    accept: String,
    closeWhenCompleted: Boolean,
    autoUpload: Boolean,
    openFile: Boolean,
    rescType: String,  // image, video, audio
    storeKey: String,
    onUploaded: Function  // 必须为Promise function
  },

  computed: {
    uploaderAccept () {
      let accept = this.accept

      if (!accept && this.rescType) {
        accept = RescMimeTypes[this.rescType]
      }

      return accept
    }
  },

  methods: {
    onFilesSelected (files) {
      this.openUpload(files)
    },

    onUploadCompleted (items) {
      if (this.closeWhenCompleted) {
        setTimeout(() => {
          this.$refs.uploaderModal.close()
        }, 1000)
      }

      this.$emit('completed', items)
    },

    openUpload (files) {
      this.$refs.uploaderModal.open({
        files,
        accept: this.uploaderAccept,
        multi: this.multi,
        autoUpload: this.autoUpload,
        onUploaded: this.onRescUploaded.bind(this)
      })
    },

    async onRescUploaded (item, result) {
      if (this.onUploaded) {
        return this.onUploaded(item, result)
      }

      // 后续处理

      return result
    }
  }
}
</script>

<style lang="less" scoped>
.image-uploader {
  position: relative;
}
</style>
