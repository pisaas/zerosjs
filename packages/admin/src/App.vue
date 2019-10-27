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

  mounted () {
    // this.$store.commit('zero/setMain', this)
    this.setTitle()
  },

  beforeDestroy () {
    // this.$store.commit('zero/setMain', null)
  },

  methods: {
    setTitle (title) {
      // if (!title) {
      //   title = this.$zero.zeroBasic('name')
      // }
      // document.title = title
    }
  }
}
</script>

<style lang="less">
@import './styles/app.less';
@import './styles/ivu.less';
</style>
