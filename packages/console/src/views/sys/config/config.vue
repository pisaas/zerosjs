<template>
  <div class="origin-config">
    <json-viewer v-if="configData" :data="configData" :deep="2" />
  </div>
</template>

<script>
import JsonViewer from '@/vue-components/json-viewer'

export default {
  components: {
    JsonViewer
  },

  data () {
    return {
      configData: null
    }
  },

  computed: {
  },

  mounted () {
    this.getData()
  },

  methods: {
    getData () {
      this.$apis.cfg.getConfig().then((res) => {
        this.configData = res
      })
    }
  }
}
</script>
