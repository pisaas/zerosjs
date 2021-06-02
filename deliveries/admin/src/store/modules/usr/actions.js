import apis from '@/apis'

export function update ({ commit, state }, payload) {
  let { verb, data } = payload

  return apis.usr.update(verb, data).then((res) => {
    if (res) {
      commit('setUserBasic', res)
    }
    return res
  })
}

// 更新基础信息
export function updateBasic (context, payload) {
  if (!payload || !payload.field || !payload.val) {
    return Promise.resolve(null)
  }

  let { field, val } = payload

  return update(context, {
    verb: 'basic',
    data: { field, val }
  })
}

// 更新用户照片
export function updateMobile (context, payload) {
  if (!payload || !payload.val) {
    return Promise.resolve(null)
  }

  let { val } = payload

  return update(context, {
    verb: 'mobile',
    data: { val }
  })
}

// 更新用户照片
export function updateAvatar ({ commit, state }, payload) {
  if (!payload || !payload.file) {
    return Promise.resolve(null)
  }

  let { file } = payload

  return apis.app.uploadFile(file).then((res) => {
    let data = { val: res.key }
    return apis.usr.update('avatar', data).then((res1) => {
      if (res1) {
        commit('setUserAvatar', res1.avatar)
      }

      return res1
    })
  })
}

// 更新地址
export function submitAddress ({ commit, state }, payload) {
  if (!payload || !payload.verb) {
    return Promise.resolve()
  }

  let verb = payload.verb

  return Promise.resolve().then(() => {
    if (verb === 'delete') {
      let code = payload.code
      if (!code) {
        return
      }

      return apis.usr.deleteAddr(code)
    } else if (verb === 'save') {
      let data = payload.data
      if (!data) {
        return
      }
      return apis.usr.postAddr(data)
    }
  }).then((res) => {
    if (res.default || res.default === null) {
      commit('setUserAddr', res.default)
    }
    return res
  })
}
