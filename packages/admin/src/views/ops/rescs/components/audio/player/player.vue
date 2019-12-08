<template>
  <div class="player flex-center">
    <audio ref="audio" :src="src" controls="controls" :autoplay="autoPlayStr" />
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
    load ({ src, autoPlay }) {
      this.src = src
      this.autoPlay = autoPlay || false
    },

    reset () {
      this.autoPlay = false
      this.src = null

      let audio = this.$refs.audio
      audio.currentTime = 0
      audio.pause()
    },
  }
}
</script>

<style lang="less" scoped>
.player {
  height: 100px;

  audio {
    width: calc(100% - 100px);
  }
}
</style>