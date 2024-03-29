<template>
  <page-section list-section fixed>
    <div class="list-header">
      <div class="body">
        <Input class="list-search"
          v-model="listQuery.search"
          icon="ios-search" placeholder="名称/描述/ID"
          @on-enter="onQuery" />
        
        <list-actions @trigger="onActionTrigger">
          <list-action action="delete" :disabled="!isSelected">删除</list-action>
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
            <!-- <list-item-action type="poptip" placement="bottom-end">
              <Tooltip transfer placement="top" content="重命名">
                <Button class="btn-action" icon="ios-more" />
              </Tooltip>
              <div slot="content">
                <Input style="width:200px" />
                <Button type="primary" class="q-ml-sm">确定</Button>
                <Button class="q-ml-sm">取消</Button>
              </div>
            </list-item-action> -->
            <!-- <list-item-action icon="ios-more" label="重命名" action="rename" /> -->
            <list-item-action type="custom">
              <image-rename-poptip :row="row" @rename="onItemRename" />
            </list-item-action>
            <list-item-action icon="ios-trash" label="删除" action="delete" />
          </list-item-actions>
        </div>
        <div slot-scope="{ row }" slot="ts" class="table-col">
          <div class="col-text">{{ $util.date.format(row.updatedAt) }}</div>
          <div class="col-subtitle">
            <span class="uname">{{ row.uname }}</span>
          </div>
        </div>
      </Table>
    </div>

    <div class="list-footer">
      <Page :total="listTotal" :current="listQuery.page" :page-size="listQuery.size"
        show-total @on-change="onPageChange"></Page>
    </div>

    <image-previewer ref="imagePreviewer" :items="listItems" />
  </page-section>
</template>

<script>
import ImagePreviewer from '@resc-components/image/previewer'

const ImageRenamePoptip = {
  props: ['row'],
  render(h) {
    return h('Poptip', {
      ref: 'poptip',
      props: { transfer: true, 'placement': 'bottom-end' },
      on: { 'on-popper-show': this.onPopperShow }
    }, [
      h('Tooltip', {
        props: { transfer: true, 'placement': 'top', 'content': '重命名' }
      }, [
        h('Button', {
          'props': { 'icon': 'ios-more' },
          'class': { 'btn-action': true }
        })
      ]),
      h('div', {
        'slot': 'content'
      }, [
        h('Input', {
          'ref': 'iptName',
          'style': { 'width': '200px' }
        }),
        h('Button', {
          'props': { 'type': 'primary' },
          'class': { 'q-ml-sm': true },
          'on': {
            'click': this.onConfirm
          }
        }, ['确定']),
        h('Button', {
          'class': { 'q-ml-sm': true },
          'on': {
            'click': this.onCancel
          }
        }, ['取消'])
      ])
    ])
  },

  methods: {
    onPopperShow () {
      let iptName = this.$refs.iptName
      iptName.currentValue = this.row.name

      this.$nextTick(() => {
        iptName.focus()
      })
    },
    
    onConfirm () {
      this.doRename()
    },

    onCancel () {
      this.$refs.poptip.cancel();
    },

    async doRename () {
      let id = this.row.id
      let name = this.$refs.iptName.currentValue
      await this.$service('rescs').patch(id, { name })
      this.$emit('rename', this.row, name)

      this.$refs.poptip.ok();
    }
  }
}

export default {
  components: {
    ImagePreviewer,
    ImageRenamePoptip
  },

  data () {
    return {
      listSelection: [],

      listColumns: [
        { type: 'selection', width: 40, align: 'center' },
        { title: '图片', slot: 'content', minWidth: 300 },
        { title: '状态', key: 'statusName', width: 100 },
        { title: '更新时间', slot: 'ts', width: 150 }
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
    isSelected () {
      let sels = this.listSelection

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
        case 'delete':
          this.onDelete([row.id])
          break
      }
    },

    onItemRename (row, name) {
      this.loadData()
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

    onDelete (ids) {
      if (!ids) {
        ids = this.listSelection.map((it) => {
          return it.id
        })
      }

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
      let query = this.$service.getSearchQuery(this.listQuery)

      query = Object.assign({
        rtype: 'image',
        store: 'app/material'
      }, query)

      let result = await this.$service('rescs').find({ query })
      this.listItems = result.data
      this.listTotal = result.total
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

      &:hover {
        box-shadow: @select-shadow;
      }
    }
  }

  .col-detail {
    max-width: calc(100% - 180px);
  }
}
</style>