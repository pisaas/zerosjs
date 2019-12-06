
import { LoadingBar, Message, Modal } from 'view-design'
import { ErrorCodes } from './errors'
import HttpRequest from './http'
import Storage from './storage'

export const AppIdKey = 'zeros-appid'
export const TokenKey = 'zeros-token'

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

export function setStorage (key, val) {
  return Storage.setItem(key, val)
}

export function getStorage (key) {
  return Storage.getItem(key)
}

export function removeStorage (key) {
  return Storage.removeItem(key)
}

export function clearStorage () {
  return Storage.clear()
}

export function getAppId () {
  return getStorage(AppIdKey).then((res) => {
    return res
  })
}

export function setAppId (val) {
  return setStorage(AppIdKey, val).then(() => {
    return val
  })
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

export function delay (timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timeout);
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

export function getReqErrorMessage (error) {
  if (!error) {
    return null
  }
  
  let errorMsg = '请求数据错误'

  switch (error.name) {
    case 'NotAuthenticated':
      errorMsg = '您还没有登录或登录已超时，请重新登录'
      break
    case 'NotFound':
      errorMsg = '接口访问失败，请稍后再试'
      break
    default:
      if (error.message) {
        if (isErrorPageMessage(error.message)) {
          errorMsg = '服务器错误，请稍后再试。如有疑问，请联系管理员。'
        } else {
          errorMsg = error.message
        }
      } else if (ErrorCodes[error.code]) {
        errorMsg = ErrorCodes[error.code].desc
      }
      break
  }

  return errorMsg
}

// 消息为错误页面
export function isErrorPageMessage (message) {
  if (!message) {
    return false
  }

  if (message.indexOf('<') === 0 && message.length > 100) {
    return true
  }

  return false
}

export default {
  TokenKey,
  AppIdKey,
  getAppId,
  setAppId,
  showToast,
  showLoading,
  showModal,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  reload,
  request,
  delay,
  isErrorPageMessage,
  getReqErrorMessage
}