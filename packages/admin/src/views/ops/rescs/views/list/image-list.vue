<template>
  <div class="topic-list-pubed page-list">
    <div class="list-header">
      <div class="flex-main">
        <Input v-model="tableQuery.search" icon="ios-search" placeholder="名称/描述/ID"
          @on-enter="onQuery" style="width: 180px" />
        
        <list-actions ref="pgActionButtons" @on-click="onActionClick">
          <DropdownItem name="delete" :disabled="!isSelected">删除</DropdownItem>
        </list-actions>
      </div>
      <div class="tail">
        <list-nav :total="tableTotal" :current="tableQuery.page" :page-size="tableQuery.size"
          @on-change="onPageChange" />
      </div>
    </div>

    <Table ref="pgTable" class="list-table" border stripe
      :columns="tableColumns" :data="tableItems"
      @on-selection-change="onSelectionChange">
      <div slot-scope="{ row }" slot="topic" class="col-topic">
        <div class="content">
          图片
        </div>
        <div class="detail">
          <span class="name">{{ row.name }}</span>
        </div>
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
export default {
  components: {
  },

  data () {
    return {
      tableSelection: [],

      tableColumns: [
        { type: 'selection', width: 40, align: 'center' },
        { title: '图片', slot: 'content', minWidth: 200 },
        { title: '更新时间', slot: 'ts', width: 150, align: 'center' },
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
    this.loadData()
  },

  methods: {
    onEdit (row) {
      if (!row || !row.id) {
        return
      }

      this.$emit('edit', row.id, row)
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
      let query = this.$service.getSearchQuery(this.tableQuery)

      query = Object.assign({}, query)

      let result = await this.$service('rescs').find({ query })
      this.tableItems = result.data
      this.tableTotal = result.total
    }
  }
}
</script>

<style lang="less" scoped>
.list-table {
  .col-topic {
    padding: 5px;

    &>.title {
      font-size: 14px;
    }

    &>.detail {
      font-size: 12px;
      line-height: 20px;

      &>.ts {
        opacity: 0.6;
      }
    }
  }
}
</style>