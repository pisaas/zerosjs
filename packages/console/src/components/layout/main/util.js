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

export default {
  menuTitle,
  menuIcon
}
