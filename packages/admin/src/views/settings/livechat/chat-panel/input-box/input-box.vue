<template>
  <div class="input-box row">
    <!-- <div class="btn flex-center">
      <i v-if="recordMode" class="picon icon-edit" @click="onText" />
      <i v-else class="picon icon-record" @click="onRecord" />
    </div> -->
    <div class="ipt">
      <div v-if="recordMode" class="ipt-record fs">
        <record-bar />
      </div>
      <div v-else class="ipt-text fs">
        <input ref="iptText" v-model="inputText" placeholder="说点什么" @keyup="onTextKeyup"/>
      </div>
    </div>
    <div v-if="inputText" class="btn btn-send flex-center"
      @click="sendTextMessage">发送</div>
    <!-- <div v-else class="btn btn-extend flex-center">
      <i class="picon icon-add" @click="onExtend" />
      <extend-popup ref="exPopup" />
    </div> -->
    <div v-else class="btn btn-image flex-center">
      <!-- <i class="picon icon-picture" @click="onImage" /> -->
      <image-upload ref="imgUpload" @image-selected="onImgSelected">
        <div class="btn-upload">
          <i class="picon icon-picture" />
        </div>
      </image-upload>
    </div>
  </div>
</template>

<script>
import ImageUpload from '@/components/upload/image-upload'
import RecordBar from './record-bar'
import ExtendPopup from './extend-popup'

export default {
  components: {
    ImageUpload,
    RecordBar,
    ExtendPopup
  },

  props: {
    room: Object
  },

  data () {
    return {
      inputText: '',
      recordMode: false
    }
  },

  computed: {
  },

  mounted () {
  },

  methods: {
    onText () {
      this.recordMode = false
    },

    onImgSelected (file) {
      if (!file) {
        return
      }

      this.$zero.confirm({
        title: '确认发送图片',
        content: '发送后将无法撤回无法撤回，确认继续发送？',
        onConfirm: () => {
          this.sendImageMessage()
        }
      })
    },

    onRecord () {
      this.recordMode = true
    },

    onExtend () {
      this.$refs.exPopup.open()
    },

    onTextKeyup (e) {
      if (e && e.keyCode === 13) {
        this.sendTextMessage()
      }
    },

    sendImageMessage () {
      let file = this.$refs.imgUpload.getImage()

      if (!file) {
        return
      }

      this.send({
        image: { file }
      }).then(() => {
        this.$refs.imgUpload.reset()
      })
    },

    sendTextMessage () {
      this.$refs.iptText.focus()

      let inputText = this.inputText

      if (!inputText) {
        return
      }

      this.send({
        text: inputText
      }).then(() => {
        this.inputText = ''
      })
    },

    send (cont) {
      let room = this.room
      if (!room || !cont) {
        return Promise.resolve()
      }

      return this.$store.dispatch('dy/sendMessage', {
        rcode: room.code,
        cont
      })
    }
  }
}
</script>

<style lang="less" scoped>
.input-box {
  height: 100%;
  border-top: 1px solid @border-color;
  .ipt {
    padding: 0.4rem 0.5rem;
    display: flex;
    flex: 1;
    border-radius: 5px;

    &>.ipt-text {
      padding: 0 0.5rem;
      background: white;

      input, textarea {
        width: 100%;
        padding: 0.2rem 0;
        height: 1.7rem;
        line-height: 1rem;
        border: 0;

        &::placeholder {
          opacity: 0.5;
        }
      }
    }
  }

  .btn {
    padding: 0.2rem 0.5rem 0.2rem 0.2rem;
    min-width: 3rem;

    i.picon {
      font-size: 1.5rem;
    }

    &-send {
      background: @primary;
      color: white;
      margin: 0.4rem;
      border-radius: 0.2rem;
    }
  }
}
</style>
