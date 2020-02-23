export function setBasic (state, payload) {
  state.basic = Object.assign({}, state.basic, payload)
}
