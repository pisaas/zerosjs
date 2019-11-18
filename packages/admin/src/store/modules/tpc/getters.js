export function catItems (state) {
  if (!state.catList) {
    return []
  }
  return state.catList.items || []
}
