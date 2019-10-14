<template>
  <div class="ops-apps">
    <Tabs v-model="tabName" :animated="false" @on-click="onTabClick">
      <Tab-pane v-for="(v, k) in tabItems" :label="v" :name="k" :key="k">
        <app-list :ref="`appList${k}`" :status="k"></app-list>
      </Tab-pane>
    </Tabs>
  </div>
</template>

<script>
import AppList from '../components/app-list'

export default {
  components: {
    AppList
  },

  props: [ 'verb' ],

  data () {
    return {
      tabName: 'all',
      tabItems: {
        'all': '所有',
        'pi': '自营'
      }
    }
  },

  methods: {
    onTabClick () {
      this.loadAppList()
    },

    loadAppList () {
      let targetLists = this.$refs[`appList${this.tabName}`]
      if (targetLists && targetLists[0] && targetLists[0].getList) {
        targetLists[0].getList()
      }
    }
  },

  mounted () {
    this.loadAppList()
  }
}

</script>
