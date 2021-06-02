<template>
  <page>
    <app-list ref="appList"></app-list>
  </page>
</template>

<script>
import AppList from './app-list'

export default {
  components: {
    AppList
  },

  data () {
    return {
    }
  },

  methods: {
    onTabClick () {
      this.loadAppList()
    },

    loadAppList () {
      this.$refs.appList.loadData()
    }
  },

  mounted () {
    this.loadAppList()
  }
}

</script>
