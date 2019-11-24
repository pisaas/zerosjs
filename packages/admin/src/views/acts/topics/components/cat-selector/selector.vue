<template>
  <div class="cat-selector inline">
    <Cascader v-model="currentValue" class="inline"
      :data="optionData" filterable :transfer="transfer"
      trigger="hover" placeholder="请选择话题分类"
      @on-change="onChange"></Cascader>
    <Button type="text" class="text-link q-ml-xs" @click="onRefresh">刷新</Button>
  </div>
</template>

<script>
import { getTopicCat } from '../../common'

export default {
  props: {
    value: String,
    transfer: Boolean
  },

  watch: {
    value (val) {
      if (val === this.lastValue) {
        return
      }

      this.loadCurrentValue()
    },

    currentValue () {
      this.$emit('input', this.lastValue);
    }
  },

  data () {
    return {
      currentValue: [],
      optionData: []
    }
  },

  computed: {
    lastValue () {
      let curVal = this.currentValue
      if (!curVal || !curVal.length) {
        return null
      }
      return curVal[curVal.length - 1]
    }
  },

  mounted () {
    this.loadOptions()
  },

  methods: {
    onChange (vals, datas) {
      this.$emit('change', this.lastValue, vals, datas)
    },

    onRefresh () {
      this.loadCatOptions(true)
    },

    async loadCurrentValue () {
      let value = this.value
      let valItem = getTopicCat.call(this, value)
      
      if (!valItem || !valItem.path) {
        return
      }
      let paths = valItem.path.split('.')
      if (!paths || !paths.length) {
        return
      }
      if (paths[0] === '0') {
        paths = paths.slice(1)
      }

      paths.push(value)

      this.currentValue = paths
    },

    async loadOptions (force) {
      await this.$store.dispatch('tpc/loadAllCats', { force })
      this.optionData = this.$store.getters['tpc/catTree']

      await this.loadCurrentValue()
    }
  }
}
</script>