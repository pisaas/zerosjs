<template>
  <div class="image-upload">
    <div class="upload-trigger">
      <template v-if="openFile">
        <file-upload :accept="uploaderAccept" :multi="multi" @selected="onFilesSelected">
          <slot>
            <Button type="primary" :icon="uploadIcon">{{ uploadText }}</Button>
          </slot>
        </file-upload>
      </template>
      <template v-else>
        <slot>
          <Button type="primary" :icon="uploadIcon" @click="openUpload">{{ uploadText }}</Button>
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
    uploadText: { type: String, default: '上传' },
    uploadIcon: { type: String, default: 'md-cloud-upload' },
    multi: Boolean,
    accept: String,
    closeWhenCompleted: Boolean,
    autoOpenModal: { type: Boolean, default: true },
    autoUpload: Boolean,
    openFile: Boolean,
    rescType: String,  // image, video, audio
    fsizeLimit: { type: Number, default: 5 }, // 文件大小限制, 默认5，单位MB
    countLimit: { type: Number, default: 20 }, // 一次上传文件数限制（默认20）
    storeKey: String,
    onUploaded: Function  // 必须为Promise function
  },

  data () {
    return {
      openUploadOptions: null
    }
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
      if (!files || !files.length) {
        return
      }
      
      if (this.multi) {
        this.$emit('selected', files)
      } else {
        this.$emit('selected', files[0])
      }
      
      if (this.autoOpenModal) {
        this.openUpload(files)
      }
    },

    onUploadCompleted (items) {
      if (this.closeWhenCompleted) {
        setTimeout(() => {
          this.$refs.uploaderModal.close()
        }, 1000)
      }

      this.$emit('completed', items)
    },

    openUpload (files, options) {
      this.openUploadOptions = options || null

      this.$refs.uploaderModal.open({
        files,
        rescType: this.rescType,
        accept: this.uploaderAccept,
        multi: this.multi,
        fsizeLimit: this.fsizeLimit,
        countLimit: this.countLimit,
        autoUpload: this.autoUpload,
        onUploaded: this.onRescUploaded.bind(this)
      })
    },

    async onRescUploaded (item, result) {
      let openUploadOptions = this.openUploadOptions || {}

      if (this.onUploaded) {
        return this.onUploaded(item, result)
      }

      if (!result || !result.key || !item.file) {
        return result
      }

      let persistentId = undefined
      if (result.persistentId && result.persistentId !== 'null') {
        persistentId = result.persistentId
      }

      let extra = Object.assign({}, {
        persistentId,
        width: parseInt(result.w),
        height: parseInt(result.h),
      }, openUploadOptions.extra)

      let rescData = {
        store: this.storeKey,
        key: result.key,
        name: item.file.name,
        rtype: this.rescType,
        extra
      }

      let cResult = await this.$service('resc').create(rescData)
      this.$emit('created', cResult, item, result)
      return cResult
    }
  }
}
</script>

<style lang="less" scoped>
.image-uploader {
  position: relative;
}
</style>
