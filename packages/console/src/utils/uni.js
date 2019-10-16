
import { LoadingBar, Message, Modal } from 'view-design'

export function showToast (options) {
  if (typeof options === 'string') {
    options = {
      title: options
    }
  }

  let opts = Object.assign({
    type: 'info'
  }, options)

  if (!opts.content) {
    opts.content = opts.title || ''
  }

  if (!opts.duration) {
    if (opts.content.length < 10) {
      opts.duration = 3
    } else {
      opts.duration = (2 + parseInt(2 * (opts.content.length / 10)))
    }
  }

  Message[opts.type](opts)
}

export function showLoading (type) {
  if (type === false) {
    type === 'finish'
  }
  LoadingBar[type]()
}

export function showModal (options) {
  let opts = Object.assign({
    type: 'info'
  }, options)

  Modal[opts.type](opts)
}

// 重新加载页面(兼容微信端刷新)
export function reload (url) {
  if (!url) {
    // url = (window.top.location.href + '?timestamp=' + new Date().getTime())
    url = (window.location.protocol + '//' + window.location.host + '?ts=' + new Date().getTime() + '/' + window.location.hash)
  }

  window.top.location.href = url
}

export default {
  showToast,
  showLoading,
  showModal,
  reload
}