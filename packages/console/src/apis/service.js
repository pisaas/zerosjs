import io from 'socket.io-client'
import feathers from '@feathersjs/client'

import { showToast } from '@/utils/uni'
import { ErrorCodes } from '@/utils/errors'

// for rest api
// const feathers = require('@feathersjs/feathers')
// const rest = require('@feathersjs/rest-client')
import { apiDomain } from '../env'

const socket = io(`${apiDomain}`)

const client = feathers()

client.configure(feathers.socketio(socket))
client.configure(feathers.authentication({
  storageKey: 'zero-token'
}))

client.hooks({
  error: handleServiceError
})

function clientService(path) {
  return client.service(`api/console/${path}`)
}

Object.assign(clientService, client)

// for rest api
// const client = feathers();
// const restClient = rest('/api')
// client.configure(restClient.fetch(window.fetch));

// client.service('users').get('101').then((res) => {
//   console.log("service('users') get ------->", res)
// })

export default clientService

/**
 * 处理服务错误
 */
function handleServiceError (ctx) {
  let error = ctx.error

  if (!error) {
    return ctx
  }

  let params = ctx.params || {}

  let silent = (params.silent === true)
  if (ctx.data && ctx.data.silentError === true) {
    silent = true
  }

  let errorMsg = '请求数据错误'

  if (error.message) {
    errorMsg = error.message
  } else if (error.name) {
    switch (error.name) {
      case 'NotAuthenticated':
        errorMsg = '您还没有登录或登录已超时，请重新登录'
        break
      case 'NotFound':
        errorMsg = '接口访问失败，请稍后再试'
        break
      default:
        if (ErrorCodes[error.code]) {
          errorMsg = ErrorCodes[error.code].desc
        }
        break
    }
  }

  if (!silent) {
    showToast({
      type: 'error',
      title: errorMsg
    })
  }

  return ctx
}
