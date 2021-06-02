<template>
  <Modal v-model="showModal"
    class-name="image-cropper-modal"
    :title="title" :width="width"
    :loading="loading" :mask-closable="false"
    @on-ok="onOk" @on-visible-change="onVisibleChange">
    <image-cropper ref="cropper" :cropperWidth="cropperWidth" />
  </Modal>
</template>

<script>
import ImageCropper from './cropper'

export default {
  components: {
    ImageCropper
  },

  props: {
    title: { type: String, default: '图片剪切' },
    width: { type: Number, default: 650 },
    aspectRatio: Number,
    cropperWidth: Number
  },

  data () {
    return {
      loading: true,
      showModal: false
    }
  },

  methods: {
    onOk () {
      let editMode = this.editMode

      this.$refs.cropper.getData().then((res) => {
        this.resetLoading()
        
        if (!res) {
          return
        }

        this.$emit('cropped', res)
        
        return res
      }).catch(() => {
        this.resetLoading()
      })
    },

    onVisibleChange (visible) {
      if (!visible) {
        this.onClose()
      }
    },

    onClose () {
      this.reset()
      this.$emit('close')
    },

    open (params) {
      params = Object.assign({
        aspectRatio: this.aspectRatio
      }, params)

      this.$refs.cropper.load(params)
      this.showModal = true
    },

    close () {
      this.showModal = false
    },

    reset () {
      this.showModal = false
      this.$refs.cropper.reset()
    },

    resetLoading () {
      this.loading = false

      this.$nextTick(() => {
        this.loading = true
      })
    }
  },

  mounted () {
  }
}
</script>
