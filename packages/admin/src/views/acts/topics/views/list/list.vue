<template>
  <page>
    <page-section list-section>
      <div>
        <Tabs class="no-content" :value="tabName" @on-click="onTabsClick">
          <div slot="extra" class="q-mx-md">
            <Button type="primary" icon="md-add" @click="onNew">新建</Button>
            <tpc-editor-modal ref="tpcEditorModal" />
          </div>

          <TabPane label="已发布" name="pubed"></TabPane>
          <TabPane label="待审核" name="pending"></TabPane>
          <TabPane label="已冻结" name="fronzen"></TabPane>
          <TabPane label="草稿" name="draft"></TabPane>
        </Tabs>
      </div>

      <div>
        <pubed-list v-if="tabName === 'pubed'" />
        <pending-list v-if="tabName === 'pending'" />
        <draft-list v-if="tabName === 'draft'" />
      </div>
    </page-section>
  </page>
</template>

<script>
import { newTopic } from '../../common'

import { TpcEditorModal } from '../../components/tpc-editor'

import PubedList from './pubed-list'
import PendingList from './pending-list'
import DraftList from './draft-list'

export default {
  components: {
    TpcEditorModal,
    PubedList,
    PendingList,
    DraftList
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

    onNew () {
      this.$refs.tpcEditorModal.create()
    }
  }
}
</script>