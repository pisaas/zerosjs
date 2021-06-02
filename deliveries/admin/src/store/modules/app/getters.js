export function basic (state) {
  if (!state.basic) {
    return null
  }
  return state.basic
}

export function isLoaded (state) {
  if (state.basic && state.basic.id) {
    return true
  }
  return false
}
