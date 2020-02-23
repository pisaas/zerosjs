export function setAppBasic (state, payload) {
  state.basic = Object.assign({}, state.basic, payload)
}

/**
 * 设置App是否已初始化
 * @param {[type]} state   [description]
 * @param {[type]} payload [description]
 */
export function setAppInitialized (state, payload) {
  state.appInitialized = payload
}

/**
 * 设置appConnected
 * @param {[type]} state   [description]
 * @param {[type]} payload [description]
 */
export function setAppConnected (state, payload) {
  state.appConnected = payload
}

/**
 * 设置appSubscribed
 * @param {[type]} state   [description]
 * @param {[type]} payload [description]
 */
export function setAppSubscribed (state, payload) {
  state.appSubscribed = payload
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

/**
 * 设置设置App Main
 * @param {[type]} state   [description]
 * @param {[type]} payload [description]
 */
export function setAppMain (state, payload) {
  let appMain = state.appMain

  if (payload == null) {
    if (appMain && appMain.$app) {
      appMain.$app.main = null
    }
  } else if (payload.$app) {
    payload.$app.main = payload
  }

  state.appMain = payload
}

/**
 * 设置显示App Home Menu
 * @param {[type]} state   [description]
 * @param {[type]} payload [description]
 */
export function setAppHomeMenu (state, payload) {
  state.appHomeMenu = payload
}
