<template>
  <div class="cmpt-app-list">
    <div class="row">
      <div class="flex-main">
        <Button v-if="canCreate" type="primary" icon="md-add" @click="onCreate">新建</Button>
        &nbsp;
      </div>
      <div class="text-right">
        <Input v-model="tableQuery.search" icon="search" placeholder="应用名称/编号/ID"
          @on-enter="onQuery" style="width: 180px" />
      </div>
    </div>
    <Row class="q-mt-md">
      <Table ref="pgTable" border size="small" :columns="tableColumns" :data="tableItems">
        <div slot-scope="{ row }" slot="ops" >
          <Button class="text-link" ghost size="small" @click="onEdit(row)">编辑</Button>
          <Button v-if="isAllowed(row, 'freeze')" class="text-link" ghost size="small" @click="onFreeze(row)">冻结</Button>
          <Button v-if="isAllowed(row, 'unfreeze')" class="text-link" ghost size="small" @click="onUnfreeze(row)">激活</Button>
          <Button v-if="isAllowed(row, 'publish')" class="text-green" ghost size="small" @click="onPublish(row)">发布</Button>
          <Button v-if="isAllowed(row, 'delete')" class="text-red" ghost size="small" @click="onDelete(row)">删除</Button>
        </div>
        <div slot-scope="{ row }" slot="avatar" class="q-py-xs">
          <img :src="row.avatar" />
        </div>
        <div slot-scope="{ row }" slot="basic">
          <div><b>APPID:</b> {{ row.id }}</div>
          <div v-if="row.ocode"><b>所属组织编号:</b> {{ row.ocode }}</div>
          <div v-if="row.name"><b>名称:</b> {{ row.name }}</div>
        </div>
        <div slot-scope="{ row }" slot="contact">
          <div v-if="row.desc"><b>应用描述:</b> {{ row.desc }}</div>
          <div v-if="row.timestamp"><b>更新时间:</b> {{ $util.date.format(row.timestamp, 'full') }}</div>
        </div>
        <div slot-scope="{ row }" slot="status">
          <div v-if="row.frzn">已冻结</div>
          <div v-else-if="row.pubed">已发布</div>
          <div v-else>未发布</div>
        </div>
      </Table>
    </Row>
    <Row class="q-mt-md">
      <Page :total="tableTotal" :current="tableQuery.page" :page-size="tableQuery.size"
        show-total @on-change="onPageChange"></Page>
    </Row>

    <app-editor-modal ref="editorModal" @on-save="onSave" />
  </div>
</template>

<script>
import { AppEditorModal } from '../app-editor'
import AppExpandRow from '../app-expand-row'

export default {
  components: {
    AppEditorModal
  },

  props: {
    orgCode: String
  },

  data () {
    return {
      tableColumns: [
        { type: 'expand',
          width: 50,
          render (h, { row, column, index }) {
            return h(AppExpandRow, { props: { appId: row.id } })
          }
        },
        { title: '应用', slot: 'basic', minWidth: 200 },
        { title: '状态', slot: 'status', width: 100, align: 'center' },
        { title: '操作', slot: 'ops', width: 200, align: 'center' },
      ],
      tableItems: [],
      tableTotal: 0,
      tableQuery: {
        search: null,
        page: 1,
        size: 10,
        sort: { id: -1 },
        equalFields: ['id'],
        fuzzyFields: [ 'code', 'name' ]
      }
    }
  },

  computed: {
    canCreate () {
      return !this.status || this.status === 'all'
    }
  },

  methods: {
    onCreate () {
      this.$refs.editorModal.create()
    },

    onEdit (row) {
      if (!row || !row.id) {
        return
      }
      this.$refs.editorModal.update(row.id)
    },

    onFreeze (row) {
      if (!row || !row.id) {
        return
      }

      this.$app.confirm({
        title: '冻结应用',
        content: '<p>冻结应用接口将无法调用，请谨慎操作！确认冻结？</p>',
        onOk: () => {
          this.freezeItem(row.id)
        }
      })
    },

    onUnfreeze (row) {
      if (!row || !row.id) {
        return
      }

      this.$app.confirm({
        title: '激活应用',
        content: '<p>激活应用将可以被正常调用。确认激活？</p>',
        onOk: () => {
          this.freezeItem(row.id, false)
        }
      })
    },

    onPublish (row) {
      if (!row || !row.id) {
        return
      }

      this.$app.confirm({
        title: '发布',
        content: '<p>应用发布后将无法被删除。确认发布？</p>',
        onOk: () => {
          this.publishItem(row.id)
        }
      })
    },

    onSave () {
      this.$app.toast('保存成功！', { type: 'success' })

      this.$refs.editorModal.close()
      this.getList()
    },

    onDelete (row) {
      if (!row || !row.id) {
        return
      }

      this.$app.confirm({
        title: '删除应用',
        content: '<p>应用删除后将无法恢复。确认删除？</p>',
        onOk: () => {
          this.removeItem(row.id)
        }
      })
    },

    onQuery () {
      this.tableQuery.page = 1
      this.getList()
    },

    onPageChange (val) {
      this.tableQuery.page = val
      this.getList()
    },

    // 检查是否允许某操作
    isAllowed (row, op) {
      if (!row || !op) {
        return false
      }

      switch (op) {
        case 'freeze':
          return row.pubed && !row.frzn
        case 'unfreeze':
          return row.pubed && row.frzn
        case 'delete':
        case 'publish':
          return !row.pubed
      }

      return false
    },

    freezeItem (id, flag) {
      flag = (flag !== false)
      return this.$service('apps').patch(id, {
        frzn: flag
      }).then(() => {
        let msg = (flag ? '应用已冻结！' : '应用已激活！')
        this.$app.toast(msg, { type: 'success' })
        
        this.getList()
      })
    },

    publishItem (id, flag) {
      flag = (flag !== false)
      return this.$service('apps').patch(id, {
        pubed: flag
      }).then(() => {
        this.$app.toast('应用已发布！', { type: 'success' })

        this.getList()
      })
    },

    removeItem (id) {
      return this.$service('apps').remove(id).then(() => {
        this.$app.toast('应用已删除！', { type: 'success' })

        this.getList()
      })
    },

    getList () {
      const query = this.$service.getSearchQuery(this.tableQuery)

      let orgCode = this.orgCode

      if (orgCode && orgCode !== 'all') {
        query.ocode = this.orgCode
      }

      return this.$service('apps').find({ query }).then((res) => {
        this.tableItems = res.data
        this.tableTotal = res.total
      })
    }
  },

  mounted () {
  }
}
</script>
