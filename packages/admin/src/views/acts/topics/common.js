const CatLevels = [
  { level: 0, name: '一级分类' },
  { level: 1, name: '二级分类' },
  { level: 2, name: '三级分类' },
  { level: 3, name: '四级分类' },
]

const MaxCatLevel = (CatLevels.length - 1)

function getTopicCat (catid) {
  if (!catid) {
    return null
  }
  
  // eslint-disable-next-line
  let catItems = zerosApp.store.getters['tpc/catItems']

  let catItem = catItems.find((it) => {
    return it && it.id === catid
  })

  return catItem
}

function getTopicCatPathIds (catid) {
  let cat = getTopicCat(catid)

  if (!cat || !cat.path) {
    return []
  }

  let parts = cat.path.split('.')
  if (!parts || !parts.length) {
    return
  }

  if (parts[0] === '0') {
    parts = parts.slice(1)
  }

  parts.push(catid)

  return parts
}

function getTopicCatPathNames (catid) {
  let path = getTopicCatPathIds(catid)
  let names = path.map((it) => {
    let cat = getTopicCat(it)

    if (!cat) {
      return ''
    }

    return cat.name
  })

  return names
}

export {
  MaxCatLevel,
  CatLevels,
  getTopicCat,
  getTopicCatPathIds,
  getTopicCatPathNames
}