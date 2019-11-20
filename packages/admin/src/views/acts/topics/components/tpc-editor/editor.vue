<template>
  <Form v-if="formModel" class="tpc-editor" ref="form"
    :model="formModel" :rules="formRules" :label-width="120">
    <FormItem label="标题" required prop="name">
      <Input v-model="formModel.name" :maxlength="50" placeholder="请输入活动标题 (100字以内)" />
    </FormItem>
    <Row>
      <i-col span="12">
        <FormItem label="编号" required prop="code">
          <Input v-model="formModel.code" :maxlength="20" placeholder="请输入编号 (100字以内)"
            :disabled="!isAllowedEdit('code')" />
        </FormItem>
      </i-col>
      <i-col span="12">
      </i-col>
    </Row>
    <FormItem label="描述" prop="desc">
      <Input v-model="formModel.desc" type="textarea" :maxlength="2000"
        :autosize="{minRows: 5, maxRows: 10}" placeholder="请输入描述 (2000字以内)" />
    </FormItem>
  </Form>
</template>

<script>
const Permissions = {
  'w': '可编辑',
  'd': '可删除',
  'c': '可创建节点', // 是否可创建子节点
  'l': '可锁定'
}

export default {
  components: {
  },

  data () {
    return {
      Permissions,
      editMode: 'create', // 编辑模式（update, create）
      catId: null,
      tpcId: null,
      formModel: {},
      formRules: {
        name: [ { required: true, message: '请输入组织名', trigger: 'blur' } ],
        code: [ { required: true, message: '请输入组织编号', trigger: 'blur' } ]
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
