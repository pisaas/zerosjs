<template>
  <Modal ref="newModal" v-model="showModal" :loading="loading"
    class="tpc-new-modal" title="新建话题" :width="900"
    @on-ok="onOk" @on-visible-change="onVisibleChange">
    <div class="form-section">
      <Form ref="form" class="padding" :model="formModel" :rules="formRules" :label-width="70">
        <!-- <div class="form-title">基本信息</div> -->

        <FormItem label="标题" required prop="name">
          <Input v-model="formModel.name" :maxlength="50" placeholder="请输入活动标题 (100字以内)" />
        </FormItem>
        <FormItem label="分类" required prop="catid">
          <cat-selector v-model="formModel.catid" transfer />
        </FormItem>
      </Form>
    </div>
  </Modal>
</template>

<script>
import CatSelector from '../../components/cat-selector'

export default {
  components: {
    CatSelector
  },

  data () {
    return {
      showModal: false,
      loading: true,
      formModel: {},
      formRules: {
        name: [ { required: true, message: '请输入名称', trigger: 'blur' } ],
        catid: [ { required: true, message: '请选择分类', trigger: 'blur' } ]
      }
    }
  },

  methods: {
    onOk () {
      this.save().then((res) => {
        this.resetLoading()

        if (!res || !res.id) {
          return
        }

        this.goNext(res.id)
      }).catch(() => {
        this.resetLoading()
      })
    },

    onVisibleChange (visible) {
      if (!visible) {
        this.onClose()
      }
    },

    onClose () {
      let data = this.formModel

      this.reset()
      this.$emit('on-close', data)
    },

    open () {
      this.showModal = true
    },

    close () {
      this.showModal = false
    },

    reset () {
      this.formModel = {}

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },

    resetLoading () {
      this.loading = false

      this.$nextTick(() => {
        this.loading = true
      })
    },

    save () {
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

        formModel.taxid = 'topic'
        return this.$service('tpcs').create(formModel)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.tpc-new-modal {
  .form-section {
    .form-title {
      font-size: 16px;
      font-weight: bold;
      line-height: 50px;
    }

    .form-content {
      padding: 0 50px;
      padding-bottom: 80px;
    }
  }
}
</style>
