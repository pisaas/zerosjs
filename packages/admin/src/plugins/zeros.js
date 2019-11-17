import lodash  from 'lodash'

import str     from '@/utils/str'
import timeago from '@/utils/timeago'
import date    from '@/utils/date'
import format  from '@/utils/format'
import regexr  from '@/utils/regexr'
import errors  from '@/utils/errors'
import storage from '@/utils/storage'
import uni     from '@/utils/uni'

import env from '@/env'
import apis from '@/apis'

export default ({ zeros, Vue }) => {
  Vue.prototype.$env = env
  Vue.prototype.$util = { lodash, str, timeago, date, format, regexr }
  Vue.prototype.$errors = errors
  Vue.prototype.$storage = storage
  Vue.prototype.$uni = uni

  Vue.prototype.$apis = apis
  Vue.prototype.$service = apis.service
  Vue.prototype.$app = initialize(zeros, Vue)
}

function initialize (zeros, Vue) {
  function appBasic (key) {
    let appBasic = Object.assign({}, zeros.store.getters['app/basic'])

    if (!key || !appBasic) {
      return appBasic
    }
    return appBasic[key]
  }

  function userBasic (key) {
    let userBasic = zeros.store.getters['usr/basic']
    if (!key || !userBasic) {
      return userBasic
    }
    return userBasic[key]
  }

  function zerosBasic (key) {
    let zerosBasic = Object.assign({}, zeros.store.getters['zeros/basic'])

    if (!key || !zerosBasic) {
      return zerosBasic
    }
    return zerosBasic[key]
  }

  /**
   * 返回静态文件地址
   * @param  {[type]} path [description]
   * @return {[type]}       [description]
   */
  function rescUrl (path) {
    let { id, rescDomain } =zerosBasic()
    return `${rescDomain}/apps/${id}/${path}`
  }

  /**
   * 临时资源文件地址
   * @param  {[type]} path [description]
   * @return {[type]}      [description]
   */
  function tmpRescUrl (path) {
    let tmpRescDomain = this.zerosBasic('tmpRescDomain')
    return `${tmpRescDomain}/${path}`
  }

  /**
   * 检查是否已登录
   * @return {Boolean} [description]
   */
  function isLogin () {
    return zeros.store.getters['usr/isLogin']
  }

  /**
   * 登出系统
   */
  function logout () {
    apis.service.logout().then(() => {
      // uni.clearStorage().catch(() => {})
    }).then(() => {
      uni.reload()
    })
  }

  function loadApp (id) {
    return zeros.store.dispatch('app/load', {
      id
    }).then(() => {
      zeros.router.goHome()
    })
  }

  function isAppLoaded () {
    return zeros.store.getters['app/isLoaded']
  }

  function toast (title, opts) {
    opts = Object.assign({ title }, opts)
    uni.showToast(opts)
  }

  function loading (type) {
    uni.showLoading(type)
  }

  function alert (opts) {
    uni.showModal(opts)
  }

  function confirm (opts) {
    opts = Object.assign({
      type: 'confirm'
    }, opts)

    uni.showModal(opts)
  }

  return {
    appBasic,
    userBasic,
    zerosBasic,
    rescUrl,
    tmpRescUrl,
    isLogin,
    logout,
    isAppLoaded,
    loadApp,
    toast,
    loading,
    alert,
    confirm
  }
}