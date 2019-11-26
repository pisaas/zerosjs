<template>
  <div class="topic-list-pubed page-list">
    <div class="list-header">
      <div class="flex-main">
        <Input v-model="tableQuery.search" icon="ios-search" placeholder="主题名称/作者/ID"
          @on-enter="onQuery" style="width: 180px" />
        
        <page-action-buttons ref="pgActionButtons" @on-click="onActionClick">
          <DropdownItem name="delete" :disabled="!isSelected">删除</DropdownItem>
        </page-action-buttons>
        
        <tpc-editor-modal ref="editorModal" @submit="onEditSubmit" />
      </div>
      <div class="tail">
        <page-nav-button :total="tableTotal" :current="tableQuery.page" :page-size="tableQuery.size"
          @on-change="onPageChange" />
      </div>
    </div>

    <Table ref="pgTable" class="list-table" border stripe
      :columns="tableColumns" :data="tableItems"
      @on-selection-change="onSelectionChange">
      <div slot-scope="{ row }" slot="topic">
        <div>{{ row.name }}</div>
      </div>
      <div slot-scope="{ row }" slot="timestamp">
        <div>{{ $util.date.format(row.updatedAt) }}</div>
      </div>
      <div slot-scope="{ row }" slot="ops" >
        <Button class="link" ghost size="small" @click="onEdit(row)">编辑</Button>
      </div>
    </Table>

    <div class="list-footer">
      <Page :total="tableTotal" :current="tableQuery.page" :page-size="tableQuery.size"
        show-total @on-change="onPageChange"></Page>
    </div>
  </div>
</template>

<script>
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

      tableSelection: [],

      tableColumns: [
        { type: 'selection', width: 40, align: 'center' },
        { title: '话题', slot: 'topic', minWidth: 200 },
        { title: '作者', key: 'uname', width: 100, align: 'center' },
        { title: '更新', slot: 'timestamp', width: 150, align: 'center' },
        { title: '操作', slot: 'ops', width: 120, align: 'center' },
      ],

      tableItems: [],
      tableTotal: 0,
      tableQuery: {
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
    isSelected () {
      let sels = this.tableSelection

      if (!sels || !sels.length) {
        return false
      }

      return true
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
    onEdit (row) {
      if (!row || !row.id) {
        return
      }

      this.$refs.editorModal.openUpdate(row.id)
    },

    onEditSubmit () {
      this.loadData()
    },

    onActionClick (name) {
      switch (name) {
        case 'delete':
          this.onDelete()
          break
      }
    },

    onDelete () {
      if (!this.isSelected) {
        this.$app.alert('请选择要删除的记录。')
      }

      let ids = this.tableSelection.map((it) => {
        return it.id
      })

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
      this.tableQuery.page = 1
      this.loadData()
    },

    onSelectionChange (selection) {
      this.tableSelection = selection

      this.$nextTick(() => {
        this.$refs.pgActionButtons.checkDisabled()
      })
    },

    onPageChange (val) {
      this.tableQuery.page = val
      this.loadData()
    },

    async doDelete (ids) {
      let results = await this.$service('tpcs').remove(null, { query: {
        status: 'new',
        ids
      } })
    },

    async loadData () {
      let query = this.$service.getSearchQuery(this.tableQuery)

      query = Object.assign({
        status: 'new'
      }, query)

      let result = await this.$service('tpcs').find({ query })
      this.tableItems = result.data
      this.tableTotal = result.total
    }
  }
}
</script>

<style lang="less" scoped>
.pg-table {
  border-radius: 5px;
  border: 1px solid @border-color;
}
</style>