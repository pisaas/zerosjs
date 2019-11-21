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
import { TpcSteps } from '../../components/tpc-editor'

export default {
  components: {
    TpcSteps
  },

  data () {
    return {
      formModel: {},
      formRules: {
        name: [ { required: true, message: '请输入名称', trigger: 'blur' } ]
      }
    }
  },

  methods: {
    onNext () {
    }
  }
}
</script>