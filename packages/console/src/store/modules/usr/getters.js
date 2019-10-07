export function basic (state) {
  if (!state.basic) {
    return null
  }
  return state.basic
}

export function isLogin (state) {
  if (state.basic && state.basic.id) {
    return true
  }
  return false
}

export function displayName (state) {
  if (!state.basic) {
    return 'unknown'
  }
  let { nickname, email } = state.basic
  return nickname || email || '?'
}
