import fecha from 'fecha'

const MILLISECONDS_IN_DAY = 86400000
// const MILLISECONDS_IN_HOUR = 3600000
// const MILLISECONDS_IN_MINUTE = 60000

// 格式化日期
export function format (date, format) {
  let d = new Date(date)
  if (!d) return ''
  if (format === 'datetime') {
    format = 'YYYY-MM-DD HH:mm'
  } else if (format === 'full') {
    format = 'YYYY-MM-DD HH:mm:ss'
  }
  return fecha.format(d, format || 'YYYY-MM-DD')
}

// 日期简化版
export function simple (date, withTime) {
  let d = new Date(date)
  if (!d) return ''

  let nowDate = +new Date()

  let dateDiff = parseInt((nowDate - d.valueOf()) / MILLISECONDS_IN_DAY)

  if (withTime === undefined && dateDiff < 3) {
    withTime = true
  }

  let f = 'YYYY年MM月DD日'

  if (withTime) {
    f = 'YYYY年MM月DD日 HH时mm'
  }

  if (dateDiff < 180) {
    f = 'MM月DD日'

    if (withTime) {
      f = 'MM月DD日 HH时mm'
    }
  }

  return format(date, f)
}

// 解析日期
export const parse = function (str, format) {
  if (!str) {
    return new Date('')
  }

  return fecha.parse(str, format || 'YYYY-MM-DD')
}

export function addYears (date, years) {
  date.setYear(date.getYear() + years)
  return date
}

export function addMonths (date, months) {
  date.setMonth(date.getMonth() + months)
  return date
}

export function addDays (date, days) {
  date.setDate(date.getDate() + days)
  return date
}

export function addHours (date, hours) {
  date.setHours(date.getHours() + hours)
  return date
}

export function addMinutes (date, minutes) {
  date.setMinutes(date.getMinutes() + minutes)
  return date
}

export default {
  addMonths,
  addHours,
  addDays,
  parse,
  format,
  simple
}
