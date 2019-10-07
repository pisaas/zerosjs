<template>
  <div class="images-upload">
    <div class="image-list row">
      <draggable v-model="imgItems" class="row" :options="{draggable: '.image-item', direction:'horizontal'}">
        <div v-for="(it, i) in imgItems" class="image-item flex-center" :key="i"
          :style="{'background-image': `url(${it.url})`}"
          @click="onImgPreview(i)">
          <i class="delete picon icon-close-c" @click="onImgDelete(i)" />
        </div>

        <div v-if="editMode && imgItems.length < maxItems" class="image-add flex-center">
          <div class="btn-add">
            <div><i class="picon icon-add" /></div>
            <div class="tag">{{ imgItems.length + 1 }}/{{ maxItems }}</div>
          </div>
          <input ref="imgFile" type="file" accept="image/*" @change="onImgFileSelected()" />
        </div>
      </draggable>

      <template v-if="previewerList && previewerList.length">
        <previewer ref="imgPreviewer" :list="previewerList"></previewer>
      </template>
    </div>

    <div v-transfer-dom>
      <x-dialog v-model="showImgDialog" class="images-upload-dialog"
         :dialog-style="{
           'max-width': '100%',
           'width': '100%',
           'height': '100%'
        }">
        <image-cropper ref="imgCropper" :imgRatio="imgRatio" />
        <flexbox class="action-bar">
          <flexbox-item class="q-px-sm">
            <x-button class="action-button" @click.native="onImgDialogCancel">取消</x-button>
          </flexbox-item>
          <flexbox-item class="q-px-sm">
            <x-button class="action-button" type="primary" @click.native="onImgDialogConfirm">确定</x-button>
          </flexbox-item>
        </flexbox>
      </x-dialog>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

const DefaultImageSpec = {
  MimeType: 'image/jpeg', // 图片格式
  MaxSize: 200 * 1024, // 最大图片大小 200k
  MaxWidth: 600,   // 最大图片宽度
  MaxHeight: 600,  // 最大图片高度
  Square: false  // 是否正方形
}

export default {
  components: {
    draggable,
  },

  props: {
    items: {
      type: Array,
      default () { return [] }
    },

    ratio: {
      type: Number,
      default: 10 / 10
    },

    spec: {
      type: Object,
      default () { return DefaultImageSpec }
    },

    max: {
      type: Number,
      default: 4
    }
  },

  data () {
    return {
      editMode: true,
      showImgDialog: false,
      imgSpec: this.spec,
      imgRatio: this.ratio,
      maxItems: this.max,
      imgItems: (this.items || []),
    }
  },

  watch: {
    items () {
      this.imgItems = (this.items || [])
    },

    imgItems () {
      this.$emit('change')
    }
  },

  computed: {
    previewerList () {
      if (!this.imgItems) {
        return []
      }
      let list = this.imgItems.map((p) => {
        return { src: p }
      })
      return list
    }
  },

  methods: {
    onImgDelete (idx) {
      event.stopPropagation()

      this.imgItems.splice(idx, 1)
      this.imgItems.push()
    },

    onImgPreview (idx) {
      this.$refs.imgPreviewer.show(idx)
    },

    onImgFileSelected () {
      let input = this.$refs.imgFile
      if (!input || !input.files || !input.files.length) {
        return
      }

      this.showImgDialog = true

      let file = input.files[0]
      if (file) {
        this.$refs.imgCropper.fileChange(file)
      }
    },

    onImgDialogCancel () {
      this.showImgDialog = false
      this.$refs.imgFile.value = ''
    },

    onImgDialogConfirm () {
      let imgSpec = this.imgSpec

      let clipData = this.$refs.imgCropper.getClipData()
      // let binData = this.$refs.imgCropper.getBinaryData()

      return this.$media.scalePhoto.call(this, clipData, imgSpec).then((p) => {
        // let b = this.$media.dataURItoBlob(p)
        this.imgItems.push({ url: p, base64: true })
        this.showImgDialog = false
        this.$refs.imgFile.value = ''
      })
    },

    upload (prefix) {
      // 上传base64图片
      let photoUploads = this.imgItems.map((it) => {
        if (it.key) {
          return Promise.resolve({ key: it.key })
        } else if (it.base64) {
          let bolb = this.$media.dataURItoBlob(it.url)
          return this.$apis.app.uploadFile(bolb, null, prefix).then((f) => {
            return Promise.resolve({ key: f.key })
          })
        } else if (it.url) {
          return Promise.resolve({ url: it.url })
        }
      })

      return Promise.all(photoUploads).then((res) => {
        let photos = res.filter((p) => {
          return !!p
        })
        return photos
      })
    }
  }
}
</script>

<style lang="less" scoped>
.image-item,.image-add {
  position: relative;
  border-radius: 5px;
  background: white;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  width: calc(~"25vw - 1.3rem");
  height: calc(~"25vw - 1.3rem");
  margin: 5px;

  &>i.delete {
    position: absolute;
    z-index: 10;
    top: -0.5rem;
    right: -0.5rem;
    &:before {
      background: white;
      padding: 1px;
      border-radius: 50%;
    }
  }
}

.image-add {
  color: white;
  background: @light;
  .btn-add {
    width: 100%;
    text-align: center;
  }
  input {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 100;
    left: 0;
    right: 0;
    opacity: 0;
  }
  .tag {
    font-size: 0.8rem;
    width: 100%;
  }
}

.images-upload-dialog {
  .action-bar {
    position: fixed;
    z-index: 9999;
    background: white;
    width: 100%;
    bottom: 0;
    padding: 5px 0;
  }
}
</style>
