<template>
  <div class="extend-popup" v-transfer-dom>
    <popup v-model="showPopup" @on-hide="onPopupHide()"
      position="bottom"
      :popup-style="{ 'z-index': 501 }">
      <div class="cmpt-body">
        <flexbox class="action-body">
          <flexbox-item class="action-item flex-center">
            <div class="btn-action flex-center relative" v-ripple @click="onImage()">
              <div class="text-center">
                <div><i class="picon icon-picture" /></div>
                <div class="text-xsmall"><span>图片</span></div>
              </div>
            </div>
          </flexbox-item>
          <flexbox-item class="action-item flex-center">
            <div class="btn-action flex-center relative" v-ripple @click="onFile()">
              <div class="text-center">
                <div><i class="picon icon-upload" /></div>
                <div class="text-xsmall"><span>文件</span></div>
              </div>
            </div>
          </flexbox-item>
          <flexbox-item class="action-item flex-center">
            <div class="btn-action flex-center relative" v-ripple @click="onLocation()">
              <div class="text-center">
                <div><i class="picon icon-location" /></div>
                <div class="text-xsmall"><span>位置</span></div>
              </div>
            </div>
          </flexbox-item>
        </flexbox>
      </div>
    </popup>
  </div>
</template>

<script>
export default {
  components: {
  },

  props: {
  },

  data () {
    return {
      showPopup: false
    }
  },

  computed: {
  },

  watch: {
  },

  methods: {
    onImage () {
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success (res) {
          // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
          // var localIds = res.localIds
        }
      })
    },

    onFile () {

    },

    onLocation () {
      wx.getLocation({
        type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
        success (res) {
          var latitude = res.latitude // 纬度，浮点数，范围为90 ~ -90
          var longitude = res.longitude // 经度，浮点数，范围为180 ~ -180。
          // var speed = res.speed // 速度，以米/每秒计
          // var accuracy = res.accuracy // 位置精度

          wx.openLocation({
            latitude, // 纬度，浮点数，范围为90 ~ -90
            longitude, // 经度，浮点数，范围为180 ~ -180。
            name: '当前位置', // 位置名
            address: '', // 地址详情说明
            scale: 12, // 地图缩放级别,整形值,范围从1~28。默认为最大
            infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
          })
        }
      })
    },

    onPopupCancel () {
      this.hide()
    },

    onPopupHide () {
    },

    hide () {
      this.showPopup = false
    },

    open () {
      this.showPopup = true
    }
  },

  mounted () {
  }
}
</script>

<style lang="less" scoped>
.cmpt-body {
  min-height: 5rem;
  padding: 1rem;
}

.btn-action {
  width: 4rem;
  height: 4rem;
  border-radius: 5px;
  background: white;
}
</style>
