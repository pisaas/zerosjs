const CatLevels = [
  { level: 0, name: '一级分类' },
  { level: 1, name: '二级分类' },
  { level: 2, name: '三级分类' },
  { level: 3, name: '四级分类' },
]

const MaxCatLevel = (CatLevels.length - 1)

export {
  MaxCatLevel,
  CatLevels
}