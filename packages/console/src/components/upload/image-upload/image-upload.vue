<template>
  <div class="image-upload">
    <file-upload ref="fileUpload" accept="image/*" :border="border"
      @file-selected="onFileSelected">
      <div v-if="!$slots.default" class="btn-upload">
        <i class="picon icon-picture" />
      </div>
      <slot />
    </file-upload>
  </div>
</template>

<script>
import FileUpload from '@/components/upload/file-upload'

const DefaultImageSpec = {
  MimeType: 'image/jpeg', // 图片格式
  MaxSize: 500 * 1024, // 最大图片大小 500k
  MaxWidth: 600,   // 最大图片宽度
  MaxHeight: 600,  // 最大图片高度
  Square: false  // 是否正方形
}

export default {
  components: {
    FileUpload
  },

  props: {
    border: [String, Boolean],
    spec: {
      type: Object,
      default () { return DefaultImageSpec }
    },
  },

  methods: {
    onFileSelected (file) {
      this.$emit('image-selected', file)
    },

    getImage () {
      let imgData = this.$refs.fileUpload.getFile()
      return imgData
    },

    reset () {
      this.$refs.fileUpload.reset()
    },

    upload (prefix) {
      return this.scale().then((base64) => {
        if (!base64) {
          return
        }

        let bolb = this.$media.dataURItoBlob(base64)
        return this.$apis.app.uploadFile(bolb, null, prefix).then((f) => {
          return Promise.resolve({ key: f.key })
        })
      })
    },

    scale (spec) {
      let imgSpec = (spec || this.spec)
      let imgData = this.$refs.fileUpload.getFile()

      if (!imgSpec || !imgData) {
        return Promise.resolve(null)
      }

      return this.$media.scalePhoto.call(this, imgData, imgSpec)
    }
  }
}
</script>

<style lang="less" scoped>
.image-upload {
}
</style>
