<template>
  <div class="reg-data-editor fh">
    <div v-if="regData" class="editor-container fh">
      <json-editor
        ref="jsonEditor"
        class="json-editor fh"
        v-model="regData"
        :showBtns="false"
        mode="code"
        @has-error="onError" />
    </div>
  </div>
</template>

<script>
import JsonEditor from 'vue-json-editor'

export default {
  components: {
    JsonEditor
  },

  props: {
    reg: Object
  },

  data () {
    return {
      error: false,
      regData: null
    }
  },

  computed: {
  },

  watch: {
    reg () {
      this.loadRegData()
    }
  },

  mounted () {
    this.loadRegData()
  },

  methods: {
    getEditorData () {
      let innerEditor = this.$refs.jsonEditor.editor

      let data = null
      
      try {
        data = innerEditor.get()
      } catch (ex) {
        data = null
      }

      return data
    },

    loadRegData () {
      let regData = {}

      if (this.reg && this.reg.data) {
        regData = this.reg.data
      }

      this.regData = regData
    }
  }
}

</script>

<style lang="less" scoped>
</style>

<style lang="less">
.reg-data-editor {
  .jsoneditor-vue {
    height: 100%;
    padding-bottom: 20px;
  }
}
</style>
