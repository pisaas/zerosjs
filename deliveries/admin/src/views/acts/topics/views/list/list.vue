<template>
  <page fixed>
    <div slot="header">
      <Tabs class="no-content" :value="tabName" @on-click="onTabsClick">
        <div slot="extra" class="q-mx-md">
          <list-actions ref="listActions" :name="tabName" visible
            @submit="onActionSubmit" />
        </div>

        <TabPane label="已发布" name="pubed"></TabPane>
        <TabPane label="待审核" name="pending"></TabPane>
        <TabPane label="已冻结" name="fronzen"></TabPane>
        <TabPane label="草稿" name="draft"></TabPane>
      </Tabs>
    </div>

    <pubed-list v-if="tabName === 'pubed'" ref="list" />
    <pending-list v-if="tabName === 'pending'" ref="list" />
    <draft-list v-if="tabName === 'draft'" ref="list" @edit="onEdit" />
  </page>
</template>

<script>
import PubedList from './pubed-list'
import PendingList from './pending-list'
import DraftList from './draft-list'

import ListActions from './list-actions'

export default {
  components: {
    PubedList,
    PendingList,
    DraftList,
    ListActions
  },

  data () {
    return {
      tabName: null
    }
  },

  mounted () {
    let { type } = this.$route.query
    
    this.tabName = type || 'pubed'
  },

  methods: {
    onTabsClick (name) {
      if (name === this.tabName) {
        return
      }

      this.tabName = name
      
      this.$router.tryPush({
        name: 'app:act:topic:list',
        query: { type: name }
      })
    },

    onEdit (id) {
      this.$refs.listActions.openUpdate(id)
    },

    onActionSubmit () {
      let list = this.$refs.list

      if (list && list.reload) {
        list.reload()
      }
    }
  }
}
</script>