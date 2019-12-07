<template>
  <div class="player flex-center">
    <video ref="video" :src="src" controls="controls" :autoplay="autoPlayStr" />
  </div>
</template>

<script>
export default {
  props: {
  },
  
  data () {
    return {
      src: null,
      autoPlay: false
    }
  },

  computed: {
    autoPlayStr () {
      if (this.autoPlay) {
        return 'autoplay'
      }
      return null
    }
  },

  methods: {
    play ({ src, autoPlay }) {
      this.src = src
      this.autoPlay = autoPlay || false
    },

    reset () {
      this.autoPlay = false
      this.src = null

      let video = this.$refs.video
      video.currentTime = 0
      video.pause()
    },
  }
}
</script>

<style lang="less" scoped>
.player {
  padding: 10px;

  video {
    height: 400px;
    width: 100%;
  }
}
</style>