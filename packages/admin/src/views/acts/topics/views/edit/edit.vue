<template>
  <page>
    <page-section>
      <tpc-steps :current="1" />
    </page-section>

    <page-section>
      
    </page-section>
  </page>
</template>

<script>
import { newTopic } from '../../common'

import { TpcSteps } from '../../components/tpc-editor'

export default {
  components: {
    TpcSteps
  },

  data () {
    return {
      tpcid: null,
      formModel: {},
      formRules: {
        name: [ { required: true, message: '请输入名称', trigger: 'blur' } ]
      }
    }
  },

  mounted () {
    let { id } = this.$route.query

    if (!id) {
      newTopic.call(this)
    }

    this.tpcid = id

    this.loadData()
  },

  methods: {
    onNext () {
    },

    goNext () {
      this.$router.tryPush({
        name: 'app:act:topic:pub',
        query: { id: this.tpcid }
      })
    },

    async loadData () {
      let id = this.tpcid

      let res = await this.$service('tpcs').get(id)

      if (res.pubed) {
        this.goNext()
      }
      
      this.formModel = res
    }
  }
}
</script>