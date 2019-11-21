<template>
  <page>
    <page-section>
      <div slot="header">
        <Tabs class="no-content" :value="tabName" @on-click="onTabsClick">
          <div slot="extra">
            <Button type="primary" icon="md-add" @click="onAdd">新建</Button>
          </div>

          <TabPane label="已发布" name="pubed"></TabPane>
          <TabPane label="待审核" name="pending"></TabPane>
          <TabPane label="草稿" name="draft"></TabPane>
        </Tabs>
      </div>

      <div>
        <pubed-list v-if="tabName === 'pubed'" />
        <pending-list v-if="tabName === 'pending'" />
        <div v-if="tabName === 'draft'">Draft</div>
      </div>
    </page-section>
  </page>
</template>

<script>
import { newTopic } from '../../common'

import PubedList from './pubed-list'
import PendingList from './pending-list'

export default {
  components: {
    PubedList,
    PendingList
  },

  props: {
  },

  data () {
    return {
      tabName: null
    }
  },

  watch: {
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

    onAdd () {
      newTopic.call(this)
    },

    onEditorCreate () {
    },

    onEditorUpdate () {
    },

    onCatRefresh () {
      this.loadCatOptions(true)
    },

    onCatChange (val, data) {
    },

    onPageChange () {
    },

    async loadData () {

    }
  }
}
</script>

<style lang="less" scoped>
.cat-select {
  width: 200px;
}
</style>