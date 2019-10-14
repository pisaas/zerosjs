<template>
  <div class="ops-orgs">
    <Tabs v-model="tabName" :animated="false" @on-click="onTabClick">
      <Tab-pane v-for="(v, k) in tabItems" :label="v" :name="k" :key="k">
        <org-list :ref="`orgList${k}`" :status="k"></org-list>
      </Tab-pane>
    </Tabs>
  </div>
</template>

<script>
import OrgList from '../components/org-list'

export default {
  components: {
    OrgList
  },

  props: {
  },

  data () {
    return {
      tabName: 'all',
      tabItems: {
        'all': '所有'
      }
    }
  },

  methods: {
    onTabClick () {
      this.loadOrgList()
    },

    loadOrgList () {
      let targetLists = this.$refs[`orgList${this.tabName}`]
      if (targetLists && targetLists[0] && targetLists[0].getList) {
        targetLists[0].getList()
      }
    }
  },

  mounted () {
    this.loadOrgList()
  }
}

</script>
