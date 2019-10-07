export function menuTitle (menu) {
  if (!menu) {
    return ''
  }
  return menu.meta.title
}

export function menuIcon (menu, defaultIcon) {
  if (!menu) {
    return ''
  }
  return menu.meta.icon || defaultIcon || ''
}

export default {
  menuTitle,
  menuIcon
}
