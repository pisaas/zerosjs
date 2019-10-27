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

export default ({ zero, Vue }) => {
  Vue.prototype.$env = env
  Vue.prototype.$util = { lodash, str, timeago, date, format, regexr }
  Vue.prototype.$errors = errors
  Vue.prototype.$storage = storage
  Vue.prototype.$uni = uni

  Vue.prototype.$apis = apis
  Vue.prototype.$service = apis.service
  Vue.prototype.$zero = initialize(zero, Vue)
}

function initialize (zero, Vue) {
  function appBasic (key) {
    let appBasic = Object.assign({}, zero.store.getters['app/basic'])

    if (!key || !appBasic) {
      return appBasic
    }
    return appBasic[key]
  }

  function userBasic (key) {
    let userBasic = zero.store.getters['usr/basic']
    if (!key || !userBasic) {
      return userBasic
    }
    return userBasic[key]
  }

  function zeroBasic (key) {
    let zeroBasic = Object.assign({}, zero.store.getters['zero/basic'])

    if (!key || !zeroBasic) {
      return zeroBasic
    }
    return zeroBasic[key]
  }

  /**
   * 返回静态文件地址
   * @param  {[type]} path [description]
   * @return {[type]}       [description]
   */
  function rescUrl (path) {
    let { id, rescDomain } =zeroBasic()
    return `${rescDomain}/apps/${id}/${path}`
  }

  /**
   * 临时资源文件地址
   * @param  {[type]} path [description]
   * @return {[type]}      [description]
   */
  function tmpRescUrl (path) {
    let tmpRescDomain = this.zeroBasic('tmpRescDomain')
    return `${tmpRescDomain}/${path}`
  }

  /**
   * 检查是否已登录
   * @return {Boolean} [description]
   */
  function isLogin () {
    return zero.store.getters['usr/isLogin']
  }

  /**
   * 登出系统
   */
  function logout () {
    apis.service.logout().then(() => {
      uni.clearStorage().catch(() => {})
    }).then(() => {
      uni.reload()
    })
  }

  function loadApp (id) {
    return zero.store.dispatch('app/load', {
      id
    }).then(() => {
      this.goHome()
    })
  }

  function isAppLoaded () {
    return zero.store.getters['app/isLoaded']
  }

  /**
   * 返回首页
   * @return {[type]} [description]
   */
  function goHome () {
    return zero.router.tryPush('/home')
  }

  /**
   * 调整到登录页面
   * @return {[type]} [description]
   */
  function goLogin () {
    return zero.router.tryPush('/login')
  }

  /**
   * 跳转错误页面
   * @return {[type]} [description]
   */
  function goError (code) {
    code = code || '404'
    return zero.router.tryPush(`/${code}`)
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
    zeroBasic,
    rescUrl,
    tmpRescUrl,
    isLogin,
    logout,
    isAppLoaded,
    loadApp,
    goLogin,
    goHome,
    goError,
    toast,
    loading,
    confirm
  }
}