<template>
  <div class="video-player">
    <video ref="player" class="video-js"></video>
  </div>
</template>

<script>
import VideoJs from 'video.js'

export default {
  name: "VideoPlayer",

  props: {
    options: { type: Object, default() { return {} } }
  },

  data() {
    return {
      player: null
    }
  },

  mounted() {
    let thiz = this
    
    let player = this.$refs.player
    let options = Object.assign({
      preload: 'metadata'
    }, this.options)

    this.player = VideoJs(player, options, function onPlayerReady() {
      thiz.$emit('ready', this)
    })
  },

  beforeDestroy() {
    if (this.player) {
      this.player.dispose()
    }
  }
}
</script>
