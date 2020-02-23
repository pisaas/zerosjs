<template>
  <div v-if="video" class="video-card" :class="{ disabled: disabled }">
    <div class="card-head" :style="{ 'backgroundImage': `url(${video.thumb})` }" />
    <div class="card-body">
      <div class="name text-ellipsis" :title="video.name">{{ video.name }}</div>
      <div class="info">
        <span class="status">{{ video.statusName }}</span>
        <span class="ts q-ml-md">{{ $util.date.format(video.updatedAt) }}</span>
      </div>
    </div>
    <div class="card-tail">
      <div v-if="!disabled" class="play-action">
        <div class="inline">
          <Button type="primary" shape="circle" icon="ios-play" @click="onPlay"></Button>
        </div>
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
        {{ $util.format.prettySeconds(video.extra.duration) }}
      </div>
    </div>
  </div>
</template>

<script>
import { checkPersistent } from '@resc-components/utils'

export default {
  props: {
    video: Object,
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
      if (!this.video) {
        return false
      }
      return this.checkTranscoding && (this.video.status === 'transcoding')
    }
  },
  
  methods: {
    onPlay () {
      if (!this.video || !this.video.pubed) {
        return
      }

      this.$emit('play', this.video)
    },

    onCheckTranscoding () {
      this.doCheckTranscoding()
    },

    doCheckTranscoding () {
      if (!this.isCheckTranscoding || this.checking) {
        return
      }

      let video = this.video

      this.checking = true
      checkPersistent(video.id).then((res) => {
        this.checking = false

        if (res.status === video.status) {
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
.video-card {
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
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

  .play-action {
    padding: 5px;
    width: 100%;
    text-align: center;
  }

  &.disabled {
    @diabledOpacity: 0.5;

    .card-head {
      opacity: @diabledOpacity;
    }

    .card-body {
      opacity: @diabledOpacity;
    }

    .card-tail {
      .duration {
        opacity: @diabledOpacity;
      }
    }
  }
}
</style>


<style lang="less">
.play-action {
  button.ivu-btn {
    display: flex;
    justify-content: center;
    align-items: center;

    &>i.ivu-icon {
      font-size: 18px;
      font-weight: bold;
      line-height: 1;
    }
  }
}
</style>