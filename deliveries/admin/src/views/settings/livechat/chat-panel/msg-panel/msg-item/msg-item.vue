<template>
  <div v-if="msgContent" class="msg-item">
    <div v-if="!message.seq && msgTimestamp" class="msg-ts">
      <span class="chip">{{ $util.date.format(msgTimestamp, "MM月DD日 HH:mm") }}</span>
    </div>
    <div :class="`msg-body row  ${isMe ? 'left': 'right'}`">
      <div class="msg-avatar">
        <img :src="$resc.avatar(msgUser.code)" />
      </div>
      <div :class="`msg-main panel-shadow ${isMe ? 'left': 'right'}`">
        <text-msg v-if="msgContent.text" :message="message" />
        <image-msg v-if="msgContent.image" :message="message"
          @img-click="onImgClick" />
      </div>
      <div v-if="msgStatus" class="msg-status flex-center">
        <div v-if="msgStatus == 1" class="sending">
          <spinner class="spinner" size="16" type="spiral" />
        </div>
        <div v-else-if="msgStatus == 4" class="sent_fail"
          @click="onResend">
          <i class="picon icon-alert" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TextMsg from './text-msg'
import ImageMsg from './image-msg'

export default {
  components: {
    TextMsg,
    ImageMsg
  },

  props: {
    room: Object,
    message: Object
  },

  data () {
    return {
    }
  },

  computed: {
    user () {
      return this.$store.getters['usr/basic']
    },

    msgContent () {
      if (!this.message) {
        return null
      }
      return this.message.c
    },

    msgStatus () {
      if (!this.message) {
        return null
      }
      return this.message.status
    },

    msgUser () {
      if (!this.message) {
        return null
      }
      return this.message.u
    },

    msgTimestamp () {
      if (!this.message) {
        return null
      }
      return this.message.sts || this.message.ts
    },

    isMe () {
      let msgUser = this.msgUser
      let user = this.user

      if (user && msgUser && user.code === msgUser.code) {
        return true
      }

      return false
    }
  },

  mounted () {
  },

  methods: {
    onResend () {
      this.$emit('resend', this.message)
    },

    onImgClick (image) {
      this.$emit('img-click', image)
    }
  }
}
</script>

<style lang="less" scoped>
.msg-ts {
  text-align: center;
  padding: 0.5rem;
}

.msg-avatar {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0 0.5rem;
  img {
    border-radius: 0.2rem;
    width: 2.5rem;
  }
}

.msg-body {
  padding: 0.5rem;

  &.right {
    flex-direction: row-reverse;
  }
}

.msg-status {
  padding: 0 0.5rem;

  i.picon {
    font-size: 1.2rem;
  }

  &>.sending {
    &>.spinner {
      opacity: 0.2;
      width: 16px;
      height: 16px;
    }
  }

  &>.sent_fail {
    color: @negative;
  }
}

.msg-main {
  background: white;
  border-radius: 0.2rem;
  padding: 0.2rem 0.5rem;
  max-width: calc(~"100% - 9rem");
  position: relative;

  &.left {
    margin-left: 5px;
    &:before {
      content: "";
      position: absolute;
      left:0;
      top: 0.9rem;
      border: 5px solid transparent;
      border-right-color: white;
      margin: 0 0 0 -10px;
    }
  }

  &.right {
    margin-right: 5px;
    &:after {
      content: "";
      position: absolute;
      right: 0;
      top: 0.9rem;
      border: 5px solid transparent;
      border-left-color: white;
      margin: 0 -10px 0 0;
    }
  }
}
</style>
