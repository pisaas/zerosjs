const CatLevels = [
  { level: 0, name: '一级分类' },
  { level: 1, name: '二级分类' },
  { level: 2, name: '三级分类' },
  { level: 3, name: '四级分类' },
]

const MaxCatLevel = (CatLevels.length - 1)

function newTopic (catid) {
  this.$router.tryPush({
    name: 'app:act:topic:new',
    query: { catid }
  })
}

function editTopic (id) {
  this.$router.tryPush({
    name: 'app:act:topic:edit',
    query: { id }
  })
}

function getTopicCat (catid) {
  if (!catid) {
    return null
  }
  
  let catItems = this.$store.getters['tpc/catItems']

  let catItem = catItems.find((it) => {
    return it && it.id === catid
  })

  return catItem
}

export {
  MaxCatLevel,
  CatLevels,
  newTopic,
  editTopic,
  getTopicCat
}