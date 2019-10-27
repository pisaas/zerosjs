<template>
  <div class="page page_margin page-apps">
    <div class="page__bd">
      <div class="list-container fs">
        <app-list ref="appList"></app-list>
      </div>
    </div>
  </div>
</template>

<script>
import AppList from '../components/app-list'

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
