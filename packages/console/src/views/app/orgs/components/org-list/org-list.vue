<template>
  <div class="cmpt-org-list">
    <div class="row">
      <div class="flex-main">
        <Button v-if="canCreate" type="primary" icon="md-add" @click="onCreate">新建</Button>
        &nbsp;
      </div>
      <div class="text-right">
        <Input v-model="tableQuery.search" icon="search" placeholder="组织名称/编号/ID"
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

    <org-editor-modal ref="editorModal" @on-save="onSave" />
  </div>
</template>

<script>
import { OrgEditorModal } from '../org-editor'
import OrgExpandRow from '../org-expand-row'

export default {
  components: {
    OrgEditorModal
  },

  props: {
    status: String
  },

  data () {
    return {
      tableColumns: [
        { type: 'expand',
          width: 50,
          render (h, { row, column, index }) {
            return h(OrgExpandRow, { props: { orgId: row.id } })
          }
        },
        { title: '名称', key: 'name', minWidth: 100, align: 'center' },
        { title: '编号', key: 'code', width: 200, align: 'center' },
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
        title: '冻结组织',
        content: '<p>组织冻结后将无法被查询，请谨慎操作！确认冻结？</p>',
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
        title: '激活组织',
        content: '<p>激活组织将可以被正常查询。确认激活？</p>',
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
        content: '<p>组织发布后将无法被删除。确认发布？</p>',
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
        title: '删除组织',
        content: '<p>删除组织将无法恢复。确认删除？</p>',
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
      return this.$service('orgs').patch(id, {
        frzn: flag
      }).then(() => {
        let msg = (flag ? '组织已冻结！' : '组织已激活！')
        this.$app.toast(msg, { type: 'success' })

        this.getList()
      })
    },

    publishItem (id, flag) {
      flag = (flag !== false)
      return this.$service('orgs').patch(id, {
        pubed: flag
      }).then(() => {
        this.$app.toast('组织已发布！', { type: 'success' })
        this.getList()
      })
    },

    removeItem (id) {
      return this.$service('orgs').remove(id).then(() => {
        this.$app.toast('组织已删除！', { type: 'success' })
        this.getList()
      })
    },

    getList () {
      const query = this.$service.getSearchQuery(this.tableQuery)

      const orgService = this.$service('orgs')

      return orgService.find({ query }).then((res) => {
        this.tableItems = res.data
        this.tableTotal = res.total
      })
    }
  },

  mounted () {
    this.getList()
  }
}
</script>
