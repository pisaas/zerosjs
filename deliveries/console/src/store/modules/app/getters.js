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

// 路由map
export function routesMap () {
  let map = {}

  function mapRoute (r, m) {
    if (r.name) {
      m[r.name] = r
    }
    if (r.children) {
      r.children.forEach((child) => {
        mapRoute(child, m)
      })
    }
  }

  routes.forEach((r) => {
    mapRoute(r, map)
  })

  return map
}

export function topRoutes () {
  let topRoutes = routes.filter((r) => {
    if (r && r.meta &&
      r.meta.hideInMenu !== true &&
      r.meta.level === 0) {
      return true
    }
    return false
  })
  return topRoutes
}

export function localAddress (state) {
  return state.localAddress
}
