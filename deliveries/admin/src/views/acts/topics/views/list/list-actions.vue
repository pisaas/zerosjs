<template>
  <div v-show="visible" class="list-actions page-actions">
    <Button type="primary" icon="md-add" @click="onNew">新建</Button>
    <tpc-editor-modal ref="tpcEditorModal" @submit="onEditSubmit" />
  </div>
</template>

<script>
import { TpcEditorModal } from '../../components/tpc-editor'

export default {
  components: {
    TpcEditorModal
  },

  props: {
    name: String,
    visible: Boolean
  },

  methods: {
    onNew () {
      this.openCreate()
    },

    onEditSubmit (e) {
      this.$emit('edit', this.name, e)
      this.$emit('submit', this.name, e)
    },

    openCreate () {
      this.$refs.tpcEditorModal.openCreate()
    },

    openUpdate (id) {
      if (!id) {
        return
      }
      
      this.$refs.tpcEditorModal.openUpdate(id)
    }
  }
}
</script>