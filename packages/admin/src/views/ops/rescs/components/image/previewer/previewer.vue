<template>
  <div v-show="isVisible" class="image-previewer">
    <div class="previewer-body">
      <swiper ref="imageSwiper" class="previewer-swiper" :class="{ first: isFirst, last: isLast }"
        :options="{}">
        <!-- slides -->
        <swiper-slide v-for="it in imageItems" :key="it.id" class="image-slide">
          <div>
            <img :src="it.thumb" />
            <div class="image-title">
              <span>{{ it.name }}</span>
              <span class="q-ml-lg">大小：{{ $util.filesize(it.fsize) }}</span>
            </div>
          </div>
        </swiper-slide>

        <!-- Optional controls -->
        <div class="swiper-pagination"  slot="pagination"></div>
        <div class="swiper-button-prev" slot="button-prev" @click="onPrev"></div>
        <div class="swiper-button-next" slot="button-next" @click="onNext"></div>
        <div class="swiper-scrollbar"   slot="scrollbar"></div>
      </swiper>
    </div>

    <div v-if="currentItem" class="previewer-origin">
      <a class="origin-btn" target="_blank" :href="currentItem.path">
        <span>查看原图</span>
      </a>
    </div>
    <div class="previewer-close" @click="onClose"></div>

    <div class="previewer-mask"></div>
  </div>
</template>

<script>
export default {
  props: {
    items: Array
  },

  data () {
    return {
      isVisible: false,
      imageItems: this.items,
      currentId: null
    }
  },

  computed: {
    swiper() {
      return this.$refs.imageSwiper.swiper
    },

    itemIds () {
      let items = this.imageItems || []

      let ids = items.map((it) => {
        return it.id
      })

      return ids
    },

    currentIndex () {
      let currentId = this.currentId
      if (!currentId) {
        return 0
      }

      let currentIndex = this.itemIds.indexOf(currentId)

      return currentIndex
    },

    currentItem () {
      let imageItems = this.imageItems || []
      return imageItems[this.currentIndex]
    },

    isFirst () {
      return this.currentIndex <= 0
    },

    isLast () {
      return (this.currentIndex >= (this.imageItems.length - 1))
    }
  },

  watch: {
    items () {
      this.imageItems = this.items
    },

    currentIndex () {
      this.swiper.slideTo(this.currentIndex)
    }
  },

  methods: {
    onClose () {
      this.close()
    },

    onPrev () {
      this.slidePrev()
    },

    onNext () {
      this.slideNext()
    },

    slidePrev () {
      let currentId = this.currentId

      if (!this.isFirst) {
        currentId = this.itemIds[this.currentIndex - 1]
      }

      this.currentId = currentId
    },

    slideNext () {
      let currentId = this.currentId

      if (!this.isLast) {
        currentId = this.itemIds[this.currentIndex + 1]
      }

      this.currentId = currentId
    },

    slideTo (id) {
      this.currentId = id
    },

    close () {
      this.isVisible = false
    },

    open (id) {
      this.isVisible = true

      if (!id && this.itemIds.length) {
        id = this.itemIds[0]
      }

      this.slideTo(id)
    }
  }
}
</script>

<style lang="less" scoped>
.image-previewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;

  .previewer-body {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 200;
    color: white;

    .previewer-swiper {
      height: 100%;
      width: 100%;

      &.first {
        .swiper-button-prev {
          opacity: 0.3;
        }
      }

      &.last {
        .swiper-button-next {
          opacity: 0.3;
        }
      }

      .image-slide {
        padding: 80px 80px;
        display: flex;
        justify-content: center;
        align-items: center;

        img {
          max-width: 100%;
          max-height: 100%;
        }
      }

      .image-title {
        opacity: 0.8;
        padding: 5px 10px;
      }
    }
  }

  .previewer-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #222;
    opacity: 0.95;
    z-index: 100;
  }

  .previewer-origin {
    position: absolute;
    z-index: 200;
    bottom: 50px;
    left: 0;
    width: 100%;
    text-align: center;
    color: white;

    .origin-btn {
      display: inline-block;
      padding: 10px 30px;
      border-radius: 20px;
      background: @dark;
      font-size: 14px;
      cursor: pointer;
      opacity: 0.8;

      &:hover {
        opacity: 0.5;
      }
    }
  }

  .previewer-close {
    position: absolute;
    top: 40px;
    right: 40px;
    z-index: 200;
    cursor: pointer;
    width: 50px;
    height: 50px;

    &:before,&:after {
      content: "";
      display: inline-block;
      width: 40px;
      height: 3px;
      position: absolute;
      top: 50%;
      left: 50%;
      background-color: @light;
      transform-origin: center;
    }

    &:before {
      transform: translate(-50%, -50%) rotate(45deg);
    }

    &:after {
      transform: translate(-50%, -50%) rotate(-45deg);
    }
  }
}
</style>