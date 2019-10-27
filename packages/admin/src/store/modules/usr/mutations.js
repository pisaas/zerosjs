/**
 * 设置用户信息
 * @param {[type]} state   [description]
 * @param {[type]} payload [description]
 */
export function setBasic (state, payload) {
  if (!payload) {
    return
  }

  state.basic = payload || null
}

/**
 * 设置用户地址
 * @param {[type]} state   [description]
 * @param {[type]} payload [description]
 */
export function setAddr (state, payload) {
  if (!state.basic) {
    return
  }

  let basic = state.basic
  basic.address = (payload || null)

  state.basic = Object.assign({}, basic)
}

// 设置用户avatar
export function setAvatar (state, payload) {
  if (!state.basic || !payload) {
    return
  }

  let basic = state.basic
  let avatar = payload

  if (avatar.indexOf('?') < 0) {
    avatar += '?' + new Date().getTime()
  }

  basic.avatar = avatar
  state.basic = Object.assign({}, basic)
}
