<template>
  <Modal v-model="showModal"
    class-name="audio-player-modal fixed"
    :title="title" :width="500" footer-hide
    @on-visible-change="onVisibleChange">
    <audio-player ref="player" />
  </Modal>
</template>

<script>
import AudioPlayer from './player'

export default {
  components: {
    AudioPlayer
  },

  data () {
    return {
      showModal: false,
      title: '播放'
    }
  },

  methods: {
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
      this.$refs.player.load(params)
      if (params.title) {
        this.title = params.title
      }

      this.showModal = true
    },

    close () {
      this.showModal = false
    },

    reset () {
      this.showModal = false
      this.title = '播放'
      this.$refs.player.reset()
    }
  },

  mounted () {
  }
}
</script>
