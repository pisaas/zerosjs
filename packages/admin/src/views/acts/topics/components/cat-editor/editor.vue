<template>
  <Form v-if="formModel" class="cat-editor" ref="form"
    :model="formModel" :rules="formRules" :label-width="120">
    <FormItem label="名称" required prop="name">
      <Input v-model="formModel.name" :maxlength="50" placeholder="请输入名称 (100字以内)" />
    </FormItem>
    <Row>
      <i-col span="12">
        <FormItem label="编号" required prop="code">
          <Input v-model="formModel.code" :maxlength="20" placeholder="请输入编号 (100字以内)"
            :disabled="!isAllowedEdit('code')" />
        </FormItem>
      </i-col>
      <i-col span="12">
        <FormItem label="排序号" prop="sn">
          <InputNumber v-model="formModel.sn"></InputNumber>
        </FormItem>
      </i-col>
    </Row>
    <FormItem label="权限" prop="modes">
      <CheckboxGroup v-model="formModel.modes">
        <Checkbox v-for="(lbl, key) in Permissions" :label="key" :key="key"
          :disabled="key==='w'">{{ lbl }}</Checkbox>
      </CheckboxGroup>
    </FormItem>
    <FormItem label="描述" prop="desc">
      <Input v-model="formModel.desc" type="textarea" :maxlength="200"
        :autosize="{minRows: 5, maxRows: 10}" placeholder="请输入描述 (200字以内)" />
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
      pid: null,
      catId: null,
      formModel: {},
      formRules: {
        name: [ { required: true, message: '请输入类型名', trigger: 'blur' } ],
        code: [ { required: true, message: '请输入类型编号', trigger: 'blur' } ]
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

    update (catId) {
      this.reset()
      this.editMode = 'update'
      this.catId = catId

      return this.loadData()
    },

    reset () {
      this.pid = null
      this.catId = null
      this.formModel = {
        sn: 1000,
        modes: ['w', 'd', 'c']
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

        let catService = this.$service('cats')

        if (editMode === 'create') {
          formModel.pid = this.pid
          formModel.taxid = 'topic'
          formModel.type = 'json'
          return catService.create(formModel)
        } else {
          return catService.patch(this.catId, formModel)
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
      if (!this.catId) {
        this.formModel = {}
        this.$refs.form.resetFields()

        return Promise.resolve()
      }

      return this.$service('cats').get(this.catId).then((res) => {
        let formModel = res
        this.formModel = formModel

        this.$emit('load', res)
        
        return formModel
      })
    }
  }
}

</script>

<style lang="less" scoped>
</style>
