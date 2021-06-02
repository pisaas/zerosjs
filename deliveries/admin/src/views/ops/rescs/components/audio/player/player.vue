<template>
  <div class="player flex-center">
    <audio-player v-if="loaded" :options="audioOptions" />
  </div>
</template>

<script>
export default {
  props: {
  },
  
  data () {
    return {
      loaded: false,
      options: {}
    }
  },

  computed: {
    audioOptions () {
      let options = Object.assign({
        type: 'audio/mpeg',
        autoplay: this.autoplay,
        controls: true
      }, this.options)
      
      return options
    }
  },

  methods: {
    load (data, options) {
      this.options = Object.assign({
        poster: data.thumb,
        sources: [{
          type: data.mime,
          src: data.path
        }]
      }, options)

      this.loaded = false
      
      this.$nextTick(() => {
        this.loaded = true
      })
    },

    reset () {
      this.options = {}
      this.loaded = false
    },
  }
}
</script>