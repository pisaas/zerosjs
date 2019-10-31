export function setBasic (state, payload) {
  state.basic = Object.assign({}, state.basic, payload)
}

// 设置App加载错误
export function setError (state, payload) {
  state.error = payload
}

/**
 * 设置App是否已初始化
 * @param {[type]} state   [description]
 * @param {[type]} payload [description]
 */
export function setInitialized (state, payload) {
  state.initialized = payload
}

/**
 * 设置appConnected
 * @param {[type]} state   [description]
 * @param {[type]} payload [description]
 */
export function setConnected (state, payload) {
  state.connected = payload
}

/**
 * 设置appSubscribed
 * @param {[type]} state   [description]
 * @param {[type]} payload [description]
 */
export function setSubscribed (state, payload) {
  state.subscribed = payload
}

/**
 * 设置当前城市信息
 * @param {[type]} city [description]
 */
export function setLocalAddress (state, payload) {
  if (!payload) {
    return
  }

  state.localAddress = payload
}
