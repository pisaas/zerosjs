<template>
  <div class="image-cropper">
    <div class="cropper-section" title="裁剪封面"
      :style="cropperSectionStyle">
      <div class="section-title">图片裁剪</div>
      <div class="section-body flex-center">
        <div class="cropper-box">
          <vue-cropper v-show="url" ref="cropper" alt="请先选择要裁剪的图片"
            :src="url" :viewMode="viewMode" :zoomable="false"
            :preview="`#${preivewImageId}`" :ready="onCropperReady">
          </vue-cropper>
        </div>
        <!-- <div v-if="!url" class="no-data">
          <slot v-if="!noSelection" name="selector">
            <image-upload ref="imgUpload" @image-selected="onImageSelected">
              <Button type="primary" size="small">选择图片</Button>
            </image-upload>
          </slot>
        </div>
        <div v-else-if="loading" class="loading-data">
          <Spin />
        </div> -->
      </div>
    </div>
    <div class="preview-section">
      <div class="section-title">图片预览</div>
      <div class="section-body flex-center">
        <div class="preview-image" :id="preivewImageId" :style="previewImageStyle" />
      </div>

      <!-- <div class="section-title q-mt-md">已裁剪图片</div>
      <div class="section-body">
        <div class="cropped-image" :style="{ height: previewHeight }">
          <img :src="croppedUrl" />
        </div>
      </div> -->
    </div>
  </div>
</template>


<script>
import ImageUpload from '@components/upload/image-upload'

export default {
  components: {
    ImageUpload
  },

  props: {
    viewMode: {
      type: Number,
      default: 0
    },
    noSelection: Boolean,
    aspectRatio: Number,

    cropperHeight: {
      type: Number,
      default: 400
    },

    cropperWidth: {
      type: Number,
      default: 200
    },

    previewHeight: {
      type: Number,
      default: 300
    }
  },

  data () {
    let preivewImageId = `priviewImage${+new Date()}`

    return {
      preivewImageId,
      cropAspectRatio: this.aspectRatio,
      url: '',
      previewUrl: '',
      croppedUrl: '',
      loading: true
    }
  },

  computed: {
    cropper () {
      return this.$refs.cropper
    },

    cropperSectionStyle () {
      return `height: ${this.cropperHeight}px; width: ${this.cropperWidth}.px;`
    },

    previewImageStyle () {
      let imageHeight = parseInt(this.previewHeight / (this.cropAspectRatio || (16 / 9)));
      return `height:${imageHeight}px; max-height: 150px;`
    },
  },

  mounted () {
  },

  methods: {
    onImageSelected (file) {
      this.$media.readFileAsDataUrl(file).then((url) => {
        this.load({ url });
      })
    },

    onCropperReady () {
      this.loading = false
    },

    async crop () {
      let croppedData = this.cropper.getData()

      let { width, height, x, y } = croppedData

      let url = this.url
      let imageMogr2Str = `imageMogr2/crop/!${width}x${height}a${x}a${y}`

      let croppedUrl
      if (url.indexOf('?') >0 ) {
        croppedUrl = `${url}&${imageMogr2Str}`
      } else {
        croppedUrl = `${url}?${imageMogr2Str}`
      }

      return {
        url,
        croppedUrl,
        croppedData
      }
    },

    load ({ url, aspectRatio }) {
      this.reset()

      if (aspectRatio) {
        this.cropAspectRatio = aspectRatio
      }
      
      this.url = url

      this.reloadCrop()
    },

    reset () {
      this.cropAspectRatio = this.aspectRatio
      this.url = ''
      this.previewUrl = ''
      this.croppedUrl = ''
      this.cropper.replace('')
      this.loading = true
    },

    reloadCrop () {
      this.cropper.replace(this.url)
      this.cropper.setAspectRatio(this.cropAspectRatio)
    }
  }
}
</script>

<style lang="less" scoped>
.image-cropper {
  display: flex;
  padding: 5px;

  .section-title {
    font-size: 14px;
    line-height: 30px;
    padding: 5px 20px;
  }

  .section-body {
    height: calc(100% - 40px);
    background: @bg-color;
  }
}

.cropper-section {
  .cropper-box {
    overflow: scroll;
    max-height: 100%;
  }
}

.preview-section {
  flex: 1;
  padding-left: 20px;

  .preview-image {
    background: @bg-color;
    display: inline-block;
    overflow: hidden;
    height: 100%;
    width: 100%;

    img {
      width: 100%;
    }
  }

  .section-body {
    text-align: center;
  }
}

.loading-data {
  position: absolute;
  z-index: 100;
}
</style>