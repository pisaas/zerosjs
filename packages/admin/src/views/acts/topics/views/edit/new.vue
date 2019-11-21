<template>
  <page>
    <page-section>
      <tpc-steps :current="0" />
    </page-section>

    <page-section title="基本信息">
      <Form ref="form" :model="formModel" :rules="formRules" :label-width="80">
        <FormItem label="标题" required prop="name">
          <Input v-model="formModel.name" :maxlength="50" placeholder="请输入活动标题 (100字以内)" />
        </FormItem>
        <FormItem label="分类" required prop="catid">
          <cat-selector v-model="formModel.catid" transfer />
        </FormItem>
      </Form>

      <div slot="footer">
        <Button class="q-mr-sm" @click="onCancel">取消</Button>
        <Button type="primary" @click="onNext">继续</Button>
      </div>
    </page-section>
  </page>
</template>

<script>
import { getTopicCat } from '../../common'
import { TpcSteps } from '../../components/tpc-editor'
import CatSelector from '../../components/cat-selector'

export default {
  components: {
    TpcSteps,
    CatSelector
  },

  data () {
    return {
      formModel: {},
      formRules: {
        name: [ { required: true, message: '请输入名称', trigger: 'blur' } ],
        catid: [ { required: true, message: '请选择分类', trigger: 'blur' } ]
      }
    }
  },

  mounted () {
    let { catid } = this.$route.query

    if (catid) {
      this.$set(this.formModel, 'catid', catid)
    }
  },

  methods: {
    onCancel () {
      this.$router.tryPush({
        name: 'app:act:topic:list'
      })
    },

    onNext () {
      this.save().then((res) => {
        debugger
        if (!res || !res.id) {
          return
        }

        this.$router.tryPush({
          name: 'app:act:topic:edit',
          query: { id: res.id }
        })
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
    },
  }
}
</script>