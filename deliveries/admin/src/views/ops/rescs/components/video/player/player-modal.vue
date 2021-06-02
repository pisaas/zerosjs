<template>
  <Modal v-model="showModal"
    class-name="audio-player-modal" 
    :title="title" :width="500" footer-hide
    @on-visible-change="onVisibleChange">
    <player ref="player" />
  </Modal>
</template>

<script>
import Player from './player'

export default {
  components: {
    Player
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

    open (data, options) {
      options = Object.assign({
        height: 300,
        width: 498,
      }, options)
      
      this.$refs.player.load(data, options)
      this.title = data.title || data.name

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
