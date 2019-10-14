<template>
  <div class="org-expand-row">
    <Row>
      <i-col span="24">
        <Card v-if="appData" class="cmpt-section">
          <div slot="title">简介</div>
          <div class="flds">
            <div v-if="appData.id" class="fld-item">
              <span class="label">ID：</span>
              <span class="data">{{ appData.id }}</span>
            </div>
            <div v-if="appData.desc" class="fld-item">
              <span class="label">简介：</span>
              <span class="data">{{ appData.desc }}</span>
            </div>
            <div class="fld-item">
              <span class="label">创建时间：</span>
              <span class="data">{{ $util.date.format(appData.createdAt, 'datetime') }}</span>
            </div>
            <div v-if="appData.frzn" class="fld-item">
              <span class="label">状态：</span>
              <span class="data">已冻结</span>
            </div>
          </div>
        </Card>
      </i-col>
    </Row>
  </div>
</template>

<script>
export default {
  components: {
  },

  props: {
    appId: String
  },

  data () {
    return {
      appData: null
    }
  },

  computed: {

  },

  methods: {
    getData () {
      let appId = this.appId

      if (!appId) {
        return
      }

      this.$service('apps').get(appId).then(res => {
        this.appData = res
      })
    }
  },

  mounted () {
    this.getData()
  }
}
</script>

<style lang="less" scoped>
</style>
