import classNames from 'classnames'

import { Quill } from 'vue2-editor'
import VideoJs from 'video.js'

import AudioBlot from './blots/audio'
import VideoBlot from './blots/video'

Quill.register(AudioBlot)
Quill.register(VideoBlot)

// 在toolbar上展示每天相关功能，如添加audio等
export default class ZerosMedia {
  constructor(quill, options) {
    if (!options) {
      return
    }

    this.quill = quill
    this.options = Object.assign({}, options)
    this.audioEl = document.querySelector(".ql-toolbar .ql-audio")

    this.update()
  }

  update () {
    let baseClass = "ivu-icon ql-icon"

    let audioCls = classNames([baseClass, {
      "ivu-icon-md-musical-notes": true,
      "ql-icon-audio": true
    }])

    if (this.audioEl) {
      this.audioEl.innerHTML = `<i class="${audioCls}" />`
    }
  }
}