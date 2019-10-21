
import { LoadingBar, Message, Modal } from 'view-design'
import HttpRequest from './http'

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
  type = type || 'start'

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

const http = new HttpRequest()
const reqQueues = {}

export function request (options) {
  let { reqCode, reqLimit, isSocket } = options || {}

  // 限制调用频率，接口调用时设置reqCode和reqLimit, eg.
  // return request({
  //   reqCode: 'readRoomMessages',
  //   reqLimit: 1000,

  //   method: 'POST',
  //   url: '/chat/rooms/' + roomCode + '/read'
  // })
  if (reqCode) {
    let q = (reqQueues[reqCode] || {})
    let lastReqAt = q.lastReqAt || null
    let nowTime = +new Date()

    q.lastReqAt = nowTime
    reqQueues[reqCode] = q

    if (lastReqAt && reqLimit && (nowTime - lastReqAt) < reqLimit) {
      return Promise.reject(new Error('调用太频繁'))
    }
  }

  showLoading()

  return http.request(options).then((res) => {
    showLoading(false)
    return res
  }).catch((err) => {
    showLoading('error')

    let resData = handleReqError(err, options)
    return Promise.reject(resData)
  })
}

/**
 * 处理请求错误
 * @param  {[type]} error [description]
 * @return {[type]}       [description]
 */
function handleReqError (error, options) {
  let respData = null
  let silent = false

  if (options && options.silent === true) {
    silent = true
  }

  if (error.data || error.body) {
    respData = error.data || error.body
  }

  let errorMsg = '请求数据错误。'

  if (respData && typeof respData === 'string') {
    if (respData.length > 100 && error.statusText) {
      errorMsg = error.statusText
    } else {
      errorMsg = respData
    }
  } else if (respData && respData.message) {
    errorMsg = respData.message
  } else if (error.message) {
    errorMsg = error.message
  }

  if (!error || !silent) {
    if (respData == 'Not Found') {
      showToast('接口访问失败，请稍后再试。', { type: 'error' })
    }  else {
      showToast(errorMsg, { type: 'error' })
    }
  }

  if (respData && typeof respData === 'object') {
    respData.message = errorMsg
  } else {
    respData = {
      message: errorMsg
    }
  }

  return respData
}

export default {
  showToast,
  showLoading,
  showModal,
  reload,
  request
}