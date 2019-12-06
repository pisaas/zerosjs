<template>
  <page>
    <page-section list-section>
      <div>
        <Tabs class="no-content" :value="tabName" @on-click="onTabsClick">
          <div slot="extra" class="q-mx-md">
            <image-actions ref="imgActions" :visible="tabName === 'image'"
              @submit="onActionSubmit" />

            <audio-actions ref="audioActions" :visible="tabName === 'audio'"
              @submit="onActionSubmit" />
          </div>

          <TabPane label="图片" name="image" />
          <TabPane label="音频" name="audio" />
          <TabPane label="视频" name="video" />
        </Tabs>
      </div>

      <div>
        <image-list v-if="tabName === 'image'" ref="list" />
        <audio-list v-if="tabName === 'audio'" ref="list" />
      </div>
    </page-section>
  </page>
</template>

<script>
import ImageList from './image-list'
import ImageActions from './image-actions'

import AudioList from './audio-list'
import AudioActions from './audio-actions'

export default {
  components: {
    ImageList,
    ImageActions,
    AudioList,
    AudioActions
  },

  props: {
  },

  data () {
    return {
      tabName: null
    }
  },

  watch: {
  },

  mounted () {
    let { type } = this.$route.query
    this.tabName = type || 'image'
  },

  methods: {
    onTabsClick (name) {
      if (name === this.tabName) {
        return
      }

      this.tabName = name
      
      this.$router.tryPush({
        name: 'app:ops:resc:materials',
        query: { type: name }
      })
    },

    onActionSubmit (name, result) {
      let list = this.$refs.list

      if (list && list.reload) {
        list.reload()
      }
    }
  }
}
</script>