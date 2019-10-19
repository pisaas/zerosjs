<template>
  <div class="cmpt-org-expand-row">
    <Row>
      <i-col span="24">
        <Card v-if="orgData" class="cmpt-section">
          <div slot="title">简介</div>
          <div class="flds">
            <div v-if="orgData.id" class="fld-item">
              <span class="label">ID：</span>
              <span class="data">{{ orgData.id }}</span>
            </div>
            <div v-if="orgData.desc" class="fld-item">
              <span class="label">简介：</span>
              <span class="data">{{ orgData.desc }}</span>
            </div>

            <div class="fld-item">
              <span class="label">创建时间：</span>
              <span class="data">{{ $util.date.format(orgData.createdAt, 'datetime') }}</span>
            </div>

            <div v-if="orgData.frzn" class="fld-item">
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
    orgId: String
  },

  data () {
    return {
      orgData: null
    }
  },

  computed: {

  },

  methods: {
    getData () {
      let orgId = this.orgId

      if (!orgId) {
        return
      }

      this.$service('orgs').get(orgId).then(res => {
        this.orgData = res
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
