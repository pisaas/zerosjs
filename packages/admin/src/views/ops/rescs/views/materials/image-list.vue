<template>
  <div class="image-list page-list">
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
        <div class="col-detail">
          <div class="col-title image-name">{{ row.name }}</div>
          <div class="col-subtitle">
            <span v-if="row.fsize">原图大小：{{ $util.filesize(row.fsize) }}</span>
          </div>
        </div>

        <list-item-actions @trigger="onItemActionTrigger" :data="row">
          <list-item-action icon="ios-more" label="重命名" action="rename" />
        </list-item-actions>
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

    <image-previewer ref="imagePreviewer" :items="tableItems" />
  </div>
</template>

<script>
import ImagePreviewer from '@resc-components/image/previewer'
export default {
  components: {
    ImagePreviewer
  },

  data () {
    return {
      tableSelection: [],

      tableColumns: [
        { type: 'selection', width: 40, align: 'center' },
        { title: '图片', slot: 'content', minWidth: 200 },
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

    onItemActionTrigger (action, row) {
      switch (action) {
        case 'rename':
          this.onRename(row)
          break
      }
    },

    onRename (row) {
      let imgName = row.name

      this.$app.confirm({
        title: '重命名',
        render: (h) => {
          return h('Input', {
            props: { value: imgName, autofocus: true, placeholder: '请输入图片名称' },
            on: { input (val) { imgName = val } }
          })
        },
        onOk: () => {
          this.doRename(row.id, imgName)
        }
      })
    },

    onDelete () {
      let ids = this.tableSelection.map((it) => {
        return it.id
      })

      if (!ids || !ids.length) {
        this.$app.alert('请选择要删除的图片。')
      }

      this.$app.confirm({
        title: '删除图片',
        content: '<p>图片删除后将无法恢复，确认删除选中的图片？</p>',
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

    async doRename (id, name) {
      await this.$service('rescs').patch(id, { name })
      await this.loadData()
    },

    async doDelete (ids) {
      let results = await this.$service('rescs').remove(null, {
        query: { ids }
      })
    },

    async loadData () {
      let query = this.$service.getSearchQuery(this.tableQuery)

      query = Object.assign({
        rtype: 'image'
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
    .thumb {
      width: 100px;
      height: 60px;
      cursor: pointer;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
  }
}
</style>