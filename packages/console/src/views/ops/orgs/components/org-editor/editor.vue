<template>
  <Form v-if="formModel" class="org-editor" ref="form"
    :model="formModel" :rules="formRules" :label-width="120">
    <FormItem label="组织名称" required prop="name">
      <Input v-model="formModel.name" :maxlength="50" placeholder="请输入组织名称 (50字以内)" />
    </FormItem>
    <FormItem label="组织编号" required prop="code" disabled>
      <Input v-model="formModel.code" :maxlength="20" placeholder="请输入组织编号 (20字以内)"
        :disabled="!isAllowedEdit('code')" />
    </FormItem>
    <FormItem label="组织简介" required prop="desc">
      <Input v-model="formModel.desc" type="textarea" :maxlength="200"
        :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入组织简介 (200字以内)" />
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
      orgId: null,
      formModel: {},
      formRules: {
        name: [ { required: true, message: '请输入组织名', trigger: 'blur' } ],
        code: [ { required: true, message: '请输入组织编号', trigger: 'blur' } ],
        desc: [ { required: true, message: '请输入组织描述', trigger: 'blur' } ]
      }
    }
  },

  computed: {
  },

  mounted () {
  },

  methods: {
    create () {
      this.reset()
      this.editMode = 'create'

      return Promise.resolve()
    },

    update (orgId) {
      this.reset()
      this.editMode = 'update'
      this.orgId = orgId

      return this.loadData()
    },

    reset () {
      this.orgId = null
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

        let orgService = this.$service('orgs')

        if (editMode === 'create') {
          return orgService.create(formModel)
        } else {
          return orgService.update(orgId, formModel)
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
      if (!this.orgId) {
        this.formModel = {}
        this.$refs.form.resetFields()

        return Promise.resolve()
      }

      return this.$service('orgs').get(this.orgId).then((res) => {
        let formModel = res
        this.formModel = formModel
        return formModel
      })
    }
  }
}

</script>

<style lang="less" scoped>
@logoPhotoSize: 160px;

.logo-photo {
  height: @logoPhotoSize;
  border-radius: 4px;

  &>i {
    opacity: 0.5;
    line-height: @logoPhotoSize - 30;
  }

  &>img {
    border-radius: 4px;
    max-width: @logoPhotoSize - 10;
    max-height: @logoPhotoSize - 10;
  }
}
</style>
