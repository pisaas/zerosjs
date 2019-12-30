<template>
  <div id="app" class="fs">
    <keep-alive include="app-home,app-rooms">
      <router-view></router-view>
    </keep-alive>

    <img ref="bufferImg" id="appBufferImg" class="hidden" />
    <canvas ref="bufferCanvas" id="appBufferCanvas" class="hidden" />
    <audio ref="bgAudio" id="appBgAudio" loop="loop" class="hidden" />
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },

  mounted () {
    this.setTitle()
  },

  beforeDestroy () {
  },

  methods: {
    setTitle (title) {
      // if (!title) {
      //   title = this.$app.zerosBasic('name')
      // }
      // document.title = title
    }
  }
}
</script>

<style lang="less">
@import '~view-design/src/styles/index.less';

@import './styles/app.less';
@import './styles/ivu.less';
@import './styles/quill.less';
</style>
