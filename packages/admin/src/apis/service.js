const feathers = require('@feathersjs/client')

import { showToast, DefaultAppIdKey } from '@/utils/uni'
import { ErrorCodes } from '@/utils/errors'

import { apiDomain } from '../env'

const clientType = 'rest'
// const clientType = 'io'
let apiBaseUrl = 'api'

const client = feathers()

if (clientType === 'rest') {
  initRestClient(client)
} else {
  apiBaseUrl = 'api/admin'
  initIoClient(client)
}

client.configure(feathers.authentication({
  storageKey: 'zero-token'
}))

client.hooks({
  before: preServiceRequest,
  error: handleServiceError
})

function clientService(path) {
  this.app = client

  return client.service(`${apiBaseUrl}/${path}`)
}

clientService.setDefAppId = (appId) => {
  return client.set(DefaultAppIdKey, appId)
}

clientService.getDefAppId = () => {
  return client.get(DefaultAppIdKey)
}

Object.assign(clientService, client, {
  getSearchQuery
})

export default clientService

function initIoClient (client) {
  const io = require('socket.io-client')
  const socket = io(`${apiDomain}`)

  client.configure(feathers.socketio(socket))

  return client
}

function initRestClient (client) {
  const axios = require('axios')

  const restClient = feathers.rest()
  client.configure(restClient.axios(axios))

  return client
}

/**
 * 获取服务查询
 */
function getSearchQuery (query, options) {
  if (!query) {
    return
  }

  query = Object.assign({}, query, options)

  let { search, page, size, sort, equalFields = [], fuzzyFields = [] } = query

  let $skip = (size * (page - 1))
  if ($skip < 0) {
    $skip = 0
  }
  if (query.total && $skip > query.total) {
    $skip = query.total
  }

  let qryObj = {
    $skip,
    $limit: size,
    $sort: sort
  }

  if (search) {
    let $or = []

    equalFields.forEach((f) => {
      $or.push({ [f]: search })
    })

    fuzzyFields.forEach((f) => {
      $or.push({ [f]: { $search: search } })
    })

    qryObj.$or = $or
  }

  return qryObj
}

/**
 * 服务提交前
 */
function preServiceRequest (ctx) {
  let query = Object.assign({}, ctx.params.query)

  let appId = clientService.getDefAppId()

  if (appId && !query.appid) {
    query.appid = appId
  }

  ctx.params.query = query

  return ctx
}

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

  switch (error.name) {
    case 'NotAuthenticated':
      errorMsg = '您还没有登录或登录已超时，请重新登录'
      break
    case 'NotFound':
      errorMsg = '接口访问失败，请稍后再试'
      break
    default:
      if (error.message) {
        errorMsg = error.message
      } else if (ErrorCodes[error.code]) {
        errorMsg = ErrorCodes[error.code].desc
      }
      break
  }

  

  if (!silent) {
    showToast({
      type: 'error',
      title: errorMsg
    })
  }

  return ctx
}
