<template>
  <Form v-if="formModel" class="reg-editor" ref="form"
    :model="formModel" :rules="formRules" :label-width="120">
    <FormItem label="名称" required prop="name">
      <Input v-model="formModel.name" :maxlength="50" placeholder="请输入注册名称 (100字以内)" />
    </FormItem>
    <FormItem label="编号" required prop="code">
      <Input v-model="formModel.code" :maxlength="20" placeholder="请输入注册编号 (100字以内)"
        :disabled="!isAllowedEdit('code')" />
    </FormItem>
    <FormItem label="排序号" prop="sn">
      <InputNumber v-model="formModel.sn"></InputNumber>
    </FormItem>
    <FormItem label="描述" prop="desc">
      <Input v-model="formModel.desc" type="textarea" :maxlength="200"
        :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入描述 (200字以内)" />
    </FormItem>
  </Form>
</template>

<script>
export default {
  components: {
  },

  data () {
    return {
      editMode: 'create', // 编辑模式（update, create）
      pid: null,
      regId: null,
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
    create (pid) {
      this.reset()
      this.editMode = 'create'
      this.pid = pid

      return Promise.resolve()
    },

    update (regId) {
      this.reset()
      this.editMode = 'update'
      this.regId = regId

      return this.loadData()
    },

    reset () {
      this.regId = null
      this.formModel = {
        sn: 1000
      }

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

        let regService = this.$service('regs')

        if (editMode === 'create') {
          formModel.pid = this.pid
          formModel.type = 'json'
          return regService.create(formModel)
        } else {
          return regService.update(this.regId, formModel)
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
      if (!this.regId) {
        this.formModel = {}
        this.$refs.form.resetFields()

        return Promise.resolve()
      }

      return this.$service('regs').get(this.regId).then((res) => {
        let formModel = res
        this.formModel = formModel
        return formModel
      })
    }
  }
}

</script>

<style lang="less" scoped>
</style>
