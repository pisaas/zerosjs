<template>
  <page-section list-section fixed>
    <div class="list-header">
      <div class="body">
        <Input class="list-search"
          v-model="listQuery.search"
          icon="ios-search" placeholder="主题名称/作者/ID"
          @on-enter="onQuery" />
        
        <list-actions ref="pgActionButtons" @trigger="onActionTrigger">
          <list-action action="edit" :disabled="!isAllowedActive('edit')">编辑</list-action>
          <list-action action="delete" :disabled="!isAllowedActive('delete')">删除</list-action>
        </list-actions>
      </div>
      
      <div class="tail">
        <list-nav :total="listTotal" :current="listQuery.page" :page-size="listQuery.size"
          @on-change="onPageChange" />
      </div>
    </div>

    <div class="list-body">
      <Table ref="pgTable" class="list-table" border stripe
        :columns="listColumns" :data="listItems"
        @on-selection-change="onSelectionChange">
        <div slot-scope="{ row }" slot="topic" class="table-col">
          <div class="col-title">
            <span>{{ row.name }}</span>
          </div>
          <div class="col-subtitle">
            <div class="catpath">分类：{{ getTopicCatPathNamesStr(row.catid) }}</div>
          </div>
          
          <list-item-actions @trigger="onItemActionTrigger" :data="row">
            <list-item-action icon="md-open" label="编辑话题" action="edit" />
          </list-item-actions>
        </div>
        <div slot-scope="{ row }" slot="ts" class="table-col">
          <div class="col-text">{{ $util.date.format(row.updatedAt) }}</div>
          <div class="col-subtitle">
            <!-- <user-avatar :id="row.uid" size="small" /> -->
            <span class="uname">{{ row.uname }}</span>
          </div>
        </div>
      </Table>
    </div>

    <div class="list-footer">
      <Page :total="listTotal" :current="listQuery.page" :page-size="listQuery.size"
        show-total @on-change="onPageChange"></Page>
    </div>
  </page-section>
</template>

<script>
import { getTopicCatPathNamesStr } from '../../common'

import { TpcEditorModal } from '../../components/tpc-editor'
import CatSelector from '../../components/cat-selector'

export default {
  components: {
    TpcEditorModal,
    CatSelector
  },

  data () {
    return {
      catid: null,
      
      getTopicCatPathNamesStr,

      listSelection: [],

      listColumns: [
        { type: 'selection', width: 40, align: 'center' },
        { title: '话题', slot: 'topic', minWidth: 200 },
        { title: '更新时间', slot: 'ts', width: 150 },
      ],

      listItems: [],
      listTotal: 0,
      listQuery: {
        search: null,
        page: 1,
        size: 10,
        sort: { id: -1 },
        equalFields: [ 'id' ],
        fuzzyFields: [ 'name', 'uname' ]
      }
    }
  },

  computed: {
    selectedItems () {
      let sels = this.listSelection || []
      return sels
    },

    isSelected () {
      return this.selectedItems.length > 0
    },

    isSingleSelected () {
      return this.selectedItems.length === 1
    },

    isMultiSelected () {
      return this.selectedItems.length > 1
    }
  },

  mounted () {
    let { catid } = this.$route.query

    if (catid) {
      this.catid = catid
    }

    this.loadData()
  },

  methods: {
    onActionTrigger (name) {
      switch (name) {
        case 'edit':
          this.onEdit()
          break
        case 'delete':
          this.onDelete()
          break
      }
    },

    onItemActionTrigger (name, data) {
      if (!name || !data) {
        return
      }

      switch (name) {
        case 'edit':
          this.onEdit(data)
          break
      }
    },

    onEdit (row) {
      if (!row) {
        row = this.listSelection[0]
      }

      if (!row || !row.id) {
        return
      }

      this.$emit('edit', row.id, row)
    },

    onDelete () {
      let ids = this.listSelection.map((it) => {
        return it.id
      })

      if (!ids || !ids.length) {
        this.$app.alert('请选择要删除的记录。')
      }

      this.$app.confirm({
        title: '删除记录',
        content: '<p>记录删除后将无法恢复，确认删除选中的记录？</p>',
        onOk: () => {
          this.doDelete(ids).then(() => {
            this.$app.toast('删除成功！', { type: 'success' })
            this.loadData()
          })
        }
      })
    },

    onQuery () {
      this.listQuery.page = 1
      this.loadData()
    },

    onSelectionChange (selection) {
      this.listSelection = selection
    },

    onPageChange (val) {
      this.listQuery.page = val
      this.loadData()
    },

    isAllowedActive (action) {
      switch (action) {
        case 'delete':
          return this.isSelected
        case 'edit':
          return this.isSingleSelected
      }
    },

    // 供外部调用
    async reload () {
      this.loadData()
    },

    async doDelete (ids) {
      let results = await this.$service('tpcs').remove(null, { query: {
        status: 'new',
        ids
      } })
    },

    async loadData () {
      let query = this.$service.getSearchQuery(this.listQuery)

      query = Object.assign({
        status: 'new'
      }, query)

      let result = await this.$service('tpcs').find({ query })
      this.listItems = result.data
      this.listTotal = result.total
    }
  }
}
</script>