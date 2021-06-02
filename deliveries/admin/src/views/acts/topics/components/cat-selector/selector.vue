<template>
  <div class="cat-selector" :class="{ inline: inline }">
    <div v-if="readonly" class="cat-names">
      <span>{{ pathNamesStr }}</span>
    </div>
    <template v-else>
      <Cascader :class="{ inline: inline }"
        v-model="currentValue" :data="optionData"
        filterable :transfer="transfer"
        :disabled="disabled"
        trigger="hover" placeholder="请选择话题分类"
        @on-change="onChange"></Cascader>
      <Button v-if="!disabled && refresh" type="text" class="text-link q-ml-xs"
        @click="onRefresh">刷新</Button>
    </template>
  </div>
</template>

<script>
import { getTopicCatPathIds, getTopicCatPathNamesStr } from '../../common'

export default {
  props: {
    value: String,
    transfer: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    refresh: Boolean,
    inline: Boolean
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
    },

    pathNamesStr () {
      return getTopicCatPathNamesStr(this.lastValue)
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
      this.loadOptions(true)
    },

    reset () {
      this.currentValue = []
    },

    async loadCurrentValue () {
      let value = this.value
      let pathIds = getTopicCatPathIds.call(this, value)

      this.currentValue = pathIds
    },

    async loadOptions (force) {
      await this.$store.dispatch('tpc/loadAllCats', { force })
      this.optionData = this.$store.getters['tpc/catTree']

      await this.loadCurrentValue()
    }
  }
}
</script>