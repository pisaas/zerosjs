const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB']

export function between (v, min, max) {
  if (max <= min) {
    return min
  }
  return Math.min(max, Math.max(min, v))
}

export function pad (v, length = 2, char = '0') {
  let val = '' + v
  return val.length >= length
    ? val
    : new Array(length - val.length + 1).join(char) + val
}

export function truncate (v, length, prefix = '...') {
  let val = '' + v

  return val.length < length
    ? val
    : val.substr(0, length) + prefix
}

/**
 * 获取地址区域
 * @param  {[type]} addr [description]
 * @return {[type]}      [description]
 */
export function addrRegion (addr) {
  if (!addr) {
    return null
  }

  let region = [addr.province, addr.city, addr.district]
  return region
}

export function addrRegionStr (addr) {
  let region = addrRegion(addr)
  if (!region) {
    return ''
  }

  let str = [addr.province, addr.city, addr.district].filter((name) => {
    return (!!name && name !== '市辖区')
  }).join(' ')

  return str
}

/**
 * 获取地址字符串
 * @param  {[type]} addr [description]
 * @return {[type]}      [description]
 */
export function addrStr (addr) {
  let str = addrRegionStr(addr)

  if (str && addr.detail) {
    str += (' ' + addr.detail)
  }

  return str
}

export function capitalize (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// 英文字符的复数
export function pluralize (str, amount) {
  if (!amount || amount < 2) {
    return str
  }

  return str + 's'
}

export function humanStorageSize (bytes) {
  let u = 0

  while (parseInt(bytes, 10) >= 1024 && u < units.length - 1) {
    bytes /= 1024
    ++u
  }

  return `${bytes.toFixed(1)} ${units[u]}`
}

export function normalizeToInterval (v, min, max) {
  if (max <= min) {
    return min
  }

  const size = (max - min + 1)

  let index = min + (v - min) % size
  if (index < min) {
    index = size + index
  }

  return index === 0 ? 0 : index // fix for (-a % a) => -0
}

export default {
  capitalize,
  pluralize,
  between,
  pad,
  truncate,
  humanStorageSize,
  normalizeToInterval,
  addrStr,
  addrRegion,
  addrRegionStr
}
