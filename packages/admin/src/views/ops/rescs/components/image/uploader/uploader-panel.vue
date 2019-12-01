<template>
  <div class="uploader-panel">
    
  </div>
</template>

<script>
export default {
  components: {
  },

  data () {
    return {
    }
  },

  computed: {
  },

  mounted () {
  },

  methods: {
    reset () {
    },

    async upload () {
    }
  }
}
</script>

<style lang="less" scoped>
.tpc-editor {
  height: 650px;
}

.editor-header {
  border-bottom: 1px solid @border-color;
}

.editor-body {
  height: calc(100% - 45px);
  display: flex;

  .body-main {
    flex: 1;
  }

  .body-right {
    background: @bg-color;
    width: 360px;
    height: 100%;
  }
}
</style>

<style lang="less">
.uploader-panel {
  .panel-header {
    .title-input {
      padding-right: 20px;
      width: 680px;

      .ivu-input-word-count {
        background: @bg-color;
      }

      input {
        border: 0;
        font-size: 16px;
        background: @bg-color;
      }
    }
  }
}
</style>
