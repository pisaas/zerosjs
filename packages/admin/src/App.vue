<template>
  <div id="app" class="fs">
    <keep-alive include="app-home,app-rooms">
      <router-view></router-view>
    </keep-alive>

    <img ref="bufferImg" id="appBufferImg" class="hidden" />
    <canvas ref="bufferCanvas" id="appBufferCanvas" class="hidden" />
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },

  methods: {
    setTitle (title) {
      // if (!title) {
      //   title = this.$app.appBasic('name')
      // }
      // document.title = title
    }
  },

  mounted () {
    // this.$store.commit('app/setAppMain', this)

    this.setTitle()
  },

  beforeDestroy () {
    // this.$store.commit('app/setAppMain', null)
  }
}
</script>

<style lang="less">
@import './styles/app.less';
</style>
