<template>
  <div class="tpc-editor flex-center">
    <page-section class="form-section fixed" title="设置标题和分类">
      <Form v-if="formModel" class="form" ref="form"
        :model="formModel" :rules="formRules" :label-width="50">
        <FormItem label="标题" required prop="name">
          <Input v-model="formModel.name" :maxlength="50"
            placeholder="请输入活动标题 (100字以内)" />
        </FormItem>
        <FormItem label="分类" required prop="catid">
          <cat-selector ref="selCat" v-model="formModel.catid" transfer />
        </FormItem>
      </Form>
      <div slot="footer" class="form-footer">
        <div class="actions text-right">
          <Button @click="onCancel">取消</Button>
          <Button type="primary" class="q-ml-md" @click="onSubmit">继续</Button>
        </div>
      </div>
    </page-section>
  </div>
</template>

<script>
import CatSelector from '../cat-selector'

export default {
  components: {
    CatSelector
  },

  data () {
    return {
      formModel: {},
      formRules: {
        name: [ { required: true, message: '请输入话题名称', trigger: 'blur' } ],
        catid: [ { required: true, message: '请选择话题分类', trigger: 'blur' } ]
      }
    }
  },

  computed: {
  },

  mounted () {
  },

  methods: {
    onCancel () {
      this.reset()
      this.$emit('cancel')
    },

    onSubmit () {
      this.submit()
    },

    load (catid) {
      this.reset(catid)

      return Promise.resolve()
    },

    reset (catid) {
      this.formModel = {
        catid: catid || null
      }

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }

      if (this.$refs.selCat) {
        this.$refs.selCat.reset()
      }
    },

    submit () {
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
        return tpcService.create(formModel).then((res) => {
          this.$emit('create', res)
        })
      })
    }
  }
}

</script>

<style lang="less" scoped>
.tpc-editor {
  height: 650px;
  background: @bg-color;
}

.form-header {
  font-size: 16px;
}

.form-section {
  padding: 20px 30px;
  width: 500px;
  height: 500px;

  .form-footer {
    padding: 20px 30px;
  }
}
</style>