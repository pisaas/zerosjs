<template>
  <div class="audio-list page-list">
    <div class="list-header">
      <div class="flex-main">
        <Input v-model="tableQuery.search" icon="ios-search" placeholder="名称/描述/ID"
          @on-enter="onQuery" style="width: 180px" />
        
        <list-actions @trigger="onActionTrigger">
          <list-action action="delete" :disabled="!isSelected">删除</list-action>
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
      <div slot-scope="{ row }" slot="content" class="table-col col-content">
        <div class="thumb" :style="{ 'backgroundImage': `url(${row.thumb})` }"
          @click="onImagePreview(row)" />
        <div class="detail">
          <div class="col-title image-name">{{ row.name }}</div>
          <div class="col-subtitle">
            <span v-if="row.extra && row.extra.duration">时长：{{ row.extra.duration }}</span>
            <span v-if="row.fsize">大小：{{ $util.filesize(row.fsize) }}</span>
          </div>
        
          <list-item-actions @trigger="onItemActionTrigger" :data="row">
            <list-item-action icon="md-open" label="编辑话题" action="edit" />
            <list-item-action v-if="row.status === 'transcoding'" 
              icon="md-sync" label="检查转码" action="check_transcoding" />
          </list-item-actions>
        </div>
      </div>
      <div slot-scope="{ row }" slot="ts" class="table-col">
        <div class="col-text">{{ $util.date.format(row.updatedAt) }}</div>
        <div class="col-subtitle">
          <span class="uname">{{ row.uname }}</span>
        </div>
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
        { title: '音频', slot: 'content', minWidth: 200 },
        { title: '状态', key: 'statusName', width: 100 },
        { title: '更新时间', slot: 'ts', width: 150 }
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
    onImagePreview (row) {
      this.$refs.imagePreviewer.open(row.id)
    },

    onActionTrigger (name) {
      switch (name) {
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
        case 'check_transcoding':
          this.onCheckTranscoding(data)
          break
      }
    },

    onEdit (row) {
      if (!row) {
        row = this.tableSelection[0]
      }

      if (!row || !row.id) {
        return
      }

      this.$emit('edit', row.id, row)
    },

    onCheckTranscoding (row) {
      if (!row) {
        row = this.tableSelection[0]
      }

      if (!row || !row.id) {
        return
      }

      this.$service('resc').get('check_transcoding', {
        query: { id: row.id }
      }).then((res) => {
        if (res.status === row.status) {
          return
        }

        this.loadData()
      })
    },

    onDelete () {
      let ids = this.tableSelection.map((it) => {
        return it.id
      })

      if (!ids || !ids.length) {
        this.$app.alert('请选择要删除的音频。')
      }

      this.$app.confirm({
        title: '删除音频',
        content: '<p>音频删除后将无法恢复，确认删除选中的音频？</p>',
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
      let results = await this.$service('rescs').remove(null, {
        query: { ids }
      })
    },

    async loadData () {
      let query = this.$service.getSearchQuery(this.tableQuery)

      query = Object.assign({
        rtype: 'audio'
      }, query)

      let result = await this.$service('rescs').find({ query })
      this.tableItems = result.data
      this.tableTotal = result.total
    }
  }
}
</script>

<style lang="less" scoped>
.list-table {
  .col-content {
    display: flex;

    .thumb {
      width: 100px;
      height: 60px;
      cursor: pointer;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    .detail {
      padding: 10px;
    }
  }
}
</style>