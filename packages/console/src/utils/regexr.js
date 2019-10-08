export const RegExTests = {
  mobile: /^((13|14|15|17|18)[0-9]{1}\d{8})$/
}

export function test (name, val) {
  let t = RegExTests[name]
  if (!t) {
    return false
  }

  return t.test(val)
}

export default {
  RegExTests,
  test
}
