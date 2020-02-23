import Quill from 'quill'
import VideoJs from 'video.js'

const BlockEmbed = Quill.import('blots/block/embed');

export default class VideoBlot extends BlockEmbed {
  static create({ data, options }) {
    let domId = ('videojs_' + new Date().getTime())

    let dataSetup = Object.assign({
      type: 'video/mp4',
      poster: data.thumb,
      controls: true,
      autoplay: false,
      sources: [{
        type: data.mime,
        src: data.path
      }]
    }, options)
    
    this.domId = domId
    this.dataSetup = dataSetup

    let node = super.create()
    
    node.setAttribute('id', domId)
    node.setAttribute('data-setup', this.stringify(dataSetup))
    node.style.backgroundImage=`url(${data.thumb})`

    // VideoJs(node)

    return node;
  }

  handleLoad () {
  }

  static stringify(data) {
    return JSON.stringify(data)
  }

  static value(node) {
    return node.getAttribute('data-setup')
  }
}

VideoBlot.blotName = 'zerosVideo'
VideoBlot.className = 'ql-video';
VideoBlot.tagName = 'video'
