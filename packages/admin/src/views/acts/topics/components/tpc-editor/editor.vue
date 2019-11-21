<template>
  <Form v-if="formModel" class="tpc-editor" ref="form"
    :model="formModel" :rules="formRules" :label-width="80">
    <FormItem label="标题" required prop="name">
      <Input v-model="formModel.name" :maxlength="50"
        placeholder="请输入活动标题 (100字以内)" />
    </FormItem>
    <FormItem label="分类" required prop="catid">
      <cat-selector v-model="formModel.catid" transfer />
    </FormItem>
  </Form>
</template>

<script>
import CatSelector from '../cat-selector'

export default {
  components: {
    CatSelector
  },

  data () {
    return {
      editMode: 'create', // 编辑模式（update, create）
      catId: null,
      tpcId: null,
      formModel: {},
      formRules: {
        name: [ { required: true, message: '请输入话题名称', trigger: 'blur' } ]
      }
    }
  },

  computed: {
  },

  mounted () {
  },

  methods: {
    create (catId) {
      this.reset()
      this.editMode = 'create'
      this.catId = catId

      return Promise.resolve()
    },

    update (tpcId) {
      this.reset()
      this.editMode = 'update'
      this.tpcId = tpcId

      return this.loadData()
    },

    reset () {
      this.catId = null
      this.tpcId = null
      this.formModel = {}

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },

    save () {
      let editMode = this.editMode
      let formModel = this.formModel

      return new Promise((resolve, reject) => {
        if (!formModel) {
          return resolve(false)
        }
        this.$refs.form.validate((valid) => {
          return resolve(valid)
        })
      }).then((valid) => {
        if (!valid) {
          return false
        }

        let tpcService = this.$service('tpcs')

        if (editMode === 'create') {
          return tpcService.create(formModel)
        } else {
          return tpcService.patch(this.tpcId, formModel)
        }
      })
    },

    isAllowedEdit (field) {
      if (!field) {
        return true
      }

      switch (field) {
        case 'code':
          return !this.formModel.pubed
      }

      return true
    },

    loadData () {
      if (!this.tpcId) {
        this.formModel = {}
        this.$refs.form.resetFields()

        return Promise.resolve()
      }

      return this.$service('tpcs').get(this.tpcId).then((res) => {
        let formModel = res
        this.formModel = formModel

        this.$emit('load', this.formModel)
        
        return formModel
      })
    }
  }
}

</script>

<style lang="less" scoped>
</style>
