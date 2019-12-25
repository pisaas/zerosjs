<template>
  <page-section no-padding transparent>
    <div class="flex">
      <div v-for="item in dataItems" :key="item.id"
        class="app-item">
        <app-card :app="item" @edit="onEdit" @click="onClick" />
      </div>
      <div class="app-item">
        <app-new-card @create="onCreate" />
      </div>
      <div class="app-item">
        <app-new-card @create="onCreate" />
      </div>
      <div class="app-item">
        <app-new-card @create="onCreate" />
      </div>
      <div class="app-item">
        <app-new-card @create="onCreate" />
      </div>
    </div>

    <app-editor-modal ref="editorModal" @submit="onEditSubmit" />
  </page-section>
</template>

<script>
  import { AppCard, AppNewCard } from '../components/app/card'
  import { AppEditorModal } from '../components/app/editor'

  export default {
    components: {
      AppCard,
      AppNewCard,
      AppEditorModal
    },

    props: {
    },

    data () {
      return {
        dataItems: [],
        dataTotal: 0,
        dataQuery: {
          search: null,
          page: 1,
          size: 12,
          sort: { id: -1 },
          equalFields: ['id'],
          fuzzyFields: [ 'code', 'name' ]
        }
      }
    },

    methods: {
      onCreate () {
        this.$refs.editorModal.open('create');
      },

      onEdit (data) {
        if (!data || !data.id) {
          return
        }

        this.$refs.editorModal.open('edit', { id: data.id })
      },

      onClick (data) {
        if (!data || !data.id) {
          return
        }
        
        this.$app.loadApp(data.id)
      },

      onEditSubmit () {
        this.$app.toast('保存成功！', { type: 'success' })

        this.$refs.editorModal.close()
        this.loadData()
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
        this.dataQuery.page = 1
        this.loadData()
      },

      onPageChange (val) {
        this.dataQuery.page = val
        this.loadData()
      },

      removeItem (id) {
        return this.$service('apps').remove(id).then(() => {
          this.$app.toast('应用已删除！', { type: 'success' })

          this.loadData()
        })
      },

      loadData () {
        const query = this.$service.getSearchQuery(this.dataQuery)

        return this.$service('apps').find({ query }).then((res) => {
          this.dataItems = res.data
          this.dataTotal = res.total
        })
      }
    },

    mounted () {
    }
  }
</script>

<style lang="less" scoped>
.app-item {
  min-width: (@screen-size-sm / 3);
  justify-content: space-between;

  padding-right: 10px;
  padding-bottom: 10px;
}

@media (max-width: @screen-size-sm) {
  .app-item {
    padding-right: 0px;
    width: 100%;
  }
}

@media (min-width: @screen-size-sm) and (max-width: @screen-size-md){
  .app-item {
    width: 50%;

    &:nth-child(2n) {
      padding-right: 0px;
    }
  }
}

@media (min-width: @screen-size-md){
  .app-item {
    width: 33.33%;

    &:nth-child(3n) {
      padding-right: 0px;
    }
  }
}
</style>
