const zeros = require('@zerosjs/client')

import uni, { showToast, AppIdKey, TokenKey } from '@/utils/uni'

import { apiDomain } from '../env'

const clientType = 'rest'
// const clientType = 'io'
let apiBaseUrl = 'api'

const client = zeros()

if (clientType === 'rest') {
  initRestClient(client)
} else {
  apiBaseUrl = 'api/admin'
  initIoClient(client)
}

client.configure(zeros.authentication({
  storageKey: TokenKey
}))

client.hooks({
  before: preServiceRequest,
  error: onServiceError
})

function clientService(path) {
  if (!path) {
    return this
  }

  return client.service(`${apiBaseUrl}/${path}`)
}

clientService.loadApp = (appId) => {
  return clientService('app').get(appId, {
    query: { verb: 'load' }
  }).then((res) => {
    if (!res || !res.id) {
      return null
    }

    return uni.setAppId(appId).then(() => {
      clientService.setAppId(appId)
      return res
    })
  })
}

clientService.reloadApp = () => {
  let appId = clientService.getAppId()

  if (!appId) {
    return Promise.resolve(null)
  }
  
  return clientService.loadApp(appId)
}

clientService.setAppId = (appId) => {
  return client.set(AppIdKey, appId)
}

clientService.getAppId = () => {
  return client.get(AppIdKey)
}

Object.assign(clientService, client, {
  getSearchQuery
})

export default clientService

function initIoClient (client) {
  const io = require('socket.io-client')
  const socket = io(`${apiDomain}`, {
    transports: ['websocket'],
    upgrade: false
  })

  socket.on('connect', () => {
    clientService.reloadApp()
  })

  client.configure(zeros.socketio(socket, {
    timeout: 300000
  }))

  return client
}

function initRestClient (client) {
  const axios = require('axios')

  const restClient = zeros.rest()
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
  let appid = clientService.getAppId()

  if (appid) {
    // rest
    if (ctx.params.headers) {
      ctx.params.headers[AppIdKey] = appid
    }
  }

  return ctx
}

/**
 * 处理服务错误
 */
function onServiceError (ctx) {
  let error = ctx.error

  if (!error) {
    return ctx
  }

  let params = ctx.params || {}

  let silent = (params.silent === true)
  if (ctx.data && ctx.data.silentError === true) {
    silent = true
  }

  let errorMsg = uni.getReqErrorMessage(error)

  if (!silent) {
    // show login modal
    
    showToast({
      type: 'error',
      title: errorMsg
    })
  }

  return ctx
}
