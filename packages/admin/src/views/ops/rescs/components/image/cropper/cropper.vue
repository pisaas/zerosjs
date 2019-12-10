<template>
  <div class="image-cropper">
    <div class="cropper-section" title="裁剪封面">
      <div class="section-title">图片裁剪</div>
      <div class="section-body">
        <vue-cropper v-show="url" ref="imgCropper" alt="请先选择要裁剪的图片" :src="url"
          preview=".preview-image" :ready="onCropperReady">
        </vue-cropper>
        <div v-if="!url" class="no-data">
          请先选择要裁剪的图片
        </div>
      </div>
    </div>
    <div class="preview-section">
      <div class="section-title">图片预览</div>
      <div class="section-body">
        <div class="preview-image" :style="{ height: previewHeight }" />
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
export default {
  components: {
  },

  data () {
    return {
      aspectRatio: undefined,
      url: '',
      previewUrl: '',
      croppedUrl: '',
    }
  },

  computed: {
    previewHeight () {
      let height = parseInt(300 / (this.aspectRatio || (16 / 9)));
      return `${height}px`
    },

    cropper () {
      return this.$refs.imgCropper
    }
  },

  mounted () {
  },

  methods: {
    onCropperReady () {},

    async crop () {
      let croppedData = this.cropper.getData()

      let { width, height, x, y } = croppedData

      let url = this.url
      let imageMogr2Str = `imageMogr2/crop/!${width}x${height}a${x}a${y}`
      let croppedUrl = `${url}?${imageMogr2Str}`

      return {
        url,
        croppedUrl,
        croppedData
      }
    },

    load ({ url, aspectRatio }) {
      this.reset()
      this.aspectRatio = aspectRatio
      this.url = url

      this.reloadCrop()
    },

    reset () {
      this.aspectRatio = undefined
      this.url = ''
      this.previewUrl = ''
      this.croppedUrl = ''
      this.cropper.clear()
    },

    reloadCrop () {
      this.cropper.replace(this.url)
      this.cropper.setAspectRatio(this.aspectRatio)
    }
  }
}
</script>

<style lang="less" scoped>
.image-cropper {
  display: flex;
  height: 400px;
  padding: 5px;

  .section-title {
    font-size: 14px;
    font-weight: bold;
    line-height: 30px;
    padding: 5px 20px;
  }

  .section-body {
    padding: 0 20px;
  }
}

.cropper-section {
  width: 280px;
  border-right: 1px solid @border-color;
}

.preview-section {
  flex: 1;
  @preivewWidth: 240px;

  .preview-image {
    width: @preivewWidth;
    max-height: 150px;
    background: @bg-color;
    display: inline-block;
    overflow: hidden;

    img {
      width: 100%;
    }
  }

  .cropped-image {
    width: @preivewWidth;
    max-height: 150px;
    background: @bg-color;
    display: inline-block;
    
    img {
      width: 100%;
    }
  }

  .section-body {
    text-align: center;
  }
}
</style>