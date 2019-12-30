<template>
  <div v-if="audio" class="audio-card">
    <div class="card-head" :style="{ 'backgroundImage': `url(${audio.thumb})` }" />
    <div class="card-body">
      <div class="name text-ellipsis" :title="audio.name">{{ audio.name }}</div>
      <div class="info">
        <span class="status">{{ audio.statusName }}</span>
        <span class="ts q-ml-md">{{ $util.date.format(audio.updatedAt) }}</span>
      </div>
    </div>
    <div class="card-tail">
      <div v-if="!disabled" class="play-action">
        <Button v-if="playing" type="primary" shape="circle" icon="ios-pause" @click="onPause"></Button>
        <Button v-else type="primary" shape="circle" icon="ios-play" @click="onPlay"></Button>
      </div>

      <div v-if="isCheckTranscoding" class="play-action">
        <div class="inline">
          <Spin v-if="checking"></Spin>
          <Tooltip v-else content="检查转码" placement="top" transfer>
            <Button type="primary" shape="circle" icon="ios-refresh"
              @click="onCheckTranscoding"></Button>
          </Tooltip>
        </div>
      </div>

      <div class="duration">
        {{ $util.format.prettySeconds(audio.extra.duration) }}
      </div>
    </div>
  </div>
</template>

<script>
import { checkPersistent } from '@resc-components/utils'

export default {
  props: {
    audio: Object,
    disabled: Boolean,
    checkTranscoding: Boolean
  },

  data () {
    return {
      playing: false,
      checking: false
    }
  },

  computed: {
    isCheckTranscoding () {
      if (!this.audio) {
        return false
      }
      return this.checkTranscoding && (this.audio.status === 'transcoding')
    }
  },

  methods: {
    onPlay () {
      this.playing = true
      this.$media.playBgAudio(this.audio.path)
    },

    onPause () {
      this.playing = false
      this.$media.stopBgAudio()
    },

    onCheckTranscoding () {
      this.doCheckTranscoding()
    },

    doCheckTranscoding () {
      if (!this.isCheckTranscoding || this.checking) {
        return
      }

      let audio = this.audio

      this.checking = true
      checkPersistent(audio.id).then((res) => {
        this.checking = false

        if (res.status === audio.status) {
          return
        }

        this.$emit('change', res)
      }).catch(() => {
        this.checking = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.audio-card {
  @cardRadius: 5px;
  padding: 5px;

  display: flex;
  border: 1px solid @light-border-color;
  border-radius: @cardRadius;
    
  .card-head {
    width: 60px;
    height: 60px;
    border-radius: @cardRadius;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  .card-body {
    flex: 1;
    padding: 10px;
    overflow: hidden;
  }
  
  .card-tail {
    width: 80px;
    padding: 0px;
    text-align: center;
  }

  .play-action {
    padding: 5px;
  }
}
</style>