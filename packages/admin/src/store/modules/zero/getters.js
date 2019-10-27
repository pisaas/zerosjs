import routes from '@/router/routes'

export function basic (state) {
  if (!state.basic) {
    return null
  }
  return state.basic
}

export function main (state) {
  return state.appMain
}

export function localAddress (state) {
  return state.localAddress
}
