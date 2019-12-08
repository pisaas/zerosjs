<template>
  <div class="image-selector">
    <CheckboxGroup v-model="imageSelection">
      <Checkbox label="香蕉" disabled></Checkbox>
      <Checkbox label="苹果" disabled></Checkbox>
      <Checkbox label="西瓜"></Checkbox>
    </CheckboxGroup>
  </div>
</template>

<script>
export default {
  data () {
    return {
      imageSelection: [],

      listItems: [],
      listTotal: 0,

      listQuery: {
        search: null,
        page: 1,
        size: 10,
        sort: { id: -1 },
        equalFields: [ 'id' ],
        fuzzyFields: [ 'name', 'uname' ]
      }
    }
  },

  methods: {
    load () {
      
    },

    reset () {
      
    },

    async loadData () {
      let query = this.$service.getSearchQuery(this.listQuery)

      query = Object.assign({
        rtype: 'image'
      }, query)

      let result = await this.$service('rescs').find({ query })
      this.listItems = result.data
      this.listTotal = result.total
    }
  }
}
</script>