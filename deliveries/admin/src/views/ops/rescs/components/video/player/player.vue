<template>
  <div class="player flex-center">
    <video-player v-if="loaded" :options="videoOptions" />
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
    videoOptions () {
      let options = Object.assign({
        type: 'video/mp4',
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