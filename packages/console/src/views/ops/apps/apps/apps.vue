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
import AppList from './app-list'

export default {
  components: {
    AppList
  },

  props: {
  },

  data () {
    return {
      tabName: 'all',
      tabItems: {
        'all': '所有',
        'self': '自营'
      }
    }
  },

  methods: {
    onTabClick () {
      let targetLists = this.$refs[`appList${this.tabName}`]
      if (targetLists && targetLists[0] && targetLists[0].getList) {
        targetLists[0].getList()
      }
    }
  },

  mounted () {
  }
}

</script>
