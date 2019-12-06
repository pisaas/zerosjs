<template>
  <div v-if="uploadFile" class="uploader-item-wrap" :class="{ error: !!errorMsg }">
    <div class="uploader-item">
      <div class="head">
        <div v-if="data.fsizeExceeded" class="error fh flex-center">
          <Icon type="md-warning" class="text-negative" size="24" />
        </div>
        <div v-else-if="data.loading" class="loading fh flex-center">
          <Spin />
        </div>
        <div v-else-if="thumbnailUrl" class="thumb" :style="{ 'backgroundImage': `url(${thumbnailUrl})` }" />
        <div v-else-if="isAudio" class="audio fh flex-center">
          <Icon type="md-musical-notes" class="text-primary" size="24" />
        </div>
        <div v-else-if="isVideo" class="video fh flex-center">
          <Icon type="md-videocam" class="text-primary" size="24" />
        </div>
      </div>
      <div class="body">
        <div class="name">{{ fileName }}</div>
        <div class="progress">
          <span>{{ fileSize }}</span>/<span>{{ uploadProgress }}%</span>
        </div>
      </div>
      <div class="tail">
        <div v-if="errorMsg" class="error-message">
          <div class="message">{{ $util.format.truncate(errorMsg, 40) }}</div>
          <Button class="btn-action small q-ml-md"
            size="small" icon="md-remove" shape="circle" @click="onRemove" />
        </div>
        <Button v-else-if="uploadCompleted" class="btn-action small"
          type="success" size="small" icon="md-checkmark" shape="circle" />
        <Button v-else-if="!noCancel" type="text" class="btn-action"
          icon="md-close" shape="circle" @click="onCancel" />
      </div>
    </div>

    <div class="progress-mask" :style="{ 'width': `${uploadProgress}%` }"></div>
  </div>
</template>

<script>
export default {
  props: {
    data: Object,
    noCancel: Boolean
  },

  data () {
    return {
      uploadFile: null,
      fileName: '',
      uploadProgress: 0,
      uploadCompleted: false,
      thumbnailUrl: null
    }
  },

  computed: {
    mimeType () {
      let uploadFile = this.uploadFile

      if (!uploadFile) {
        return ''
      }

      return uploadFile.type || ''
    },

    isAudio () {
      return this.mimeType.indexOf('audio/') === 0
    },

    isVideo () {
      return this.mimeType.indexOf('video/') === 0
    }
  },

  watch: {
    data () {
      this.reloadData()
    }
  },

  mounted () {
    this.reloadData()
  },

  methods: {
    onCancel () {
      let data = this.data

      if (!data || data.completed) {
        return
      }

      this.$emit('cancel', data)
    },

    onRemove () {
      this.$emit('remove', this.data)
    },

    reloadData () {
      let data = this.data
      this.reset()

      if (!data || !data.file) {
        return
      }

      let uploadFile = data.file || null

      this.uploadFile = uploadFile
      this.fileName = uploadFile.name
      this.fileSize = this.$util.filesize(uploadFile.size)
      this.uploadProgress = data.progress || 0
      this.uploadCompleted = data.completed || false
      this.thumbnailUrl = data.thumbnail || null
      this.errorMsg = data.errorMsg
    },

    reset () {
      this.uploadFile = null
      this.fileName = ''
      this.uploadProgress = 0
      this.uploadCompleted = false
      this.thumbnailUrl = null
      this.errorMsg = null
    }
  }
}
</script>

<style lang="less" scoped>
.uploader-item {
  &-wrap {
    position: relative;
    height: 44px;
    background: @bg-color;

    .progress-mask {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      z-index: 0;
      background: @positive;
      opacity: 0.2;
    }

    &.error .progress-mask {
      background: @negative;
      width: 100% !important;
    }
  }

  &-wrap & {
    display: flex;
    border-radius: @border-radius;
    padding: 4px 8px;
    border: 1px solid @border-color;
    position: absolute;
    z-index: 1;
    width: 100%;
    left: 0;
    top: 0;
    height: 100%;

    &>.head {
      &>.thumb {
        width: 50px;
        height: 100%;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      }
    }

    &>.body {
      flex: 1;
      padding-left: 10px;
      &>.name {
        font-weight: bold;
        font-size: 14px;
        line-height: 18px;
      }

      &>.progress {
        font-size: 12px;
        line-height: 18px;
      }
    }

    &>.tail {
      display: flex;
      align-items: center;

      .btn-action {
        font-size: 18px;

        &.small {
          font-size: 12px;
        }
      }

      .error-message {
        display: flex;
        color: @faded;

        .message {
          flex: 1;
          max-width: 200px;
        }

        .btn-action {
          color: @faded;
        }
      }
    }
  }
}
</style>