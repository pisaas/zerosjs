export function menuTitle (menu) {
  if (!menu || !menu.meta) {
    return ''
  }
  return menu.meta.title
}

export function menuIcon (menu, defaultIcon) {
  if (!menu || !menu.meta) {
    return ''
  }
  return menu.meta.icon || defaultIcon || ''
}

export function retrieveVisibleRoutes (routes) {
  if (!routes || !routes.length) {
    return []
  }

  let vRoutes = []

  routes.forEach((r) => {
    if (!r) {
      return
    }

    if (r.meta && r.meta.hideInMenu === true) {
      return
    }
    
    let vr = Object.assign({}, r)
    vr.children = retrieveVisibleRoutes(r.children)
    vRoutes.push(vr)
  })

  return vRoutes;
}

export default {
  menuTitle,
  menuIcon,
  retrieveVisibleRoutes
}
