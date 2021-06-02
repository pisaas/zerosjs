export function endsWith (str, exprStr) {
  if (!str || !exprStr || exprStr.length > str.length) {
    return false
  }

  return (str.substring(str.length - exprStr.length) === exprStr)
}

export function startsWith (str, exprStr) {
  if (!str || !exprStr || exprStr.length > str.length) {
    return false
  }

  return (str.substr(0, exprStr.length) === exprStr)
}

export default {
  endsWith,
  startsWith
}
